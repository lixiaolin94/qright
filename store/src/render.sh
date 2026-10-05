#!/usr/bin/env bash
# 用无头 Chrome 把 shot.html 渲染成商店素材，输出到 store/assets/
set -euo pipefail
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT=../assets
mkdir -p "$OUT"
shot() { # 文件名 宽 高 hash
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --allow-file-access-from-files --window-size="$2,$3" --screenshot="$OUT/$1" \
    "file://$PWD/shot.html#$4" >/dev/null 2>&1
  echo "$OUT/$1"
}
for lang in zh en; do
  shot "screenshot-1-open-$lang.png" 1280 800 "scene=menu&lang=$lang"
  shot "screenshot-2-copy-$lang.png" 1280 800 "scene=copy&lang=$lang"
  shot "promo-small-$lang.png" 440 280 "scene=tile&lang=$lang"
done
