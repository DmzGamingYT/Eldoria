cd /tmp && rm -rf qua-mon-real && mkdir qua-mon-real && cd qua-mon-real

echo '== 1. Test the actual OGA mirror URL given by the researcher =='
URL='https://opengameart.org/sites/default/files/Animated%20Monster%20Pack%20by%20%40Quaternius.zip'
curl -sL --fail -A 'Mozilla/5.0' --max-time 30 -I "$URL" 2>&1 | head -10
echo
echo '== 2. Try full download =='
if curl -sL --fail -A 'Mozilla/5.0' --max-time 120 -o monster.zip "$URL" 2>&1; then
  sz=$(stat -f '%z' monster.zip 2>/dev/null || stat --printf='%s' monster.zip 2>/dev/null)
  file monster.zip
  echo "Got $sz bytes"
  if [ "$sz" -gt 1000 ]; then
    echo "EXTRACT NOW"
    mkdir unpacked
    unzip -q monster.zip -d unpacked/ 2>&1
    echo
    echo '== 3. GLBs found =='
    find unpacked -type f -iname '*.glb' | head -50
    echo
    echo '== 4. GLB basenames (unique) =='
    find unpacked -type f -iname '*.glb' -exec basename {} .glb \; | sort -u
    echo
    echo '== 5. Total GLB count =='
    find unpacked -type f -iname '*.glb' | wc -l
    echo
    echo '== 6. PNG inventory (for visual reference) =='
    find unpacked -type f -iname '*.png' -exec basename {} .png \; | sort -u | head -30
    echo
    echo '== 7. License / README files =='
    find unpacked -type f \( -iname 'README*' -o -iname 'License*' -o -iname '*.txt' -o -iname 'credits*' \) -exec ls -la {} \;
  fi
else
  echo "DOWNLOAD FAILED"
  ls -la
fi

echo
echo '== 8. Final du -sk =='
du -sk unpacked/ 2>&1 || echo 'unpack missing'
