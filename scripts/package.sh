#!/usr/bin/env bash
# 打包上传 Chrome 应用商店用的 zip：只包含扩展运行需要的文件。
# 用法：./scripts/package.sh   →  dist/qright-<version>.zip
set -euo pipefail
cd "$(dirname "$0")/.."

version=$(node -p "require('./manifest.json').version")
out="dist/qright-${version}.zip"
mkdir -p dist
rm -f "$out"
zip -qr "$out" manifest.json background.js offscreen.html offscreen.js lib icons _locales -x '*.DS_Store'
echo "$out"
unzip -l "$out" | tail -n +4 | sed '$d' | sed '$d' | awk '{print "  " $4}'
