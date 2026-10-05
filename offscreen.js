// 离屏文档：有完整 DOM，负责图片解码（支持 SVG/WebP 等）和写剪贴板。

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.target !== 'offscreen') return;
  handle(msg).then(sendResponse, (err) =>
    sendResponse({ ok: false, error: String(err?.message || err) })
  );
  return true;
});

async function handle(msg) {
  switch (msg.type) {
    case 'decode':
      return { ok: true, text: await decode(msg.src) };
    case 'copy':
      copy(msg.text);
      return { ok: true };
    default:
      throw new Error(`unknown message: ${msg.type}`);
  }
}

// ---------- 解码 ----------

async function decode(src) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blobUrl = URL.createObjectURL(await res.blob());
  try {
    const img = await loadImage(blobUrl);
    const text = scan(img);
    if (text == null) throw new Error('QR code not found');
    return text;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = url;
  });
}

// 网页上的二维码经常裁得很紧（没有静区）、很小、透明底或反色，
// 所以依次尝试几种预处理：缩放到合适尺寸 + 白底 + 加白边。
function scan(img) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) return null;

  const longest = Math.max(w, h);
  const scale = longest < 400 ? 400 / longest : longest > 1600 ? 1600 / longest : 1;

  for (const padRatio of [0.1, 0]) {
    for (const s of scale === 1 ? [1] : [scale, 1]) {
      const text = tryScan(img, w * s, h * s, padRatio, s > 1);
      if (text != null) return text;
    }
  }
  return null;
}

function tryScan(img, w, h, padRatio, pixelated) {
  w = Math.round(w);
  h = Math.round(h);
  const pad = Math.round(Math.max(w, h) * padRatio);
  const cw = w + pad * 2;
  const ch = h + pad * 2;

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, cw, ch);
  ctx.imageSmoothingEnabled = !pixelated; // 放大时保持模块边缘锐利
  ctx.drawImage(img, pad, pad, w, h);

  const { data } = ctx.getImageData(0, 0, cw, ch);
  const code = jsQR(data, cw, ch, { inversionAttempts: 'attemptBoth' });
  return code ? code.data : null;
}

// ---------- 剪贴板 ----------

function copy(text) {
  const el = document.getElementById('clipboard');
  el.value = text;
  el.select();
  if (!document.execCommand('copy')) throw new Error('execCommand copy failed');
}
