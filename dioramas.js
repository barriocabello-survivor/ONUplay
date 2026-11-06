import * as THREE from 'three';

// Pequeños dioramas 3D que acompañan cada argumento.
const TAU = Math.PI * 2;

function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.65,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
  });
}

function label(text, color = '#081A2B', bg = 'rgba(255,246,228,.92)', w = 320, h = 96) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = bg;
  x.beginPath();
  x.roundRect(4, 4, w - 8, h - 8, 24);
  x.fill();
  x.strokeStyle = 'rgba(6,26,43,.25)';
  x.lineWidth = 3;
  x.stroke();
  x.fillStyle = color;
  x.font = '800 40px "Nunito", system-ui, sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(text, w / 2, h / 2 + 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false }));
  s.renderOrder = 15;
  return s;
}

function parchmentTexture(lines, title) {
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 400;
  const x = c.getContext('2d');
  x.fillStyle = '#FFF6E1';
  x.beginPath();
  x.roundRect(6, 6, 308, 388, 18);
  x.fill();
  x.fillStyle = '#E8D6B4';
  x.fillRect(34, 60, 252, 3);
  x.fillStyle = '#0B2A40';
  x.font = '900 44px "Nunito", system-ui, sans-serif';
  x.textAlign = 'center';
  x.fillText(title, 160, 44);
  x.fillStyle = '#4B6478';
  for (let i = 0; i < lines; i++) {
    const w = 150 + ((i * 47) % 100);
    x.fillRect(40, 92 + i * 30, w, 8);
  }
  x.fillStyle = '#3ED3A3';
  x.fillRect(40, 330, 100, 10);
  x.fillStyle = '#0B2A40';
  x.font = '800 26px "Nunito", system-ui, sans-serif';
  x.textAlign = 'left';
  x.fillText('S/2021/990', 40, 374);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function crackTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#C98A4B';
  x.fillRect(0, 0, 256, 256);
  x.strokeStyle = '#7B4A22';
  x.lineWidth = 5;
  x.beginPath();
  x.moveTo(10, 40);
  x.lineTo(90, 90); x.lineTo(140, 70); x.lineTo(200, 140); x.lineTo(246, 120);
  x.moveTo(90, 90); x.lineTo(70, 190); x.lineTo(120, 250);
  x.moveTo(200, 140); x.lineTo(180, 240);
  x.stroke();
  x.strokeStyle = 'rgba(255,255,255,.22)';
  x.lineWidth = 2;
  x.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeBase(color) {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.58, 0.07, 28), std(color, { metalness: 0.25, roughness: 0.4, emissive: color, emissiveIntensity: 0.1 }));
  disc.position.y = -0.03;
  g.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.022, 5, 40), std(0xffce5c, { metalness: 0.6, roughness: 0.3, emissive: 0xffb02e, emissiveIntensity: 0.35 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.02;
  g.add(ring);
  return g;
}

function makeFigure(color, skin) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.12, 3, 8), std(color));
  body.position.y = 0.14;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), std(skin));
  head.position.y = 0.3;
  g.add(head);
  return g;
}

const BUILDERS = {
  letter() {
    const g = makeBase(0x2c6c86);
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.76), new THREE.MeshStandardMaterial({ map: parchmentTexture(6, 'CARTA'), roughness: 0.9, side: THREE.DoubleSide }));
    paper.position.set(0, 0.42, 0.02);
    paper.rotation.x = -0.12;
    g.add(paper);
    const rollL = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.7, 10), std(0xf3e6cb, { roughness: 0.85 }));
    rollL.rotation.z = Math.PI / 2;
    rollL.position.set(0, 0.06, 0.26);
    g.add(rollL);
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.09, 0.02), std(0x2f9e78, { emissive: 0x1f7a5a, emissiveIntensity: 0.4 }));
    ribbon.position.set(0, 0.08, 0.3);
    g.add(ribbon);
    const badge = label('113 países', '#081A2B', 'rgba(255,206,92,.95)', 300, 92);
    badge.scale.set(0.62, 0.19, 1);
    badge.position.set(0, 0.98, 0);
    g.add(badge);
    return {
      group: g,
      update(t) {
        paper.rotation.y = Math.sin(t * 0.8) * 0.16;
        badge.position.y = 0.98 + Math.sin(t * 1.6) * 0.03;
      },
    };
  },

  drought() {
    const g = makeBase(0xb07a41);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(0.46, 26), new THREE.MeshStandardMaterial({ map: crackTexture(), roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.03;
    g.add(ground);
    const house = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.18), std(0xf2dcc0, { roughness: 0.9 }));
    house.position.set(-0.22, 0.11, -0.06);
    g.add(house);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.13, 4), std(0xc4693f, { roughness: 0.9 }));
    roof.position.set(-0.22, 0.25, -0.06);
    roof.rotation.y = Math.PI / 4;
    g.add(roof);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.26, 6), std(0x4c9a52));
    stem.position.set(0.24, 0.16, 0.12);
    g.add(stem);
    for (let i = 0; i < 3; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), std(0x64c06a, { emissive: 0x1f5a2c, emissiveIntensity: 0.3 }));
      leaf.scale.set(1.1, 0.35, 0.7);
      leaf.position.set(0.24 + (i - 1) * 0.07, 0.24 + i * 0.035, 0.12);
      g.add(leaf);
    }
    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), std(0xffc14d, { emissive: 0xff9b2e, emissiveIntensity: 0.8, roughness: 0.4 }));
    sun.position.set(0.33, 0.72, -0.1);
    g.add(sun);
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), std(0x6fd3ff, { emissive: 0x2b8fd6, emissiveIntensity: 0.5, transparent: true, opacity: 0.9 }));
    drop.scale.set(0.8, 1.3, 0.8);
    g.add(drop);
    return {
      group: g,
      update(t) {
        drop.position.set(0.05, 0.9 - ((t * 0.35) % 1) * 0.6, 0.2);
        drop.visible = ((t * 0.35) % 1) < 0.85;
        sun.rotation.y = t * 0.4;
      },
    };
  },

  shield() {
    const g = makeBase(0x2c6c86);
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.6);
    shape.lineTo(0.46, 0.36);
    shape.lineTo(0.4, -0.18);
    shape.quadraticCurveTo(0.3, -0.5, 0, -0.64);
    shape.quadraticCurveTo(-0.3, -0.5, -0.4, -0.18);
    shape.lineTo(-0.46, 0.36);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
    const shield = new THREE.Mesh(geo, std(0x1f8f7c, { metalness: 0.3, roughness: 0.35, emissive: 0x0e5a4c, emissiveIntensity: 0.35 }));
    shield.position.set(0, 0.44, -0.06);
    shield.scale.setScalar(0.62);
    g.add(shield);
    const check = label('✓', '#062A25', 'rgba(255,255,255,.95)', 160, 160);
    check.scale.set(0.32, 0.32, 1);
    check.position.set(0, 0.44, 0.08);
    g.add(check);
    const stars = [];
    for (let i = 0; i < 3; i++) {
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), std(0xffce5c, { emissive: 0xffb02e, emissiveIntensity: 0.7 }));
      g.add(star);
      stars.push(star);
    }
    return {
      group: g,
      update(t) {
        shield.rotation.y = Math.sin(t * 0.7) * 0.2;
        stars.forEach((s, i) => {
          const a = t * 0.6 + (i / 3) * TAU;
          s.position.set(Math.cos(a) * 0.5, 0.44 + Math.sin(a * 1.4) * 0.3, Math.sin(a) * 0.26);
        });
      },
    };
  },

  stamp() {
    const g = makeBase(0xb8483c);
    const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.06, 24), std(0x6d1f1f, { roughness: 0.6 }));
    ink.position.y = 0.06;
    g.add(ink);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.32), std(0xc2453a, { roughness: 0.5, metalness: 0.2 }));
    body.position.y = 0.22;
    g.add(body);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.22, 10), std(0x3b2420, { roughness: 0.7 }));
    handle.position.y = 0.42;
    g.add(handle);
    const face = label('VETO', '#FFE9E4', 'rgba(184,58,48,.98)', 320, 128);
    face.scale.set(0.66, 0.26, 1);
    face.position.set(0, 0.44, 0.09);
    g.add(face);
    const wave = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 4, 32), std(0xff7c6b, { emissive: 0xff7c6b, emissiveIntensity: 0.8, transparent: true, opacity: 0 }));
    wave.rotation.x = Math.PI / 2;
    wave.position.y = 0.04;
    g.add(wave);
    return {
      group: g,
      update(t) {
        const cycle = (t * 0.5) % 1;
        const hit = cycle > 0.62;
        const press = hit ? 1 : 0;
        body.position.y = 0.22 - press * 0.08 + (hit ? 0 : Math.sin(t * 2) * 0.02);
        handle.position.y = 0.42 - press * 0.08;
        face.position.y = 0.44 - press * 0.1;
        wave.material.opacity = cycle > 0.62 ? Math.max(0, 1 - (cycle - 0.62) * 2.4) : 0;
        wave.scale.setScalar(1 + (cycle > 0.62 ? (cycle - 0.62) * 2.4 : 0));
      },
    };
  },

  signpost() {
    const g = makeBase(0x6b5bd6);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.034, 0.95, 8), std(0x8a6a4a, { roughness: 0.85 }));
    pole.position.y = 0.48;
    g.add(pole);
    const texts = ['Clima', 'Desarrollo', 'Derechos'];
    const colors = [0x3ed3a3, 0x6fd3ff, 0xffce5c];
    const arrows = [];
    texts.forEach((txt, i) => {
      const arm = new THREE.Group();
      arm.position.y = 0.78 - i * 0.22;
      arm.rotation.y = -0.5 + i * 0.55;
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.11, 0.03), std(colors[i], { emissive: colors[i], emissiveIntensity: 0.15 }));
      board.position.x = 0.2;
      arm.add(board);
      const tag = label(txt, '#081A2B', 'rgba(255,246,228,.95)', 260, 74);
      tag.scale.set(0.34, 0.1, 1);
      tag.position.set(0.2, 0, 0.03);
      arm.add(tag);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.12, 4), std(colors[i]));
      tip.rotation.z = -Math.PI / 2;
      tip.position.x = 0.46;
      arm.add(tip);
      g.add(arm);
      arrows.push(arm);
    });
    const sign = label('otros espacios ONU', '#081A2B', 'rgba(255,206,92,.95)', 380, 84);
    sign.scale.set(0.66, 0.15, 1);
    sign.position.set(0, 0.13, 0.1);
    g.add(sign);
    return {
      group: g,
      update(t) {
        arrows.forEach((a, i) => { a.rotation.y = -0.5 + i * 0.55 + Math.sin(t * 0.6 + i) * 0.12; });
      },
    };
  },

  split() {
    const g = makeBase(0x6b5bd6);
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.05, 0.34), std(0x2f8f78, { roughness: 0.8 }));
    left.position.set(-0.24, 0.04, 0);
    g.add(left);
    const right = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.05, 0.34), std(0xc4693f, { roughness: 0.8 }));
    right.position.set(0.24, 0.04, 0);
    g.add(right);
    const crack = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.36), std(0x2a1a12, { emissive: 0xff7c6b, emissiveIntensity: 0.25 }));
    crack.rotation.x = -Math.PI / 2;
    crack.position.y = 0.052;
    g.add(crack);
    const skins = [0xf4cba4, 0xe3ac80, 0xc98b5e, 0xa2683f];
    const figs = [];
    [-1, 1].forEach((sx) => {
      for (let i = 0; i < 2; i++) {
        const f = makeFigure(sx < 0 ? 0x2f8f78 : 0xc4693f, skins[(i + (sx > 0 ? 2 : 0)) % skins.length]);
        f.position.set(sx * (0.18 + i * 0.12), 0.05, i % 2 ? -0.1 : 0.1);
        g.add(f);
        figs.push({ obj: f, phase: i + sx });
      }
    });
    return {
      group: g,
      update(t) {
        figs.forEach((f) => { f.obj.rotation.y = Math.sin(t * 1.1 + f.phase) * 0.2; });
      },
    };
  },
};

export function createDiorama(key) {
  const builder = BUILDERS[key] || BUILDERS.letter;
  return builder();
}

export function buildDioramaStage() {
  const root = new THREE.Group();
  root.visible = false;
  const instances = new Map();
  Object.keys(BUILDERS).forEach((key) => {
    const d = createDiorama(key);
    d.group.visible = false;
    root.add(d.group);
    instances.set(key, d);
  });
  let active = null;
  return {
    root,
    show(key, position) {
      instances.forEach((d, k) => { d.group.visible = k === key; });
      active = instances.get(key) || null;
      root.visible = !!active;
      if (active) {
        active.group.position.copy(position);
        active.group.scale.setScalar(0.001);
        active.scaleT = 0;
      }
    },
    hide() {
      root.visible = false;
      active = null;
    },
    update(dt, t) {
      if (!active) return;
      active.scaleT = Math.min(1, (active.scaleT ?? 0) + dt * 3.4);
      const e = 1 - Math.pow(1 - active.scaleT, 3);
      active.group.scale.setScalar(e * 0.95);
      active.group.rotation.y = Math.sin(t * 0.4) * 0.25;
      active.group.position.y = active.group.userData.baseY ?? active.group.position.y;
      active.update(t);
    },
  };
}
