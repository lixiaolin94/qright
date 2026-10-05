const MENU_ROOT = 'qright';
const MENU_OPEN = 'qright-open';
const MENU_COPY = 'qright-copy';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: MENU_ROOT, title: 'QRight', contexts: ['image'] });
    chrome.contextMenus.create({ id: MENU_OPEN, parentId: MENU_ROOT, title: chrome.i18n.getMessage('menuOpen'), contexts: ['image'] });
    chrome.contextMenus.create({ id: MENU_COPY, parentId: MENU_ROOT, title: chrome.i18n.getMessage('menuCopy'), contexts: ['image'] });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_OPEN && info.menuItemId !== MENU_COPY) return;

  let text;
  try {
    text = await decodeImage(info, tab);
  } catch (err) {
    console.warn('[QRight] decode failed:', err);
    toast(tab, chrome.i18n.getMessage('toastNotFound'), 'error');
    return;
  }

  if (info.menuItemId === MENU_OPEN) {
    await openContent(text, tab);
  } else {
    try {
      await sendToOffscreen({ type: 'copy', text });
      toast(tab, chrome.i18n.getMessage('toastCopied', truncate(text, 80)));
    } catch (err) {
      console.warn('[QRight] copy failed:', err);
      toast(tab, chrome.i18n.getMessage('toastCopyFailed'), 'error');
    }
  }
});

// ---------- 解码 ----------

async function decodeImage(info, tab) {
  const src = info.srcUrl;
  if (!src) throw new Error('no image src');

  // 1. 扩展有 <all_urls> 权限，大多数图片可以直接在离屏文档里 fetch。
  if (!src.startsWith('blob:')) {
    try {
      return await sendToOffscreen({ type: 'decode', src });
    } catch {
      // 网络错误、需要页面 Cookie，或防盗链返回了占位图（解不出码），都走页面内兜底。
    }
  }

  // 2. 兜底：在图片所在的 frame 里 fetch，拿到 data URL 后再解码。
  //    blob: 地址只有页面自己能读取，也走这里。
  if (!tab?.id) throw new Error('no tab for fallback');
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id, frameIds: [info.frameId ?? 0] },
    func: fetchAsDataUrl,
    args: [src],
  });
  if (!result?.result) throw new Error('page fetch failed');
  return await sendToOffscreen({ type: 'decode', src: result.result });
}

// 注入到页面执行，不能引用外部变量。
async function fetchAsDataUrl(src) {
  try {
    const blob = await (await fetch(src)).blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ---------- 访问 ----------

async function openContent(text, tab) {
  const value = text.trim();
  const createProps = { active: true };
  if (tab?.id >= 0) {
    createProps.index = tab.index + 1;
    createProps.openerTabId = tab.id;
  }

  const url = toUrl(value);
  if (url) {
    await chrome.tabs.create({ ...createProps, url });
  } else {
    // 不是地址：和在地址栏里输入文字回车一样，交给默认搜索引擎。
    await chrome.search.query({ text: value, disposition: 'NEW_TAB' });
  }
}

function toUrl(value) {
  if (!value || /\s/.test(value)) return null;

  // 带协议：https://、weixin:// 等，以及少数不带 // 的常见协议。
  // WIFI:、BEGIN:VCARD 这类内容不是地址，交给搜索。
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value) || /^(mailto|tel|sms|magnet):/i.test(value)) {
    return value;
  }

  // 不带协议的主机名：localhost 和 IP 用 http://，域名用 https://，和地址栏的行为一致。
  const host = value.match(/^(localhost|[\w-]+(\.[\w-]+)+)(:\d+)?([/?#]\S*)?$/i);
  if (host) {
    const isLocal = /^(localhost|\d{1,3}(\.\d{1,3}){3})$/i.test(host[1]);
    return `${isLocal ? 'http' : 'https'}://${value}`;
  }
  return null;
}

// ---------- 离屏文档（解码 + 剪贴板） ----------

let creatingOffscreen = null;

async function ensureOffscreen() {
  const contexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
  if (contexts.length) return;
  creatingOffscreen ??= chrome.offscreen
    .createDocument({
      url: 'offscreen.html',
      reasons: ['CLIPBOARD', 'BLOBS'],
      justification: 'Decode QR code images and write the result to the clipboard',
    })
    .finally(() => { creatingOffscreen = null; });
  await creatingOffscreen;
}

async function sendToOffscreen(message) {
  await ensureOffscreen();
  const res = await chrome.runtime.sendMessage({ target: 'offscreen', ...message });
  if (!res?.ok) throw new Error(res?.error || 'offscreen error');
  return res.text;
}

// ---------- 页面提示 ----------

function toast(tab, message, type = 'info') {
  if (!tab?.id || tab.id < 0) return;
  chrome.scripting
    .executeScript({ target: { tabId: tab.id }, func: showToast, args: [message, type] })
    .catch(() => {}); // chrome:// 等受限页面无法注入，忽略
}

// 注入到页面执行，不能引用外部变量。
function showToast(message, type) {
  const ID = '__qright_toast__';
  document.getElementById(ID)?.remove();

  const host = document.createElement('div');
  host.id = ID;
  host.style.cssText = 'all:initial;position:fixed;top:16px;right:16px;z-index:2147483647;';
  const root = host.attachShadow({ mode: 'closed' });
  const bg = type === 'error' ? '#c62828' : '#1f1f1f';
  root.innerHTML = `
    <style>
      .t{max-width:360px;padding:10px 14px;border-radius:10px;background:${bg};color:#fff;
         font:13px/1.45 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;
         box-shadow:0 6px 24px rgba(0,0,0,.25);word-break:break-all;
         opacity:0;transform:translateY(-6px);transition:opacity .18s,transform .18s}
      .t.show{opacity:1;transform:none}
      b{font-weight:600;margin-right:6px}
    </style>
    <div class="t"><b>QRight</b><span></span></div>`;
  root.querySelector('span').textContent = message;
  document.documentElement.appendChild(host);

  const el = root.querySelector('.t');
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => host.remove(), 200);
  }, 2500);
}

function truncate(s, n) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
