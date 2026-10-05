# QRight 右键扫码

一个 Chrome 扩展（Manifest V3）：在网页上右键二维码图片，可以直接访问或复制解码出的内容。

```
右键图片 → QRight ┬ 直接访问   在新标签页打开解码结果
                  └ 复制内容   复制到剪贴板
```

- **直接访问**：结果是网址或 `weixin://` 这类 Scheme，就直接打开；`www.xxx.com` 这类没写协议的会自动补上；其他文本像在地址栏输入一样交给默认搜索引擎。
- **复制内容**：写入剪贴板，页面右上角提示复制了什么。
- 完全本地解码（[jsQR](https://github.com/cozmo/jsQR)），不联网。
- 能处理没有白边、尺寸很小、反色、透明底和 SVG 格式的二维码。

## 安装（开发者模式）

1. 打开 `chrome://extensions`
2. 打开右上角的「开发者模式」
3. 点「加载已解压的扩展程序」，选择本目录

修改代码后，在扩展页面点 QRight 卡片上的刷新按钮即可。

## 目录结构

| 文件 | 作用 |
| --- | --- |
| `manifest.json` | 扩展配置 |
| `background.js` | Service Worker：注册右键菜单、取图片、打开或复制、页面提示 |
| `offscreen.html` / `offscreen.js` | 离屏文档：用 Canvas 解码图片、写剪贴板 |
| `lib/jsQR.js` | 二维码解码库（jsQR 1.4.0） |
| `icons/` | 图标，由 `node scripts/make-icons.mjs` 生成 |
| `_locales/` | 中英文文案（菜单、提示、扩展名称） |
| `scripts/package.sh` | 打包上架用的 zip，输出到 `dist/` |
| `store/` | 商店上架资料：文案与权限说明（`LISTING.md`）、截图与宣传图 |
| `PRIVACY.md` | 隐私政策 |

## 取图片的方式

1. 先在离屏文档里直接 `fetch` 图片地址（扩展有 `<all_urls>` 权限，不受跨域限制）。
2. 如果失败（需要登录 Cookie、有防盗链，或者是 `blob:` 地址），就在图片所在的页面里 `fetch` 一次，转成 data URL 再解码。

## 发布到 Chrome 应用商店

```bash
./scripts/package.sh
```

然后按 [store/LISTING.md](store/LISTING.md) 填写后台信息。

## License

MIT。`lib/jsQR.js` 来自 [jsQR](https://github.com/cozmo/jsQR)，Apache-2.0 许可。
