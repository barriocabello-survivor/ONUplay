import * as THREE from 'three';
import { flagCanvas } from '../flags.js';
import { VOTE_COLOR, VOTE_LABEL } from '../data.js';

const SKIN = [0xf4cba4, 0xe3ac80, 0xc98b5e, 0xa2683f, 0x7d4b2c, 0xf7dcc0, 0x8d5a3a];
const HAIR = [0x2a1b14, 0x4a2c1b, 0x171717, 0xb8742a, 0x6b2e1f, 0x9aa0a6, 0x3a2a4a];
const SUIT = [0x2e4c8a, 0x1f7a78, 0x6c3e86, 0x2c6b4a, 0x3c4763, 0x7a2e3f, 0x2b5f8a, 0x8a5a2b];
const ACCENT = [0xffce5c, 0x6fe3c1, 0xff8f7a, 0x8fb8ff, 0xc9a7ff, 0xffb38a];

const materialCache = new Map();
function mat(color, opts = {}) {
  const key = color + '|' + JSON.stringify(opts);
  if (!materialCache.has(key)) {
    materialCache.set(key, new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness ?? 0.7,
      metalness: opts.metalness ?? 0.05,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 1,
      flatShading: !!opts.flat,
      side: opts.side ?? THREE.FrontSide,
    }));
  }
  return materialCache.get(key);
}

function texture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 2;
  return t;
}

function rounded(x, w, h, r) {
  x.beginPath();
  x.moveTo(r, 0);
  x.arcTo(w, 0, w, h, r);
  x.arcTo(w, h, 0, h, r);
  x.arcTo(0, h, 0, 0, r);
  x.arcTo(0, 0, w, 0, r);
  x.closePath();
}

const GLYPH = { y: '✓', n: '✕', a: '—' };

function placardTexture(country, vote) {
  return texture(256, 200, (x, w, h) => {
    x.fillStyle = VOTE_COLOR[vote];
    rounded(x, 8, 8, w - 16, h - 44, 26);
    x.fill();
    x.strokeStyle = 'rgba(255,255,255,.9)';
    x.lineWidth = 7;
    x.stroke();
    x.fillStyle = 'rgba(8,24,40,.9)';
    x.font = '800 96px "Nunito", system-ui, sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(GLYPH[vote], w / 2, h / 2 - 24);
    x.fillStyle = 'rgba(8,24,40,.75)';
    x.font = '900 22px "Nunito", system-ui, sans-serif';
    x.fillText(country.n.toUpperCase().slice(0, 18), w / 2, h - 26);
    const flag = flagCanvas(country.k);
    x.save();
    rounded(x, w / 2 - 30, h - 56, 60, 24, 6);
    x.clip();
    x.drawImage(flag, w / 2 - 30, h - 56, 60, 24);
    x.restore();
  });
}

function badgeTexture(country, vote) {
  return texture(160, 160, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.beginPath();
    x.arc(w / 2, h / 2, 66, 0, 7);
    x.fillStyle = VOTE_COLOR[vote];
    x.fill();
    x.lineWidth = 9;
    x.strokeStyle = country.p ? '#FFCE5C' : 'rgba(255,255,255,.92)';
    x.stroke();
    x.fillStyle = '#081A2B';
    x.font = '900 86px "Nunito", system-ui, sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(GLYPH[vote], w / 2, h / 2 + 4);
  });
}

function tagTexture() {
  return texture(256, 100, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.fillStyle = '#FFCE5C';
    rounded(x, 6, 6, w - 12, h - 30, 26);
    x.fill();
    x.beginPath();
    x.moveTo(w / 2 - 13, h - 26);
    x.lineTo(w / 2, h - 4);
    x.lineTo(w / 2 + 13, h - 26);
    x.fill();
    x.fillStyle = '#0A1B2E';
    x.font = '900 46px "Fredoka", "Baloo 2", system-ui, sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText('¡TÚ!', w / 2, 40);
  });
}

function glowTexture() {
  return texture(128, 128, (x) => {
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, 'rgba(255,236,190,.9)');
    g.addColorStop(0.45, 'rgba(255,206,120,.28)');
    g.addColorStop(1, 'rgba(255,206,120,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
  });
}

let glowTex = null;

export class Delegate {
  constructor(country, index) {
    this.country = country;
    this.index = index;
    this.root = new THREE.Group();
    this.body = new THREE.Group();
    this.root.add(this.body);
    this.root.userData.key = country.k;
    this.phase = Math.random() * 9;
    this.blinkTimer = 1.4 + Math.random() * 3.4;
    this.speaking = false;
    this.lift = 0;
    this.liftTarget = 0;
    this.gestureName = '';
    this.gestureT = 0;
    this.mood = 'calm';
    this.moodW = 0;
    this.mine = false;
    this._build();
  }

  _build() {
    const c = this.country;
    const i = this.index;
    const skin = SKIN[(i * 3) % SKIN.length];
    const hair = HAIR[(i * 2) % HAIR.length];
    const suit = SUIT[(i * 5) % SUIT.length];
    const accent = c.p ? 0xffce5c : ACCENT[i % ACCENT.length];
    const add = (geo, material, x, y, z, parent = this.body) => {
      const m = new THREE.Mesh(geo, material);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };

    // Torso y ropa
    add(new THREE.CapsuleGeometry(0.215, 0.3, 4, 12), mat(suit), 0, 1.06, 0);
    add(new THREE.CylinderGeometry(0.22, 0.3, 0.42, 14), mat(suit), 0, 0.82, 0);
    add(new THREE.BoxGeometry(0.16, 0.5, 0.02), mat(accent, { emissive: accent, emissiveIntensity: 0.12 }), 0, 1.06, 0.205);
    add(new THREE.TorusGeometry(0.13, 0.035, 6, 14), mat(0xffffff, { roughness: 0.9 }), 0, 1.28, 0.02).rotation.x = Math.PI / 2;

    // Cabeza
    const head = new THREE.Group();
    head.position.set(0, 1.57, 0);
    this.head = head;
    this.body.add(head);
    const skull = add(new THREE.SphereGeometry(0.265, 22, 18), mat(skin, { roughness: 0.85 }), 0, 0, 0, head);
    skull.scale.set(1.02, 1, 0.94);
    add(new THREE.SphereGeometry(0.055, 10, 8), mat(skin), -0.26, 0.02, 0, head);
    add(new THREE.SphereGeometry(0.055, 10, 8), mat(skin), 0.26, 0.02, 0, head);

    // Peinados: variedad sin estereotipos
    const capGeo = new THREE.SphereGeometry(0.282, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.62);
    const cap = add(capGeo, mat(hair, { roughness: 0.9 }), 0, 0.005, 0, head);
    cap.rotation.x = -0.16;
    const variant = i % 5;
    if (variant === 1) {
      add(new THREE.SphereGeometry(0.115, 14, 12), mat(hair, { roughness: 0.9 }), 0, 0.03, -0.24, head);
    } else if (variant === 2) {
      const long = add(new THREE.CapsuleGeometry(0.12, 0.26, 4, 12), mat(hair, { roughness: 0.9 }), 0, -0.13, -0.17, head);
      long.scale.set(1, 1, 0.6);
    } else if (variant === 3) {
      const wrap = add(new THREE.TorusGeometry(0.25, 0.045, 8, 22), mat(accent), 0, 0.09, -0.02, head);
      wrap.rotation.x = Math.PI / 2;
      const knot = add(new THREE.SphereGeometry(0.08, 10, 8), mat(accent), 0.2, 0.12, -0.19, head);
      knot.scale.set(1, 1.3, 0.6);
    } else if (variant === 4) {
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2;
        add(new THREE.SphereGeometry(0.085, 10, 8), mat(hair, { roughness: 0.9 }), Math.sin(a) * 0.16, 0.15 + Math.cos(a) * 0.03, Math.cos(a) * 0.16 - 0.04, head);
      }
    }

    // Ojos con pupilas, párpados y brillo
    this.eyes = [];
    [-1, 1].forEach((sx) => {
      const eye = new THREE.Group();
      eye.position.set(0.092 * sx, 0.045, 0.228);
      head.add(eye);
      const white = add(new THREE.SphereGeometry(0.062, 14, 12), mat(0xffffff, { roughness: 0.35 }), 0, 0, 0, eye);
      white.scale.set(1, 1.08, 0.5);
      white.castShadow = false;
      const pupil = add(new THREE.SphereGeometry(0.031, 10, 8), mat(0x16202c, { roughness: 0.3 }), 0, 0, 0.036, eye);
      pupil.castShadow = false;
      const glint = add(new THREE.SphereGeometry(0.011, 6, 6), mat(0xffffff, { roughness: 0.2 }), 0.012, 0.014, 0.06, eye);
      glint.castShadow = false;
      this.eyes.push(eye);
    });

    this.brows = [];
    [-1, 1].forEach((sx) => {
      const brow = add(new THREE.BoxGeometry(0.095, 0.019, 0.022), mat(hair), 0.092 * sx, 0.142, 0.235, head);
      brow.rotation.z = 0.1 * sx;
      brow.castShadow = false;
      this.brows.push(brow);
    });

    add(new THREE.SphereGeometry(0.028, 8, 8), mat(skin), 0, -0.012, 0.256, head).scale.set(1, 1, 0.8);
    this.mouth = add(new THREE.SphereGeometry(0.048, 12, 10), mat(0x7b2b36, { roughness: 0.4 }), 0, -0.098, 0.238, head);
    this.mouth.scale.set(1.15, 0.42, 0.4);
    this.mouth.castShadow = false;

    if (i % 4 === 1) {
      [-1, 1].forEach((sx) => {
        const glass = add(new THREE.TorusGeometry(0.075, 0.011, 5, 16), mat(0x1c2a38), 0.092 * sx, 0.045, 0.245, head);
        glass.castShadow = false;
      });
      add(new THREE.BoxGeometry(0.06, 0.012, 0.012), mat(0x1c2a38), 0, 0.06, 0.25, head).castShadow = false;
    }

    // Brazos articulados
    const mkArm = (side) => {
      const pivot = new THREE.Group();
      pivot.position.set(0.25 * side, 1.19, 0);
      this.body.add(pivot);
      add(new THREE.CapsuleGeometry(0.055, 0.24, 3, 8), mat(suit), 0, -0.16, 0, pivot);
      add(new THREE.SphereGeometry(0.068, 10, 8), mat(skin), 0, -0.31, 0, pivot);
      pivot.rotation.z = 0.12 * side;
      pivot.rotation.x = 0.42;
      return pivot;
    };
    this.armL = mkArm(-1);
    this.armR = mkArm(1);
    [this.armL, this.armR].forEach((arm) => {
      arm.traverse((o) => { if (o.isMesh) o.castShadow = false; });
    });

    if (c.p) {
      const pin = add(new THREE.OctahedronGeometry(0.055), mat(0xffce5c, { emissive: 0xffb02e, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.3 }), 0.2, 1.16, 0.18);
      pin.castShadow = false;
    }

    // Cartel de voto: aparece en el veredicto
    this.placard = new THREE.Group();
    this.placard.position.set(0.4, 0.62, 0.16);
    this.placard.visible = false;
    this.body.add(this.placard);
    const stick = add(new THREE.CylinderGeometry(0.016, 0.016, 0.62, 6), mat(0xe6dcc6), 0, 0.28, 0, this.placard);
    stick.castShadow = false;
    this.placardBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(0.56, 0.44),
      new THREE.MeshStandardMaterial({ map: placardTexture(c, c.v), roughness: 0.85 })
    );
    this.placardBoard.position.set(0, 0.72, 0.012);
    this.placard.add(this.placardBoard);
    const backMap = placardTexture(c, c.v);
    backMap.wrapS = THREE.RepeatWrapping;
    backMap.repeat.x = -1;
    backMap.offset.x = 1;
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(0.56, 0.44),
      new THREE.MeshStandardMaterial({ map: backMap, roughness: 0.85 })
    );
    back.position.set(0, 0.72, 0.008);
    back.rotation.y = Math.PI;
    this.placard.add(back);

    // Insignia flotante del veredicto
    glowTex = glowTex || glowTexture();
    this.badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTexture(c, c.v), transparent: true, depthTest: false }));
    this.badge.position.set(0, 2.46, 0);
    this.badge.scale.setScalar(0.0001);
    this.badge.renderOrder = 20;
    this.root.add(this.badge);
    this.badgeBaseScale = 0.52;

    this.tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTexture(), transparent: true, depthTest: false }));
    this.tag.position.set(0, 2.8, 0);
    this.tag.scale.set(1.05, 0.41, 1);
    this.tag.visible = false;
    this.tag.renderOrder = 21;
    this.root.add(this.tag);

    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0.5, depthWrite: false }));
    this.glow.position.set(0, 2.46, 0);
    this.glow.scale.setScalar(1.1);
    this.glow.visible = false;
    this.root.add(this.glow);
  }

  setSpeaking(on) {
    this.speaking = on;
  }

  setMood(mood) {
    this.mood = mood;
  }

  gesture(name) {
    this.gestureName = name;
    this.gestureT = 0;
  }

  setMine(on) {
    this.mine = on;
    this.tag.visible = on;
  }

  raisePlacard() {
    this.placard.visible = true;
    this.liftTarget = 1;
    this.badge.scale.setScalar(0.0001);
  }

  clearVote() {
    this.liftTarget = 0;
    this.badge.scale.setScalar(0.0001);
    this.glow.visible = false;
  }

  update(dt, t) {
    const time = t + this.phase;
    const idle = Math.sin(time * 1.5);

    // Respiración y balanceo
    this.body.position.y = idle * 0.014;
    this.body.rotation.z = Math.sin(time * 0.8) * 0.012;

    // Cabeza: mira alrededor cuando está en reposo
    if (!this.gestureName) {
      this.head.rotation.y = Math.sin(time * 0.55) * 0.16;
      this.head.rotation.x = Math.sin(time * 0.9 + 1) * 0.05;
    }

    // Parpadeo
    this.blinkTimer -= dt;
    let blink = 0;
    if (this.blinkTimer <= 0) {
      this.blinkTimer = 2.2 + Math.random() * 3.6;
      this.blinkT = 0.17;
    }
    if (this.blinkT > 0) {
      this.blinkT -= dt;
      blink = 1;
    }
    const eyeScale = blink ? 0.12 : 1;
    this.eyes.forEach((eye) => {
      eye.scale.y += (eyeScale - eye.scale.y) * Math.min(1, dt * 22);
    });

    // Boca: habla, respira, sonríe
    let mouthY = 0.42;
    let mouthX = 1.15;
    if (this.speaking) {
      mouthY = 0.55 + Math.abs(Math.sin(t * 12.5)) * 1.05;
      mouthX = 1.05 + Math.abs(Math.sin(t * 9)) * 0.2;
      this.head.rotation.x = Math.sin(t * 4.4) * 0.07;
    } else if (this.mood === 'happy' || this.mood === 'proud') {
      mouthY = 0.55;
      mouthX = 1.35;
    } else if (this.mood === 'serious') {
      mouthY = 0.3;
      mouthX = 1.0;
    }
    this.mouth.scale.y += (mouthY - this.mouth.scale.y) * Math.min(1, dt * 9);
    this.mouth.scale.x += (mouthX - this.mouth.scale.x) * Math.min(1, dt * 9);

    // Cejas según el estado de ánimo
    const browZ = this.mood === 'serious' ? 0.26 : this.mood === 'surprised' ? -0.1 : 0.1;
    const browY = 0.142 + (this.mood === 'surprised' ? 0.025 : this.mood === 'serious' ? -0.012 : 0);
    this.brows.forEach((brow, i) => {
      const sx = i === 0 ? -1 : 1;
      brow.rotation.z += (browZ * sx - brow.rotation.z) * Math.min(1, dt * 6);
      brow.position.y += (browY - brow.position.y) * Math.min(1, dt * 6);
    });

    // Gestos
    let armLx = 0.42, armRx = 0.42, armLz = -0.12, armRz = 0.12;
    if (this.gestureName) {
      this.gestureT += dt;
      const gt = this.gestureT;
      if (this.gestureName === 'wave') {
        armLx = -1.35;
        armLz = -0.5 - Math.sin(gt * 9) * 0.4;
      } else if (this.gestureName === 'point') {
        armRx = -1.15;
        armRz = 0.28;
        this.head.rotation.y = Math.sin(gt * 2) * 0.1;
      } else if (this.gestureName === 'nod') {
        this.head.rotation.x = Math.sin(gt * 8) * 0.16;
      } else if (this.gestureName === 'shake') {
        this.head.rotation.y = Math.sin(gt * 9) * 0.3;
      } else if (this.gestureName === 'shrug') {
        armLz = -0.95;
        armRz = 0.95;
        armLx = armRx = -0.5;
      }
      if (gt > 1.9) {
        this.gestureName = '';
      }
    }
    if (this.lift > 0.02) {
      armRx = -0.5 - this.lift * 0.75;
      armRz = 0.5 + this.lift * 0.25;
    }
    this.armL.rotation.x += (armLx - this.armL.rotation.x) * Math.min(1, dt * 7);
    this.armR.rotation.x += (armRx - this.armR.rotation.x) * Math.min(1, dt * 7);
    this.armL.rotation.z += (armLz - this.armL.rotation.z) * Math.min(1, dt * 7);
    this.armR.rotation.z += (armRz - this.armR.rotation.z) * Math.min(1, dt * 7);

    // Cartel
    this.lift += (this.liftTarget - this.lift) * Math.min(1, dt * 5);
    if (this.placard.visible) {
      this.placard.position.y = 0.62 + this.lift * 0.86;
      this.placard.position.x = 0.4 + this.lift * 0.06;
      this.placard.rotation.z = -0.12 + Math.sin(time * 2.2) * 0.04 * this.lift;
      this.placard.rotation.y = (1 - this.lift) * 1.1;
      if (this.liftTarget === 0 && this.lift < 0.02) this.placard.visible = false;
    }

    // Insignia y aro de luz del veredicto
    if (this.liftTarget > 0 && this.lift > 0.35) {
      const pulse = this.badgeBaseScale * (1 + Math.sin(time * 2.6) * 0.05);
      this.badge.scale.setScalar(pulse);
      this.badge.position.y = 2.46 + Math.sin(time * 2) * 0.035;
      this.glow.visible = true;
      this.glow.position.y = this.badge.position.y;
      this.glow.material.opacity = 0.35 + Math.sin(time * 2.6) * 0.1;
    }

    if (this.mine) {
      this.tag.position.y = 2.86 + Math.sin(time * 2.2) * 0.05;
    }
  }
}
