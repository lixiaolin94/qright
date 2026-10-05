# Chrome 应用商店上架资料

后台地址：https://chrome.google.com/webstore/devconsole
上传包：`./scripts/package.sh` 生成的 `dist/qright-<version>.zip`

## 商品详情（Store listing）

**类别**：工具（Tools）  **语言**：English（默认）+ 中文（简体）

### English

**Name**（来自 `_locales/en`）：QRight - Right-click QR Scanner

**Summary**（来自 manifest，≤132 字符）：Right-click a QR code image on any web page to open or copy its content. Decodes locally, no upload.

**Description**：

```
See a QR code on a web page? No need to reach for your phone.

Right-click the QR code image → QRight → choose:

• Open — opens the decoded link in a new tab. Works with web addresses, addresses without "https://", and app links such as weixin://. Plain text goes to your default search engine, just like typing it into the address bar.
• Copy — copies the decoded content to your clipboard, with a small confirmation on the page.

Handles the QR codes you actually find on the web: tightly cropped images with no white border, tiny thumbnails, inverted (light-on-dark) codes, transparent PNGs and SVG images.

Private by design
• Decoding happens entirely in your browser.
• No servers, no analytics, no tracking, no ads.
• Open source: https://github.com/lixiaolin94/qright
```

### 中文（简体）

**名称**（来自 `_locales/zh_CN`）：QRight 右键扫码

**摘要**：右键网页上的二维码图片，直接访问或复制解码内容。本地解码，不上传任何数据。

**详细说明**：

```
在电脑上看到网页里的二维码，不用再掏出手机扫。

右键二维码图片 → QRight → 选择：

• 直接访问：在新标签页打开解码出的链接。支持普通网址、不带 https:// 的网址，以及 weixin:// 这类应用链接；纯文本会交给默认搜索引擎，和在地址栏输入一样。
• 复制内容：把解码内容写入剪贴板，页面右上角会提示复制了什么。

能识别网页上常见的“难扫”二维码：没有白边、尺寸很小、反色（深底浅码）、透明底 PNG 以及 SVG 图片。

注重隐私
• 解码完全在浏览器本地完成
• 没有服务器、没有统计、没有追踪、没有广告
• 开源：https://github.com/lixiaolin94/qright
```

### 图片素材（`store/assets/`，由 `store/src/render.sh` 生成）

| 用途 | 文件 | 尺寸 |
| --- | --- | --- |
| 商店图标 | `icons/icon128.png` | 128×128 |
| 截图（英文） | `screenshot-1-open-en.png`、`screenshot-2-copy-en.png` | 1280×800 |
| 截图（中文） | `screenshot-1-open-zh.png`、`screenshot-2-copy-zh.png` | 1280×800 |
| 小型宣传图块 | `promo-small-en.png` / `promo-small-zh.png` | 440×280 |

**网站**：https://github.com/lixiaolin94/qright
**支持网址**：https://github.com/lixiaolin94/qright/issues

## 隐私权规范（Privacy practices）

**单一用途（Single purpose）**：

> Decode QR code images on web pages from the right-click menu, then open or copy the decoded content.

**权限理由（Permission justification）**：

| 权限 | 填写内容 |
| --- | --- |
| `contextMenus` | Adds "QRight → Open / Copy" to the right-click menu on images. This is the extension's only entry point. |
| `offscreen` | An offscreen document is used to decode the image with a canvas (supports SVG/WebP) and to write the result to the clipboard, which service workers cannot do. |
| `clipboardWrite` | Writes the decoded text to the clipboard when the user chooses "Copy". |
| `scripting` | Injects a small function into the current page only after the user clicks a QRight menu item: to show a confirmation message, and to load the image from within the page when it can't be loaded directly (e.g. blob: URLs or images that require the page's cookies). |
| `search` | When the user chooses "Open" and the decoded content is not a URL, passes it to the user's default search engine, the same as typing it into the address bar. |
| Host permission `<all_urls>` | QR code images are usually served from a different domain (CDN) than the page, so the extension needs to fetch the image the user right-clicked, on any site. It is only used after the user clicks a QRight menu item; nothing is read in the background. |

**是否使用远程代码（Remote code）**：No, I am not using remote code.（jsQR 已打包在 `lib/` 中）

**数据使用（Data usage）**：所有类别都**不勾选**（不收集任何用户数据），并勾选下面三项声明：

- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**隐私权政策网址**：https://github.com/lixiaolin94/qright/blob/main/PRIVACY.md

## 发布前自查

- [ ] `manifest.json` 版本号已更新
- [ ] `./scripts/package.sh` 重新打包
- [ ] 在 `chrome://extensions` 加载解压后的 `dist` 包，实测「直接访问」和「复制内容」
- [ ] 开发者账号已付 5 美元注册费，并验证了联系邮箱
