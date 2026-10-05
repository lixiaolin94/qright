# QRight Privacy Policy / 隐私政策

_Last updated: 2026-10-05_

## English

QRight does **not** collect, store, transmit, or sell any personal data.

- **Decoding happens locally.** When you choose "Open" or "Copy" from the right-click menu, QRight loads the image you right-clicked and decodes it inside your browser. The image and the decoded content are never sent to any server operated by the developer or any third party.
- **Image loading.** To read the image, QRight requests the image's own URL, in the same way the web page already does. If that fails, it requests the image again from within the page you are viewing.
- **Open.** The decoded content is opened in a new tab. If it is not a web address, it is passed to your browser's default search engine, exactly as if you had typed it into the address bar.
- **Copy.** The decoded content is written to your system clipboard.
- **No analytics, no tracking, no remote code.** QRight contains no analytics or advertising code and does not load any code from the network.

### Permissions

| Permission | Why it is needed |
| --- | --- |
| `contextMenus` | Adds the "QRight → Open / Copy" items to the right-click menu on images. |
| Host access to all sites (`<all_urls>`) | Lets QRight read the image you right-clicked (images are often hosted on a different domain from the page) and show a small confirmation message on the page. Nothing is read unless you click a QRight menu item. |
| `scripting` | Fallback image loading from within the page, and showing the confirmation message. |
| `offscreen` | Decodes the image with a canvas and writes to the clipboard in a hidden extension page. |
| `clipboardWrite` | Copies the decoded content when you choose "Copy". |
| `search` | Sends non-URL text to your default search engine when you choose "Open". |

### Contact

Questions: open an issue at https://github.com/lixiaolin94/qright/issues

## 中文

QRight **不会**收集、存储、传输或出售任何个人数据。

- **本地解码**：在右键菜单里选择「直接访问」或「复制内容」后，QRight 读取你右键的那张图片，在浏览器本地完成解码。图片和解码结果都不会发送给开发者或任何第三方的服务器。
- **读取图片**：QRight 按图片原本的地址读取图片，和网页显示这张图时一样；失败时再在当前网页里重新读取一次。
- **直接访问**：在新标签页打开解码结果；如果不是网址，就交给浏览器的默认搜索引擎，和在地址栏里输入一样。
- **复制内容**：把解码结果写入系统剪贴板。
- **没有统计、没有追踪、没有远程代码**：QRight 不包含任何统计或广告代码，也不会从网络加载代码。

如有问题，请在 https://github.com/lixiaolin94/qright/issues 提交 issue。
