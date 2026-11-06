import * as THREE from 'three';
import { flagCanvas } from '../flags.js';
import { Delegate } from './characters.js';

const WALL_R = 13;
const SEAT_R = 4.9;
const TAU = Math.PI * 2;

const PERM_ACCENT = { us: 0x2e4c8a, gb: 0x2e4c8a, fr: 0x2e4c8a, ru: 0x8a2b3a, cn: 0xa8322b };

function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.75,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    side: opts.side ?? THREE.FrontSide,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
  });
}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function emblemTexture() {
  return canvasTex(512, 512, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    const g = x.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 250);
    g.addColorStop(0, 'rgba(255,236,180,.22)');
    g.addColorStop(1, 'rgba(255,206,92,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    x.strokeStyle = '#FFCE5C';
    x.lineWidth = 6;
    x.beginPath();
    x.arc(w / 2, h / 2, 214, 0, 7);
    x.stroke();
    x.lineWidth = 2;
    x.beginPath();
    x.arc(w / 2, h / 2, 190, 0, 7);
    x.stroke();
    // 15 puntos por las 15 sillas
    for (let i = 0; i < 15; i++) {
      const a = (i / 15) * TAU - Math.PI / 2;
      x.fillStyle = i < 5 ? '#FFCE5C' : 'rgba(255,246,228,.75)';
      x.beginPath();
      x.arc(w / 2 + Math.cos(a) * 202, h / 2 + Math.sin(a) * 202, i < 5 ? 9 : 5.5, 0, 7);
      x.fill();
    }
    // Paloma estilizada
    x.fillStyle = '#FFF6E4';
    x.beginPath();
    x.moveTo(170, 300);
    x.bezierCurveTo(200, 230, 290, 200, 352, 246);
    x.bezierCurveTo(316, 246, 300, 262, 288, 288);
    x.bezierCurveTo(320, 300, 340, 320, 342, 344);
    x.bezierCurveTo(300, 326, 250, 330, 214, 352);
    x.bezierCurveTo(200, 330, 186, 316, 170, 300);
    x.fill();
    x.strokeStyle = '#FFCE5C';
    x.lineWidth = 8;
    x.lineCap = 'round';
    x.beginPath();
    x.moveTo(196, 318);
    x.quadraticCurveTo(240, 300, 296, 300);
    x.stroke();
    x.fillStyle = '#6FE3C1';
    x.beginPath();
    x.ellipse(300, 262, 34, 12, -0.5, 0, 7);
    x.fill();
  });
}

function earthTexture() {
  return canvasTex(512, 512, (x, w, h) => {
    const sky = x.createRadialGradient(w * 0.72, h * 0.25, 30, w / 2, h / 2, 300);
    sky.addColorStop(0, '#1c4b74');
    sky.addColorStop(0.55, '#0d2c4d');
    sky.addColorStop(1, '#06172b');
    x.fillStyle = sky;
    x.fillRect(0, 0, w, h);
    const blob = (cx, cy, rx, ry, color) => {
      x.fillStyle = color;
      x.beginPath();
      x.ellipse(cx, cy, rx, ry, 0.3, 0, 7);
      x.fill();
    };
    x.fillStyle = '#3f8f74';
    blob(210, 190, 70, 46, '#3f8f74');
    blob(232, 236, 44, 52, '#3f8f74');
    blob(330, 300, 62, 42, '#5aa07f');
    blob(370, 200, 48, 30, '#3f8f74');
    blob(150, 330, 46, 36, '#5aa07f');
    blob(270, 140, 34, 22, '#5aa07f');
    x.fillStyle = 'rgba(255,255,255,.18)';
    for (let i = 0; i < 8; i++) {
      blob(90 + i * 46, 120 + (i % 3) * 130, 60, 12, 'rgba(255,255,255,.14)');
    }
    x.strokeStyle = 'rgba(255,255,255,.16)';
    x.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      x.beginPath();
      x.arc(80 + i * 20, 90 + i * 40, 260, 0.3, 1.4);
      x.stroke();
    }
    const glow = x.createRadialGradient(w / 2, h / 2, 200, w / 2, h / 2, 260);
    glow.addColorStop(0, 'rgba(0,0,0,0)');
    glow.addColorStop(1, 'rgba(4,12,24,.75)');
    x.fillStyle = glow;
    x.fillRect(0, 0, w, h);
  });
}

function domeTexture() {
  return canvasTex(1024, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#081426');
    g.addColorStop(0.55, '#0c2340');
    g.addColorStop(1, '#123956');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    const haze = x.createRadialGradient(w * 0.5, h * 0.95, 20, w * 0.5, h * 0.95, 420);
    haze.addColorStop(0, 'rgba(110,211,255,.22)');
    haze.addColorStop(1, 'rgba(110,211,255,0)');
    x.fillStyle = haze;
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) {
      const sx = Math.random() * w;
      const sy = Math.random() * h * 0.8;
      const r = Math.random() * 1.8 + 0.3;
      x.fillStyle = `rgba(${220 + Math.random() * 30},${235},255,${Math.random() * 0.75 + 0.2})`;
      x.beginPath();
      x.arc(sx, sy, r, 0, 7);
      x.fill();
    }
  });
}

function glowTexture() {
  return canvasTex(128, 128, (x) => {
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, 'rgba(255,236,190,.95)');
    g.addColorStop(0.4, 'rgba(255,206,120,.32)');
    g.addColorStop(1, 'rgba(255,206,120,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
  });
}

function nameCardTexture(text) {
  return canvasTex(256, 96, (x, w, h) => {
    x.fillStyle = 'rgba(6,20,36,.88)';
    x.beginPath();
    x.roundRect(4, 4, w - 8, h - 8, 20);
    x.fill();
    x.strokeStyle = 'rgba(255,206,92,.55)';
    x.lineWidth = 3;
    x.stroke();
    x.fillStyle = '#fff6e4';
    x.font = '700 26px "Nunito", system-ui, sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    const words = String(text).split(' ');
    if (words.length > 2) {
      x.fillText(words.slice(0, 2).join(' '), w / 2, 38);
      x.fillText(words.slice(2).join(' ').slice(0, 16), w / 2, 68);
    } else {
      x.fillText(text.slice(0, 22), w / 2, h / 2);
    }
  });
}

function makeMascot() {
  const g = new THREE.Group();
  const white = std(0xfff8ec, { roughness: 0.55 });
  const cream = std(0xffe8cf, { roughness: 0.6 });
  const gold = std(0xffce5c, { roughness: 0.35, metalness: 0.4, emissive: 0xffb02e, emissiveIntensity: 0.18 });
  const navy = std(0x14324d, { roughness: 0.5 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 22, 16), white);
  body.scale.set(1, 0.92, 0.95);
  body.castShadow = true;
  g.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14), cream);
  belly.position.set(0, -0.04, 0.17);
  belly.scale.set(1, 0.9, 0.5);
  g.add(belly);

  const head = new THREE.Group();
  head.position.set(0, 0.3, 0.03);
  g.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16), white);
  skull.scale.set(1.05, 1, 0.95);
  skull.castShadow = true;
  head.add(skull);

  [-1, 1].forEach((sx) => {
    const whiteEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), std(0xffffff, { roughness: 0.25 }));
    whiteEye.position.set(0.088 * sx, 0.02, 0.17);
    whiteEye.scale.set(1, 1.1, 0.55);
    head.add(whiteEye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), navy);
    pupil.position.set(0.088 * sx, 0.02, 0.213);
    head.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.013, 6, 6), std(0xffffff, { roughness: 0.2 }));
    glint.position.set(0.088 * sx + 0.012, 0.038, 0.235);
    head.add(glint);
  });

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.062, 0.16, 8), gold);
  beak.position.set(0, -0.035, 0.235);
  beak.rotation.x = Math.PI / 2;
  head.add(beak);

  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 20), std(0x3fb3d6, { roughness: 0.6 }));
  scarf.position.set(0, 0.15, 0.02);
  scarf.rotation.x = Math.PI / 2;
  g.add(scarf);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 6), cream);
  tail.position.set(0, -0.06, -0.34);
  tail.rotation.x = -1.2;
  g.add(tail);

  const wings = [];
  [-1, 1].forEach((sx) => {
    const pivot = new THREE.Group();
    pivot.position.set(0.31 * sx, 0.05, 0);
    g.add(pivot);
    const wing = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.18, 3, 8), white);
    wing.position.set(0.06 * sx, -0.1, 0);
    wing.rotation.z = -0.4 * sx;
    wing.castShadow = true;
    pivot.add(wing);
    wings.push(pivot);
  });

  const spark = new THREE.Mesh(new THREE.OctahedronGeometry(0.1), gold);
  spark.position.set(0, 0.62, 0);
  g.add(spark);

  g.userData.wings = wings;
  g.userData.spark = spark;
  return g;
}

function makeDove() {
  const g = new THREE.Group();
  const paper = std(0xfdf7e7, { roughness: 0.9, emissive: 0x2b4152, emissiveIntensity: 0.35 });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 4), paper);
  body.rotation.x = Math.PI / 2;
  g.add(body);
  const wingGeo = new THREE.ConeGeometry(0.05, 0.3, 3);
  [-1, 1].forEach((sx) => {
    const w = new THREE.Mesh(wingGeo, paper);
    w.position.set(0.09 * sx, 0.02, 0);
    w.rotation.z = (Math.PI / 2) * sx;
    w.rotation.x = -0.4;
    w.scale.set(1, 1, 0.4);
    g.add(w);
  });
  return g;
}

export function buildChamber(countries, seatOrder) {
  const root = new THREE.Group();
  const lamps = [];
  const doves = [];
  const animated = [];

  root.add(new THREE.HemisphereLight(0xbfe9ff, 0x10233a, 1.1));
  const key = new THREE.DirectionalLight(0xffe7c2, 2.1);
  key.position.set(6, 13, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -9;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 32;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  root.add(key);

  const rim = new THREE.PointLight(0x6fd3ff, 42, 30, 2);
  rim.position.set(0, 6.4, -9);
  root.add(rim);

  const center = new THREE.PointLight(0xffce5c, 36, 26, 2);
  center.position.set(0, 5.2, 0);
  root.add(center);

  const spot = new THREE.SpotLight(0xffe3b0, 55, 22, 0.65, 0.85, 2);
  spot.position.set(0, 10, 0);
  spot.target.position.set(0, 0.8, 0);
  root.add(spot);
  root.add(spot.target);

  // Suelo
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(WALL_R + 0.4, WALL_R + 0.4, 0.5, 64), std(0x081a2b, { roughness: 0.9 }));
  floor.position.y = -0.25;
  floor.receiveShadow = true;
  root.add(floor);

  const disc = new THREE.Mesh(new THREE.CircleGeometry(WALL_R, 64), std(0x0d2a40, { roughness: 0.72, metalness: 0.1 }));
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.001;
  disc.receiveShadow = true;
  root.add(disc);

  [0.4, 6.4, 8.2, 10.2].forEach((r, i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, i === 0 ? 0.05 : 0.014, 4, 72),
      std(i === 0 ? 0x4fd6c0 : 0x2b6d86, {
        emissive: i === 0 ? 0x1f9187 : 0x123f52,
        emissiveIntensity: 0.9,
        roughness: 0.4,
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.012;
    root.add(ring);
  });

  const stepData = [
    [6.7, 7.25],
    [8.5, 9.0],
    [10.3, 10.8],
  ];
  stepData.forEach(([inner, outer]) => {
    const step = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 64), std(0x0b2438, { roughness: 0.95, side: THREE.DoubleSide }));
    step.rotation.x = -Math.PI / 2;
    step.position.y = 0.008;
    step.receiveShadow = true;
    root.add(step);
  });

  // Alfombra central y mesa
  const rug = new THREE.Mesh(new THREE.CircleGeometry(3.55, 48), std(0x11475a, { roughness: 0.95 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.015;
  rug.receiveShadow = true;
  root.add(rug);

  const emblem = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), new THREE.MeshBasicMaterial({ map: emblemTexture(), transparent: true }));
  emblem.rotation.x = -Math.PI / 2;
  emblem.position.y = 0.035;
  root.add(emblem);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.35, 0.8, 28), std(0x2a4658, { roughness: 0.6, metalness: 0.25 }));
  pedestal.position.y = 0.4;
  pedestal.castShadow = true;
  root.add(pedestal);

  const tabletop = new THREE.Mesh(new THREE.CylinderGeometry(3.15, 3.15, 0.16, 64), std(0x1d5a6d, { roughness: 0.45, metalness: 0.15 }));
  tabletop.position.y = 0.95;
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  root.add(tabletop);

  const tableRim = new THREE.Mesh(new THREE.TorusGeometry(3.16, 0.05, 6, 72), std(0xffce5c, { metalness: 0.6, roughness: 0.3, emissive: 0x8a5a12, emissiveIntensity: 0.35 }));
  tableRim.rotation.x = Math.PI / 2;
  tableRim.position.y = 1.03;
  root.add(tableRim);

  const tableEmblem = new THREE.Mesh(new THREE.CircleGeometry(1.5, 40), new THREE.MeshBasicMaterial({ map: emblemTexture(), transparent: true }));
  tableEmblem.rotation.x = -Math.PI / 2;
  tableEmblem.position.y = 1.04;
  root.add(tableEmblem);

  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * TAU;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), std(0xffce5c, { emissive: 0xffb02e, emissiveIntensity: 0.7 }));
    dot.position.set(Math.sin(a) * 2.94, 1.045, Math.cos(a) * 2.94);
    root.add(dot);
  }

  // Muro circular, pilastras y paneles
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(WALL_R, WALL_R, 9.6, 64, 1, true),
    std(0x112c46, { roughness: 0.95, side: THREE.BackSide })
  );
  wall.position.y = 4.8;
  root.add(wall);

  [1.6, 7.6].forEach((y) => {
    const band = new THREE.Mesh(new THREE.TorusGeometry(WALL_R - 0.06, 0.06, 5, 80), std(0x2b6d86, { emissive: 0x123f52, emissiveIntensity: 0.8 }));
    band.rotation.x = Math.PI / 2;
    band.position.y = y;
    root.add(band);
  });

  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * TAU + Math.PI / 15;
    // La pilastra central se omite: detrás está el ventanal de la Tierra.
    if (Math.abs(a - Math.PI) < 0.02) continue;
    const px = Math.sin(a) * (WALL_R - 0.55);
    const pz = Math.cos(a) * (WALL_R - 0.55);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 8.6, 10), std(0x183a56, { roughness: 0.8 }));
    pillar.position.set(px, 4.3, pz);
    root.add(pillar);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.62), std(0xffce5c, { metalness: 0.5, roughness: 0.35, emissive: 0x6b4510, emissiveIntensity: 0.4 }));
    cap.position.set(px, 8.55, pz);
    root.add(cap);

    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.7),
      std(0x0e3548, { emissive: 0x0b4356, emissiveIntensity: 0.55, roughness: 0.9 })
    );
    panel.position.set(Math.sin(a) * (WALL_R - 0.2), 3.9, Math.cos(a) * (WALL_R - 0.2));
    panel.lookAt(0, 3.9, 0);
    root.add(panel);

    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.08, 3.6),
      new THREE.MeshBasicMaterial({ color: 0x63e0c5, transparent: true, opacity: 0.5 })
    );
    strip.position.set(Math.sin(a) * (WALL_R - 0.35), 3.9, Math.cos(a) * (WALL_R - 0.35));
    strip.lookAt(0, 3.9, 0);
    root.add(strip);
  }

  // Cúpula estrellada montada sobre el tambor de la sala (no tapa la pared).
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(13.25, 48, 24, 0, TAU, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: domeTexture(), side: THREE.BackSide })
  );
  dome.position.y = 9.15;
  root.add(dome);

  for (let i = 0; i < 12; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(13.15, 0.055, 4, 40, Math.PI), std(0x2b5b78, { emissive: 0x123f52, emissiveIntensity: 0.6 }));
    rib.rotation.y = (i / 12) * Math.PI;
    rib.position.y = 9.15;
    root.add(rib);
  }

  const halo = new THREE.Mesh(new THREE.TorusGeometry(12.95, 0.07, 4, 64), std(0x3fa0b8, { emissive: 0x2b93ad, emissiveIntensity: 1 }));
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 9.1;
  root.add(halo);

  // Remate central: araña de luz sobre la mesa.
  const crown = new THREE.Group();
  crown.position.y = 8.9;
  root.add(crown);
  const crownRing = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.06, 6, 40), std(0xffce5c, { emissive: 0xffb02e, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.35 }));
  crownRing.rotation.x = Math.PI / 2;
  crown.add(crownRing);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe1ad }));
    orb.position.set(Math.sin(a) * 1.5, 0, Math.cos(a) * 1.5);
    crown.add(orb);
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.7, 4), std(0x24485f));
    wire.position.set(Math.sin(a) * 1.5, 1, Math.cos(a) * 1.5);
    crown.add(wire);
  }

  // Ventanal con la Tierra
  const windowGroup = new THREE.Group();
  windowGroup.position.set(0, 4.7, -12.35);
  root.add(windowGroup);

  const earth = new THREE.Mesh(new THREE.CircleGeometry(2.15, 48), new THREE.MeshBasicMaterial({ map: earthTexture() }));
  windowGroup.add(earth);

  const frame = new THREE.Mesh(new THREE.TorusGeometry(2.22, 0.12, 8, 64), std(0xffce5c, { metalness: 0.55, roughness: 0.35, emissive: 0x6b4510, emissiveIntensity: 0.4 }));
  windowGroup.add(frame);

  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * TAU;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), std(i < 5 ? 0xffce5c : 0x8fe6d2, { emissive: 0xffb02e, emissiveIntensity: 0.5 }));
    dot.position.set(Math.cos(a) * 2.5, Math.sin(a) * 2.5, 0.02);
    windowGroup.add(dot);
  }

  const moon = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), std(0xdfeaf5, { emissive: 0x2b4152, emissiveIntensity: 0.6, roughness: 0.9 }));
  moon.position.set(-4.2, 6.4, -10.2);
  root.add(moon);

  // Estandartes de los cinco permanentes, flanqueando el ventanal.
  const perm = countries.filter((c) => c.p);
  const bannerStyles = [
    { a: Math.PI - 1.42, y: 5.9, w: 1.05, h: 2.9 },
    { a: Math.PI - 1.02, y: 5.9, w: 1.05, h: 2.9 },
    { a: Math.PI + 1.02, y: 5.9, w: 1.05, h: 2.9 },
    { a: Math.PI + 1.42, y: 5.9, w: 1.05, h: 2.9 },
    { a: Math.PI, y: 8.15, w: 0.95, h: 1.6 },
  ];
  perm.forEach((c, i) => {
    const style = bannerStyles[i] || bannerStyles[0];
    const a = style.a;
    const g = new THREE.Group();
    g.position.set(Math.sin(a) * (WALL_R - 0.55), style.y, Math.cos(a) * (WALL_R - 0.55));
    g.lookAt(0, style.y, 0);
    root.add(g);

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, style.w + 0.35, 8), std(0xffce5c, { metalness: 0.5, roughness: 0.35 }));
    rod.rotation.z = Math.PI / 2;
    rod.position.y = style.h / 2 + 0.12;
    g.add(rod);

    const cloth = new THREE.Mesh(
      new THREE.PlaneGeometry(style.w, style.h),
      std(PERM_ACCENT[c.k] ?? 0x2e4c8a, { roughness: 0.95, side: THREE.DoubleSide })
    );
    cloth.position.y = 0.02;
    g.add(cloth);

    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(style.w * 0.82, style.w * 0.55),
      new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(flagCanvas(c.k)), roughness: 0.9 })
    );
    flag.position.set(0, style.h / 2 - 0.55, 0.02);
    g.add(flag);

    const fringe = new THREE.Mesh(new THREE.PlaneGeometry(style.w, 0.08), std(0xffce5c, { metalness: 0.4, roughness: 0.4 }));
    fringe.position.set(0, -style.h / 2 + 0.04, 0.01);
    g.add(fringe);
  });

  // Lámparas flotantes
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + 0.4;
    const r = 8.6 + (i % 2) * 1.1;
    const y = 4.6 + (i % 3) * 0.75;
    const lamp = new THREE.Group();
    lamp.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe1ad }));
    lamp.add(orb);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, opacity: 0.7, depthWrite: false }));
    glow.scale.setScalar(1.5);
    lamp.add(glow);
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 4.4, 4), std(0x24485f, { roughness: 0.8 }));
    wire.position.y = 2.2;
    lamp.add(wire);
    root.add(lamp);
    lamps.push({ group: lamp, baseY: y, phase: i * 1.3, glow });
  }

  // Motas de luz
  const moteCount = 320;
  const positions = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    const a = Math.random() * TAU;
    const r = Math.random() * 11.5;
    positions[i * 3] = Math.sin(a) * r;
    positions[i * 3 + 1] = 0.5 + Math.random() * 8.2;
    positions[i * 3 + 2] = Math.cos(a) * r;
  }
  const motesGeo = new THREE.BufferGeometry();
  motesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const motes = new THREE.Points(
    motesGeo,
    new THREE.PointsMaterial({ color: 0xbfefff, size: 0.045, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true })
  );
  root.add(motes);

  // Palomas de papel
  for (let i = 0; i < 5; i++) {
    const dove = makeDove();
    root.add(dove);
    doves.push({ group: dove, r: 6 + i * 0.8, h: 4.2 + i * 0.4, speed: 0.12 + i * 0.02, phase: i * 1.4 });
  }

  // Mesa: sillas, escritorios, delegados
  const delegates = new Map();
  const seats = [];
  const deskGroups = [];

  seatOrder.forEach((k, i) => {
    const c = countries.find((x) => x.k === k);
    if (!c) return;
    const a = (i / 15) * TAU;
    const desk = new THREE.Group();
    desk.position.set(Math.sin(a) * 4.28, 0, Math.cos(a) * 4.28);
    desk.lookAt(0, 0, 0);
    desk.userData.key = k;
    root.add(desk);
    deskGroups.push(desk);

    const trim = c.p ? 0xffce5c : 0x4fa7b8;
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.09, 0.66), std(0x2a4a5e, { roughness: 0.5, metalness: 0.15 }));
    top.position.set(0, 0.75, 0.06);
    top.castShadow = true;
    top.receiveShadow = true;
    desk.add(top);

    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.52, 0.06), std(c.p ? 0x1d4a63 : 0x1b3548, { roughness: 0.7 }));
    panel.position.set(0, 0.44, 0.31);
    panel.castShadow = true;
    desk.add(panel);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.07, 0.075), std(trim, { emissive: trim, emissiveIntensity: 0.25 }));
    stripe.position.set(0, 0.66, 0.315);
    desk.add(stripe);

    [-0.62, 0.62].forEach((x) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.08), std(0x16303f, { roughness: 0.8 }));
      leg.position.set(x, 0.21, 0.06);
      desk.add(leg);
    });

    if (c.p) {
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.075), std(0xffce5c, { emissive: 0xffb02e, emissiveIntensity: 0.55, metalness: 0.4, roughness: 0.3 }));
      star.position.set(0, 0.69, 0.36);
      desk.add(star);
    }

    const flagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.36, 0.24),
      new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(flagCanvas(k)), roughness: 0.85 })
    );
    flagMesh.position.set(-0.44, 0.84, 0.06);
    flagMesh.rotation.x = -0.3;
    desk.add(flagMesh);

    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.21), std(0xf5ecd8, { roughness: 0.9 }));
    paper.rotation.x = -Math.PI / 2;
    paper.position.set(0.24, 0.8, 0.1);
    desk.add(paper);

    const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 6), std(0x9aa8b5, { metalness: 0.6, roughness: 0.4 }));
    mic.position.set(0.5, 0.88, 0.12);
    desk.add(mic);
    const micTip = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), std(0x22323f, { roughness: 0.6 }));
    micTip.position.set(0.5, 0.99, 0.12);
    desk.add(micTip);

    // Silla
    const seat = new THREE.Group();
    seat.position.set(Math.sin(a) * 5.18, 0, Math.cos(a) * 5.18);
    seat.lookAt(0, 0, 0);
    root.add(seat);
    const seatPad = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.12, 0.72), std(c.p ? 0x2c5a70 : 0x213c4d, { roughness: 0.9 }));
    seatPad.position.y = 0.48;
    seat.add(seatPad);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.9, 0.12), std(c.p ? 0x2c5a70 : 0x213c4d, { roughness: 0.9 }));
    back.position.set(0, 1.0, -0.36);
    seat.add(back);
    const seatTrim = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.06, 0.14), std(trim, { emissive: trim, emissiveIntensity: 0.2 }));
    seatTrim.position.set(0, 1.46, -0.36);
    seat.add(seatTrim);

    if (c.p) {
      const medallion = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.035, 4, 40), std(0xffce5c, { emissive: 0xffb02e, emissiveIntensity: 0.5 }));
      medallion.rotation.x = Math.PI / 2;
      medallion.position.set(Math.sin(a) * 4.9, 0.018, Math.cos(a) * 4.9);
      root.add(medallion);
    }

    const delegate = new Delegate(c, i);
    delegate.root.position.set(Math.sin(a) * SEAT_R, 0, Math.cos(a) * SEAT_R);
    delegate.root.lookAt(0, 0, 0);
    delegate.root.rotation.x = 0;
    root.add(delegate.root);
    delegate.angle = a;
    delegate.seat = new THREE.Vector3(Math.sin(a) * SEAT_R, 0, Math.cos(a) * SEAT_R);
    delegate.headPos = new THREE.Vector3(Math.sin(a) * SEAT_R, 1.6, Math.cos(a) * SEAT_R);
    delegates.set(k, delegate);
    seats.push({ key: k, angle: a, delegate, desk });

    const label = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: nameCardTexture(c.n), transparent: true, opacity: 0.92, depthTest: false })
    );
    label.position.set(Math.sin(a) * 5.62, 2.42, Math.cos(a) * 5.62);
    label.scale.set(0.86, 0.32, 1);
    label.visible = false;
    label.renderOrder = 12;
    root.add(label);
    desk.userData.label = label;
  });

  // Aro de selección
  const highlight = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.05, 6, 48),
    new THREE.MeshBasicMaterial({ color: 0xffce5c, transparent: true, opacity: 0.9 })
  );
  highlight.rotation.x = Math.PI / 2;
  highlight.position.y = 0.03;
  highlight.visible = false;
  root.add(highlight);

  const spotlightCone = new THREE.Mesh(
    new THREE.ConeGeometry(1.05, 4.6, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffe5b0, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  spotlightCone.position.y = 4.8;
  spotlightCone.visible = false;
  root.add(spotlightCone);

  // Mascota: Pipa, la paloma de papel
  const mascot = makeMascot();
  mascot.position.set(-3.1, 1.9, 2.2);
  mascot.name = 'Pipa';
  root.add(mascot);

  const api = {
    root,
    seats,
    delegates,
    deskGroups,
    labels: new Map(seats.map((s) => [s.key, s.desk.userData.label])),
    mascot,
    setHighlight(key, visible = true) {
      const seat = seats.find((s) => s.key === key);
      if (!seat || !visible) {
        highlight.visible = false;
        return;
      }
      highlight.visible = true;
      highlight.position.set(seat.delegate.root.position.x, 0.03, seat.delegate.root.position.z);
    },
    setSpotlight(keyOrNull) {
      const seat = seats.find((s) => s.key === keyOrNull);
      if (!seat) {
        spotlightCone.visible = false;
        return;
      }
      spotlightCone.visible = true;
      spotlightCone.position.set(seat.delegate.root.position.x, 3.4, seat.delegate.root.position.z);
    },
    setLabels(mode) {
      api.labels.forEach((label, key) => {
        label.visible = mode === 'all' || (mode === 'permanent' && countries.find((c) => c.k === key)?.p);
      });
    },
    showVotes(votes) {
      votes.forEach(({ key }) => delegates.get(key)?.raisePlacard());
    },
    clearVotes() {
      delegates.forEach((d) => d.clearVote());
    },
    update(dt, t) {
      lamps.forEach((l) => {
        l.group.position.y = l.baseY + Math.sin(t * 0.7 + l.phase) * 0.09;
        l.group.rotation.y = t * 0.05 + l.phase;
        l.glow.material.opacity = 0.55 + Math.sin(t * 1.4 + l.phase) * 0.12;
      });
      doves.forEach((d) => {
        const a = t * d.speed + d.phase;
        d.group.position.set(Math.sin(a) * d.r, d.h + Math.sin(t * 0.8 + d.phase) * 0.35, Math.cos(a) * d.r);
        d.group.rotation.y = -a + Math.PI / 2;
        d.group.rotation.z = Math.sin(t * 0.9 + d.phase) * 0.2;
      });
      motes.rotation.y = t * 0.012;
      motes.position.y = Math.sin(t * 0.2) * 0.18;
      mascot.position.y = 1.9 + Math.sin(t * 1.1) * 0.1;
      mascot.rotation.y = Math.sin(t * 0.4) * 0.25;
      mascot.userData.spark.rotation.y = t * 1.2;
      mascot.userData.spark.position.y = 0.62 + Math.sin(t * 1.6) * 0.04;
      mascot.userData.wings.forEach((w, i) => {
        w.rotation.z = (i === 0 ? -1 : 1) * (0.1 + Math.max(0, Math.sin(t * 1.4 + i)) * 0.35);
      });
      delegates.forEach((d) => d.update(dt, t));
      if (highlight.visible) highlight.material.opacity = 0.7 + Math.sin(t * 3.2) * 0.22;
      if (spotlightCone.visible) {
        spotlightCone.material.opacity = 0.1 + Math.sin(t * 2.4) * 0.035;
      }
    },
  };

  return api;
}
