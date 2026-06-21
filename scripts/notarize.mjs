/**
 * afterSign hook for electron-builder — submits the macOS .app to Apple
 * for notarization so Gatekeeper accepts it without manual xattr fixes.
 *
 * electron-builder runs this script automatically after code-signing.
 * The three env vars (APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID)
 * must be present in the CI environment; otherwise the step is silently
 * skipped so unsigned local builds still work.
 *
 * @see https://www.electron.build/code-signing
 * @see https://github.com/electron/notarize
 */

import { notarize } from "@electron/notarize";

export default async function notarizeApp(context) {
  const { electronPlatformName, appOutDir } = context;

  // Only notarize on macOS
  if (electronPlatformName !== "darwin") {
    console.log("⏭️  Notarization skipped — not macOS");
    return;
  }

  // Skip silently when secrets are not configured (local / unsigned builds)
  const appleId = process.env.APPLE_ID;
  const appleAppPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleAppPassword || !teamId) {
    console.log(
      "⏭️  Notarization skipped — APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, or APPLE_TEAM_ID not set",
    );
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`🍎 Notarizing ${appPath} …`);

  await notarize({
    appPath,
    appleId,
    appleIdPassword: appleAppPassword,
    teamId,
  });

  console.log("✅ Notarization complete");
}
