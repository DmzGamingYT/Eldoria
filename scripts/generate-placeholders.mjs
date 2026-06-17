/**
 * Generates minimal valid GLB placeholder models for Eldoria character assets.
 * Creates raw GLB binary directly (no browser APIs needed).
 *
 * GLB = 12-byte header + JSON chunk + optional binary chunk.
 * Each placeholder is a simple multi-box humanoid mesh.
 *
 * Run: node scripts/generate-placeholders.mjs
 */
import fs from "fs";
import path from "path";

const PUBLIC = path.resolve("public/assets/characters");

/**
 * Create a minimal GLB binary for a humanoid shape made of boxes.
 * Uses a single mesh with merged vertex data (positions + normals).
 *
 * @param {string} name - GLTF node/mesh name
 * @param {number[]} color - [r, g, b] in 0-1 range
 * @returns {Buffer} Complete GLB file
 */
function createHumanoidGLB(name, color) {
  // Define box parts: [x, y, z, w, h, d] (center + half-sizes)
  const parts = [
    [0, 0.95, 0, 0.25, 0.45, 0.15],   // torso
    [0, 1.58, 0, 0.18, 0.18, 0.18],    // head (sphere approx as cube)
    [-0.36, 0.95, 0, 0.06, 0.35, 0.06], // left arm
    [0.36, 0.95, 0, 0.06, 0.35, 0.06],  // right arm
    [-0.13, 0.35, 0, 0.08, 0.35, 0.08], // left leg
    [0.13, 0.35, 0, 0.08, 0.35, 0.08],  // right leg
  ];

  // Each box = 8 vertices, 12 triangles (36 indices)
  const totalVertices = parts.length * 8;
  const totalIndices = parts.length * 36;

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const indices = new Uint16Array(totalIndices);

  let vOff = 0, iOff = 0, vBase = 0;

  for (const [cx, cy, cz, hw, hh, hd] of parts) {
    // 8 vertices of a box
    const verts = [
      [-hw, -hh, -hd], [+hw, -hh, -hd], [+hw, +hh, -hd], [-hw, +hh, -hd],
      [-hw, -hh, +hd], [+hw, -hh, +hd], [+hw, +hh, +hd], [-hw, +hh, +hd],
    ];
    // Normals (same order)
    const norms = [
      [0, -1, 0], [0, -1, 0], [0, 0, -1], [0, 0, -1],
      [0, -1, 0], [0, -1, 0], [0, 0, +1], [0, 0, +1],
    ];
    for (let i = 0; i < 8; i++) {
      positions[vOff++] = cx + verts[i][0];
      positions[vOff++] = cy + verts[i][1];
      positions[vOff++] = cz + verts[i][2];
      normals[vOff - 3] = norms[i][0];
      normals[vOff - 2] = norms[i][1];
      normals[vOff - 1] = norms[i][2];
    }
    // 12 triangles (2 per face, 6 faces)
    const tris = [
      0,2,1, 0,3,2, // front
      4,5,6, 4,6,7, // back
      0,1,5, 0,5,4, // bottom
      2,3,7, 2,7,6, // top
      0,4,7, 0,7,3, // left
      1,2,6, 1,6,5, // right
    ];
    for (const idx of tris) {
      indices[iOff++] = vBase + idx;
    }
    vBase += 8;
  }

  // Pack into GLB binary buffer
  const binData = {
    positions,
    normals,
    indices,
  };

  // Calculate byte lengths
  const posBytes = positions.byteLength;
  const normBytes = normals.byteLength;
  const idxBytes = indices.byteLength;
  // Pad each buffer view to 4-byte alignment
  const posAligned = Math.ceil(posBytes / 4) * 4;
  const normAligned = Math.ceil(normBytes / 4) * 4;
  const idxAligned = Math.ceil(idxBytes / 4) * 4;
  const totalBin = posAligned + normAligned + idxAligned;

  // Create the binary buffer
  const binBuffer = Buffer.alloc(totalBin);
  Buffer.from(positions.buffer).copy(binBuffer, 0);
  Buffer.from(normals.buffer).copy(binBuffer, posAligned);
  Buffer.from(indices.buffer).copy(binBuffer, posAligned + normAligned);

  const [r, g, b] = color;

  // glTF JSON
  const gltf = {
    asset: { version: "2.0", generator: "Eldoria Placeholder Generator" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name }],
    meshes: [{
      name: `${name}_mesh`,
      primitives: [{
        attributes: { POSITION: 0, NORMAL: 1 },
        indices: 2,
        material: 0,
      }],
    }],
    materials: [{
      name: `${name}_material`,
      pbrMetallicRoughness: {
        baseColorFactor: [r, g, b, 1.0],
        metallicFactor: 0.0,
        roughnessFactor: 0.8,
      },
    }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: totalVertices,
        type: "VEC3",
        max: [1, 2, 1],
        min: [-1, 0, -1],
      },
      {
        bufferView: 1,
        componentType: 5126,
        count: totalVertices,
        type: "VEC3",
      },
      {
        bufferView: 2,
        componentType: 5123, // UNSIGNED_SHORT
        count: totalIndices,
        type: "SCALAR",
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBytes, target: 34962 },
      { buffer: 0, byteOffset: posAligned, byteLength: normBytes, target: 34962 },
      { buffer: 0, byteOffset: posAligned + normAligned, byteLength: idxBytes, target: 34963 },
    ],
    buffers: [{ byteLength: totalBin }],
  };

  // Convert JSON to string and pad to 4-byte alignment
  let jsonStr = JSON.stringify(gltf);
  // Pad with spaces to 4-byte boundary
  while (jsonStr.length % 4 !== 0) jsonStr += " ";
  const jsonBytes = Buffer.from(jsonStr, "utf8");

  // GLB header: magic(4) + version(4) + length(4)
  // JSON chunk: length(4) + type(4) + data
  // BIN chunk: length(4) + type(4) + data
  const totalLength = 12 + (8 + jsonBytes.length) + (8 + binBuffer.length);
  const glb = Buffer.alloc(totalLength);

  let off = 0;
  // Header
  glb.writeUInt32LE(0x46546C67, off); off += 4; // magic "glTF"
  glb.writeUInt32LE(2, off); off += 4;           // version 2
  glb.writeUInt32LE(totalLength, off); off += 4;  // total length

  // JSON chunk
  glb.writeUInt32LE(jsonBytes.length, off); off += 4;
  glb.writeUInt32LE(0x4E4F534A, off); off += 4;  // type "JSON"
  jsonBytes.copy(glb, off); off += jsonBytes.length;

  // BIN chunk
  glb.writeUInt32LE(binBuffer.length, off); off += 4;
  glb.writeUInt32LE(0x004E4942, off); off += 4;  // type "BIN\0"
  binBuffer.copy(glb, off);

  return glb;
}

async function main() {
  const models = [
    {
      name: "UniversalBaseCharacters",
      file: "UniversalBaseCharacters.glb",
      dir: path.join(PUBLIC, "base"),
      color: [0.75, 0.68, 0.60], // Neutral skin tone
    },
    {
      name: "WizardRobes",
      file: "WizardRobes.glb",
      dir: path.join(PUBLIC, "outfits"),
      color: [0.29, 0.23, 0.54], // Purple wizard
    },
    {
      name: "Civilian",
      file: "Civilian.glb",
      dir: path.join(PUBLIC, "outfits"),
      color: [0.54, 0.42, 0.23], // Brown merchant
    },
    {
      name: "RangerWithHood",
      file: "RangerWithHood.glb",
      dir: path.join(PUBLIC, "outfits"),
      color: [0.23, 0.42, 0.23], // Green ranger
    },
  ];

  for (const { name, file, dir, color } of models) {
    fs.mkdirSync(dir, { recursive: true });
    const glb = createHumanoidGLB(name, color);
    const outPath = path.join(dir, file);
    fs.writeFileSync(outPath, glb);
    console.log(`✓ ${path.relative(process.cwd(), outPath)} (${glb.length} bytes)`);
  }

  console.log("\n✅ All placeholder character models generated.");
  console.log("Replace these with real Quaternius GLBs when available.");
}

main();
