// Banderas dibujadas a mano en canvas: 256 × 170 px. Sin imágenes externas.
const W = 256;
const H = 170;

function makeCanvas() {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return c;
}

function star(ctx, cx, cy, r, points = 5, color = '#FFDE00') {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    const rad = i % 2 ? r * 0.382 : r;
    ctx[i ? 'lineTo' : 'moveTo'](cx + rad * Math.cos(a), cy + rad * Math.sin(a));
  }
  ctx.closePath();
  ctx.fill();
}

const DRAW = {
  us(x) {
    for (let i = 0; i < 13; i++) {
      x.fillStyle = i % 2 ? '#FFFFFF' : '#C8102E';
      x.fillRect(0, (i * H) / 13, W, H / 13 + 1);
    }
    x.fillStyle = '#27408B';
    x.fillRect(0, 0, W * 0.42, H * 0.54);
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        x.fillStyle = '#FFFFFF';
        x.beginPath();
        x.arc(16 + i * 20, 13 + j * 22, 3.2, 0, 7);
        x.fill();
      }
    }
  },
  gb(x) {
    x.fillStyle = '#1F3A93';
    x.fillRect(0, 0, W, H);
    x.strokeStyle = '#FFFFFF';
    x.lineWidth = 30;
    x.beginPath();
    x.moveTo(0, 0); x.lineTo(W, H); x.moveTo(W, 0); x.lineTo(0, H);
    x.stroke();
    x.strokeStyle = '#C8102E';
    x.lineWidth = 12;
    x.beginPath();
    x.moveTo(0, 0); x.lineTo(W, H); x.moveTo(W, 0); x.lineTo(0, H);
    x.stroke();
    x.fillStyle = '#FFFFFF';
    x.fillRect(W / 2 - 26, 0, 52, H);
    x.fillRect(0, H / 2 - 26, W, 52);
    x.fillStyle = '#C8102E';
    x.fillRect(W / 2 - 15, 0, 30, H);
    x.fillRect(0, H / 2 - 15, W, 30);
  },
  fr(x) {
    ['#1F3A93', '#FFFFFF', '#E03A3E'].forEach((c, i) => {
      x.fillStyle = c;
      x.fillRect((i * W) / 3, 0, W / 3 + 1, H);
    });
  },
  ru(x) {
    ['#FFFFFF', '#1C57A5', '#D52B1E'].forEach((c, i) => {
      x.fillStyle = c;
      x.fillRect(0, (i * H) / 3, W, H / 3 + 1);
    });
  },
  cn(x) {
    x.fillStyle = '#DE2910';
    x.fillRect(0, 0, W, H);
    star(x, 52, 48, 30);
    star(x, 98, 24, 10);
    star(x, 118, 46, 10);
    star(x, 118, 72, 10);
    star(x, 98, 92, 10);
  },
  ie(x) {
    ['#169B62', '#FFFFFF', '#FF883E'].forEach((c, i) => {
      x.fillStyle = c;
      x.fillRect((i * W) / 3, 0, W / 3 + 1, H);
    });
  },
  ne(x) {
    ['#E05206', '#FFFFFF', '#0DB02B'].forEach((c, i) => {
      x.fillStyle = c;
      x.fillRect(0, (i * H) / 3, W, H / 3 + 1);
    });
    x.fillStyle = '#E05206';
    x.beginPath();
    x.arc(W / 2, H / 2, 26, 0, 7);
    x.fill();
  },
  ke(x) {
    x.fillStyle = '#111111'; x.fillRect(0, 0, W, H * 0.28);
    x.fillStyle = '#FFFFFF'; x.fillRect(0, H * 0.28, W, 8);
    x.fillStyle = '#BB0000'; x.fillRect(0, H * 0.28 + 8, W, H * 0.38);
    x.fillStyle = '#FFFFFF'; x.fillRect(0, H * 0.66, W, 8);
    x.fillStyle = '#006600'; x.fillRect(0, H * 0.66 + 8, W, H * 0.34);
    x.fillStyle = '#BB0000';
    x.strokeStyle = '#FFFFFF';
    x.lineWidth = 4;
    x.beginPath();
    x.ellipse(W / 2, H / 2, 28, 48, 0, 0, 7);
    x.fill();
    x.stroke();
  },
  mx(x) {
    ['#006847', '#FFFFFF', '#CE1126'].forEach((c, i) => {
      x.fillStyle = c;
      x.fillRect((i * W) / 3, 0, W / 3 + 1, H);
    });
    x.fillStyle = '#9A7B4F';
    x.beginPath();
    x.arc(W / 2, H / 2, 22, 0, 7);
    x.fill();
    x.fillStyle = '#3E7A4A';
    x.beginPath();
    x.ellipse(W / 2, H / 2 + 6, 10, 5, 0, 0, 7);
    x.fill();
  },
  no(x) {
    x.fillStyle = '#BA0C2F'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#FFFFFF';
    x.fillRect(W * 0.26, 0, 50, H);
    x.fillRect(0, H / 2 - 25, W, 50);
    x.fillStyle = '#00205B';
    x.fillRect(W * 0.26 + 12, 0, 26, H);
    x.fillRect(0, H / 2 - 13, W, 26);
  },
  ee(x) {
    ['#0072CE', '#111111', '#FFFFFF'].forEach((c, i) => {
      x.fillStyle = c;
      x.fillRect(0, (i * H) / 3, W, H / 3 + 1);
    });
  },
  vc(x) {
    const cols = ['#0072C6', '#FCD116', '#009E60'];
    cols.forEach((c, i) => {
      x.fillStyle = c;
      x.fillRect((i * W) / 3, 0, W / 3 + 1, H);
    });
    const diamond = (cx, cy) => {
      x.fillStyle = '#009E60';
      x.beginPath();
      x.moveTo(cx, cy - 18); x.lineTo(cx + 12, cy); x.lineTo(cx, cy + 18); x.lineTo(cx - 12, cy);
      x.fill();
    };
    diamond(W * 0.38, 42);
    diamond(W * 0.62, 42);
    diamond(W / 2, 120);
  },
  tn(x) {
    x.fillStyle = '#E70013'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#FFFFFF';
    x.beginPath(); x.arc(W / 2, H / 2, 46, 0, 7); x.fill();
    x.fillStyle = '#E70013';
    x.beginPath(); x.arc(W / 2, H / 2, 34, 0, 7); x.fill();
    x.fillStyle = '#FFFFFF';
    x.beginPath(); x.arc(W / 2 + 13, H / 2, 28, 0, 7); x.fill();
    star(x, W / 2 + 14, H / 2, 17, 5, '#E70013');
  },
  vn(x) {
    x.fillStyle = '#DA251D'; x.fillRect(0, 0, W, H);
    star(x, W / 2, H / 2, 48);
  },
  in(x) {
    ['#FF9933', '#FFFFFF', '#138808'].forEach((c, i) => {
      x.fillStyle = c;
      x.fillRect(0, (i * H) / 3, W, H / 3 + 1);
    });
    x.strokeStyle = '#000080';
    x.lineWidth = 3;
    x.beginPath();
    x.arc(W / 2, H / 2, 20, 0, 7);
    for (let i = 0; i < 12; i++) {
      x.moveTo(W / 2, H / 2);
      x.lineTo(W / 2 + 20 * Math.cos((i * Math.PI) / 6), H / 2 + 20 * Math.sin((i * Math.PI) / 6));
    }
    x.stroke();
  },
};

const cache = new Map();

export function flagCanvas(key) {
  if (cache.has(key)) return cache.get(key);
  const c = makeCanvas();
  const x = c.getContext('2d');
  x.fillStyle = '#0B2230';
  x.fillRect(0, 0, W, H);
  (DRAW[key] || (() => {}))(x);
  roundCorners(x);
  cache.set(key, c);
  return c;
}

function roundCorners(x) {
  x.save();
  x.globalCompositeOperation = 'destination-in';
  x.beginPath();
  const r = 16;
  x.moveTo(r, 0);
  x.arcTo(W, 0, W, H, r);
  x.arcTo(W, H, 0, H, r);
  x.arcTo(0, H, 0, 0, r);
  x.arcTo(0, 0, W, 0, r);
  x.closePath();
  x.fill();
  x.restore();
}

export function flagDataUrl(key) {
  return flagCanvas(key).toDataURL('image/png');
}

// Recurso DOM reutilizable con la bandera y un borde suave.
export function flagImg(key, width = 46) {
  return `<img class="flag" src="${flagDataUrl(key)}" width="${width}" height="${Math.round(width * 0.664)}" alt="" loading="lazy" decoding="async">`;
}
