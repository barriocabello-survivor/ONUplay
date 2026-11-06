import * as THREE from 'three';
import './styles.css';
import { buildChamber } from './scene/chamber.js';
import { buildDioramaStage } from './scene/dioramas.js';
import { Confetti } from './scene/fx.js';
import { audio } from './audio.js';
import { COUNTRIES, COUNTRY_BY_KEY, SEAT_ORDER, VOICES, MISSIONS, VOTE_LABEL, TALLY } from './data.js';
import * as S from './ui/screens.js';

const canvas = document.getElementById('scene');
const screenEl = document.getElementById('screen');
const topbarEl = document.getElementById('topbar');
const missionbarEl = document.getElementById('missionbar');
const toastEl = document.getElementById('toast');
const modalEl = document.getElementById('modal');
const stampEl = document.getElementById('stamp');
const appEl = document.getElementById('app');
const bootEl = document.getElementById('boot');
const fallbackEl = document.getElementById('fallback');

// Compatibilidad de canvas para navegadores sin roundRect.
const ctxProto = window.CanvasRenderingContext2D && window.CanvasRenderingContext2D.prototype;
if (ctxProto && !ctxProto.roundRect) {
  ctxProto.roundRect = function roundRect(x, y, w, h, r) {
    const rad = Math.min(typeof r === 'number' ? r : 0, Math.abs(w) / 2, Math.abs(h) / 2);
    this.moveTo(x + rad, y);
    this.arcTo(x + w, y, x + w, y + h, rad);
    this.arcTo(x + w, y + h, x, y + h, rad);
    this.arcTo(x, y + h, x, y, rad);
    this.arcTo(x, y, x + w, y, rad);
    this.closePath();
    return this;
  };
}

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 780;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const state = {
  screen: 'home',
  country: null,
  tab: 'all',
  voice: null,
  heard: new Set(),
  myVote: null,
  pendingVote: null,
  maxStep: 0,
  resultsDone: false,
};

let soundOn = readPref('mc.sound', true);
let musicOn = readPref('mc.music', true);
let typingTimer = null;
let toastTimer = null;
let revealToken = 0;
let renderer = null;
let camera = null;
let scene = null;
let chamber = null;
let dioramas = null;
let confetti = null;
let bootHidden = false;

function readPref(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v !== 'off';
  } catch (e) {
    return fallback;
  }
}
function writePref(key, value) {
  try { localStorage.setItem(key, value ? 'on' : 'off'); } catch (e) { /* modo privado */ }
}

const cam = {
  angle: 0.5,
  radius: 9.4,
  height: 4.4,
  look: new THREE.Vector3(0, 2, 0),
  tLook: new THREE.Vector3(0, 2, 0),
  pos: new THREE.Vector3(),
  tPos: new THREE.Vector3(),
  fov: 44,
  tFov: 44,
  auto: false,
  inward: false,
  spin: 0,
  userOrbit: 0,
  shake: 0,
};

/* ---------------- 3D ---------------- */

function startEngine() {
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
  } catch (error) {
    fail();
    return false;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.6 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(0.5, 4.4, 9.4);
  camera.lookAt(0, 2, 0);

  chamber = buildChamber(COUNTRIES, SEAT_ORDER);
  scene.add(chamber.root);
  dioramas = buildDioramaStage();
  scene.add(dioramas.root);
  confetti = new Confetti(document.getElementById('fx'));

  // Compilación previa: evita el tirón en el primer cambio de pantalla.
  try { renderer.compile(scene, camera); } catch (e) { /* opcional */ }

  resize();
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', onDragStart);
  canvas.addEventListener('pointermove', onDragMove);
  canvas.addEventListener('pointerup', () => { drag = null; });
  canvas.addEventListener('pointercancel', () => { drag = null; });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fail(); });

  return true;
}

function resize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function fail() {
  fallbackEl.hidden = false;
  bootEl.classList.add('is-done');
}

let drag = null;
function onDragStart(e) {
  drag = { x: e.clientX, y: e.clientY };
  try { canvas.setPointerCapture(e.pointerId); } catch (error) { /* opcional */ }
}
function onDragMove(e) {
  if (!drag) return;
  cam.userOrbit -= (e.clientX - drag.x) * 0.006;
  drag.x = e.clientX;
  drag.y = e.clientY;
}

/* ---------------- Cámara ---------------- */

function setCam({ angle, radius, height, look, fov = 44, auto = false, inward = false }) {
  cam.angle = angle;
  cam.radius = radius;
  cam.height = height;
  cam.tLook.set(look[0], look[1], look[2]);
  cam.tFov = fov;
  cam.auto = auto && !reduced;
  cam.inward = inward;
  cam.spin = 0;
  cam.userOrbit = 0;
  computeCamTarget();
}

function computeCamTarget() {
  const ang = cam.angle + cam.spin + cam.userOrbit;
  const sign = cam.inward ? -1 : 1;
  cam.tPos.set(
    cam.tLook.x + Math.sin(ang) * cam.radius * sign,
    cam.height,
    cam.tLook.z + Math.cos(ang) * cam.radius * sign
  );
}

function seatOf(key) {
  const c = key ? COUNTRY_BY_KEY[key] : null;
  return c ? chamber.delegates.get(c.k) : null;
}

/* ---------------- HUD y pantallas ---------------- */

function renderHud() {
  topbarEl.innerHTML = S.topbar(state, { sound: soundOn, music: musicOn });
  missionbarEl.innerHTML = S.missionBar(state);
}

function screenMarkup(name) {
  switch (name) {
    case 'home': return S.homeScreen();
    case 'select': return S.selectScreen(state);
    case 'briefing': return S.briefingScreen(state);
    case 'debate': return S.debateScreen(state);
    case 'vote': return S.voteScreen(state, state.pendingVote);
    case 'results': return S.resultsScreen(state);
    case 'learn': return S.learnScreen(state);
    default: return '';
  }
}

function paintScreen() {
  screenEl.innerHTML = `<section class="screen screen--${state.screen}"><div class="screen__inner">${screenMarkup(state.screen)}</div></section>`;
}

function showScreen(name) {
  window.clearInterval(typingTimer);
  typingTimer = null;
  if (name !== 'results') {
    revealToken += 1;
    stampEl.classList.remove('is-on');
  }
  if (name !== 'debate') {
    chamber.delegates.forEach((d) => d.setSpeaking(false));
    dioramas.hide();
  }
  if (name !== 'results' && name !== 'learn') chamber.clearVotes();

  state.screen = name;
  state.maxStep = Math.max(state.maxStep, S.MISSION_INDEX[name] ?? 0);
  paintScreen();
  renderHud();
  applyView(name);
  const inner = screenEl.querySelector('.screen__inner');
  if (inner) inner.scrollTop = 0;
}

function setSeatLabels(keys = []) {
  chamber.labels.forEach((label, key) => {
    label.visible = keys.includes(key);
  });
}

function applyView(name) {
  const c = state.country ? COUNTRY_BY_KEY[state.country] : null;
  const seat = seatOf(state.country);
  const a = seat ? seat.angle : 0;

  chamber.setHighlight(null);
  chamber.setSpotlight(null);
  setSeatLabels([]);
  dioramas.hide();

  switch (name) {
    case 'home':
      setCam({ angle: 0.55, radius: 9.5, height: 4.3, look: [0, 2.0, 0], fov: 44, auto: true });
      break;

    case 'select':
      setCam({ angle: 0.4, radius: 10.2, height: 7.6, look: [0, 0.6, 0], fov: 54 });
      if (state.country) chamber.setHighlight(state.country, true);
      break;

    case 'briefing':
      setCam({ angle: a + 0.35, radius: 5.9, height: 3.1, look: [0, 1.45, 0], fov: 44, auto: true });
      if (state.country) chamber.setHighlight(state.country, true);
      break;

    case 'debate': {
      const v = VOICES.find((x) => x.k === state.voice) || VOICES[0];
      const voiceSeat = seatOf(v.k);
      if (voiceSeat) {
        setCam({
          angle: voiceSeat.angle + 0.24,
          radius: 2.55,
          height: 2.65,
          look: [voiceSeat.headPos.x, 1.62, voiceSeat.headPos.z],
          fov: 48,
          inward: true,
        });
        chamber.setHighlight(v.k, true);
        setSeatLabels([v.k]);
        dioramas.show(v.diorama, new THREE.Vector3(
          Math.sin(voiceSeat.angle + 0.32) * 3.85,
          2.5,
          Math.cos(voiceSeat.angle + 0.32) * 3.85
        ));
      }
      break;
    }

    case 'vote':
      if (seat) {
        setCam({
          angle: seat.angle,
          radius: 2.15,
          height: 2.35,
          look: [seat.headPos.x, 1.58, seat.headPos.z],
          fov: 46,
          inward: true,
        });
        chamber.setSpotlight(state.country);
        chamber.setHighlight(state.country, true);
      }
      break;

    case 'results':
      setCam({ angle: 0.35, radius: 6.7, height: 5.4, look: [0, 1.3, 0], fov: 47, auto: true });
      if (state.country) chamber.setSpotlight(state.country);
      break;

    case 'learn':
      setCam({ angle: 0.7, radius: 8.6, height: 4.6, look: [0, 1.8, 0], fov: 46, auto: true });
      break;

    default:
      break;
  }
}

/* ---------------- Avisos ---------------- */

function toast(message, ms = 2800) {
  toastEl.textContent = message;
  toastEl.classList.add('is-on');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove('is-on'), ms);
}

function typeSpeech(text) {
  const el = screenEl.querySelector('[data-typed]');
  if (!el) return;
  window.clearInterval(typingTimer);
  if (reduced) {
    el.textContent = text;
    el.classList.add('is-done');
    return;
  }
  el.textContent = '';
  el.classList.remove('is-done');
  let i = 0;
  typingTimer = window.setInterval(() => {
    i += 2;
    el.textContent = text.slice(0, i);
    if (i >= text.length) {
      window.clearInterval(typingTimer);
      typingTimer = null;
      el.classList.add('is-done');
    }
  }, 16);
}

/* ---------------- Flujos ---------------- */

function goHome() {
  resetRun();
  showScreen('home');
  audio.whoosh();
}

function openSelect() {
  showScreen('select');
  audio.whoosh();
}

function pickCountry(key) {
  if (!COUNTRY_BY_KEY[key]) return;
  if (state.myVote || state.heard.size) {
    clearRoundProgress();
    chamber.delegates.forEach((d) => d.setMine(false));
    state.maxStep = 1;
  }
  state.country = key;
  const grid = screenEl.querySelector('.ctry-grid');
  const scroll = grid ? grid.scrollTop : 0;
  paintScreen();
  renderHud();
  applyView('select');
  const nextGrid = screenEl.querySelector('.ctry-grid');
  if (nextGrid) nextGrid.scrollTop = scroll;
  audio.tap();
}

function confirmCountry() {
  const c = COUNTRY_BY_KEY[state.country];
  if (!c) return;
  // Si se empieza una nueva partida desde el veredicto, se limpia el voto anterior.
  if (state.myVote || state.heard.size) {
    clearRoundProgress();
    state.maxStep = 1;
  }
  chamber.delegates.forEach((d) => d.setMine(d.country.k === c.k));
  chamber.setHighlight(c.k, true);
  audio.success();
  showScreen('briefing');
  toast(`${c.n} ocupa su silla del Consejo`);
}

function animateSpeaker(key) {
  const v = VOICES.find((x) => x.k === key);
  if (!v) return;
  chamber.delegates.forEach((d) => d.setSpeaking(false));
  const d = chamber.delegates.get(key);
  if (!d) return;
  d.setSpeaking(true);
  d.setMood(v.mood);
  d.gesture(v.gesture);
}

function openDebate() {
  if (!state.country) return openSelect();
  const key = state.voice || VOICES[0].k;
  const v = VOICES.find((x) => x.k === key) || VOICES[0];
  state.voice = v.k;
  state.heard.add(v.k);
  showScreen('debate');
  animateSpeaker(v.k);
  typeSpeech(v.speech);
  audio.whoosh();
}

function activateVoice(key) {
  const v = VOICES.find((x) => x.k === key);
  if (!v) return;
  state.voice = key;
  state.heard.add(key);
  showScreen('debate');
  animateSpeaker(key);
  typeSpeech(v.speech);
  audio.pop();
}

function nextVoice() {
  const i = VOICES.findIndex((v) => v.k === state.voice);
  const next = VOICES[(i + 1) % VOICES.length];
  activateVoice(next.k);
}

function toVote() {
  if (!state.country) return;
  if (state.myVote) {
    toast('Ya registraste tu voto. Mira el veredicto.');
    return;
  }
  showScreen('vote');
  audio.rise();
}

function pickVote(v) {
  if (state.myVote || !['y', 'n', 'a'].includes(v)) return;
  state.pendingVote = v;
  paintScreen();
  audio.tap();
  const btn = screenEl.querySelector('[data-action="confirm-vote"]');
  if (btn) btn.focus({ preventScroll: true });
}

function cancelVote() {
  state.pendingVote = null;
  paintScreen();
  audio.hover();
}

function confirmVote() {
  if (!state.pendingVote || !state.country) return;
  state.myVote = state.pendingVote;
  state.pendingVote = null;
  const c = COUNTRY_BY_KEY[state.country];
  const d = chamber.delegates.get(c.k);
  d?.gesture('nod');
  d?.setMood('happy');
  audio.medal();
  goResults();
  toast(`Voto registrado: ${VOTE_LABEL[state.myVote]}`, 2000);
}

function goResults() {
  chamber.clearVotes();
  showScreen('results');
  startReveal();
}

function revealEl(name) {
  const el = screenEl.querySelector(`[data-reveal="${name}"]`);
  if (!el) return;
  el.classList.remove('is-hidden');
  el.classList.add('is-in');
}

function updateCounter(vote, value) {
  const el = screenEl.querySelector(`[data-count="${vote}"]`);
  if (!el) return;
  el.textContent = String(value);
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
}

async function startReveal() {
  const token = ++revealToken;
  const skip = screenEl.querySelector('[data-reveal="skip"]');
  skip?.classList.remove('is-hidden');

  const order = [state.country, ...SEAT_ORDER.filter((k) => k !== state.country)].filter(Boolean);
  const counts = { y: 0, n: 0, a: 0 };

  await wait(reduced ? 0 : 500);
  for (const key of order) {
    if (token !== revealToken) return;
    const c = COUNTRY_BY_KEY[key];
    if (!c) continue;
    counts[c.v] += 1;
    chamber.delegates.get(key)?.raisePlacard();
    updateCounter(c.v, counts[c.v]);
    audio.voteTone(c.v);
    await wait(reduced ? 25 : 150);
  }

  await wait(450);
  if (token !== revealToken) return;
  stampEl.classList.add('is-on');
  audio.stamp();
  appEl.classList.add('is-shaking');
  window.setTimeout(() => appEl.classList.remove('is-shaking'), 620);
  window.setTimeout(() => stampEl.classList.remove('is-on'), 1350);

  await wait(950);
  if (token !== revealToken) return;
  revealEl('votes');
  const fill = screenEl.querySelector('.meter__fill');
  if (fill) fill.style.width = '80%';
  audio.coin();

  await wait(650);
  if (token !== revealToken) return;
  revealEl('veto');
  audio.coin();

  await wait(900);
  if (token !== revealToken) return;
  revealEl('verdict');
  audio.medal();

  await wait(500);
  if (token !== revealToken) return;
  finishReveal(token);
}

function finishReveal(token) {
  if (token !== revealToken) return;
  stampEl.classList.remove('is-on');
  state.resultsDone = true;
  revealEl('votes');
  revealEl('veto');
  revealEl('verdict');
  revealEl('actions');
  const fill = screenEl.querySelector('.meter__fill');
  if (fill) fill.style.width = '80%';
  screenEl.querySelector('[data-reveal="skip"]')?.classList.add('is-hidden');
  celebrate();
}

function skipReveal() {
  const token = ++revealToken;
  chamber.seats.forEach((s) => s.delegate.raisePlacard());
  const counts = { y: TALLY.y, n: TALLY.n, a: TALLY.a };
  Object.keys(counts).forEach((k) => updateCounter(k, counts[k]));
  finishReveal(token);
  stampEl.classList.add('is-on');
  audio.stamp();
  appEl.classList.add('is-shaking');
  window.setTimeout(() => appEl.classList.remove('is-shaking'), 620);
  window.setTimeout(() => stampEl.classList.remove('is-on'), 1100);
}

function celebrate() {
  if (!confetti) return;
  if (reduced) {
    confetti.burst(60, { x: 0.5, y: 0.35 });
    return;
  }
  confetti.burst(200, { x: 0.5, y: 0.32 });
  window.setTimeout(() => confetti.burst(90, { x: 0.16, y: 0.42 }), 260);
  window.setTimeout(() => confetti.burst(90, { x: 0.84, y: 0.42 }), 420);
  audio.success();
  audio.sparkle();
}

function restoreResults() {
  showScreen('results');
  chamber.seats.forEach((s) => s.delegate.raisePlacard());
  ['votes', 'veto', 'verdict', 'actions'].forEach((name) => revealEl(name));
  updateCounter('y', TALLY.y);
  updateCounter('n', TALLY.n);
  updateCounter('a', TALLY.a);
  const fill = screenEl.querySelector('.meter__fill');
  if (fill) fill.style.width = '80%';
  screenEl.querySelector('[data-reveal="skip"]')?.classList.add('is-hidden');
  state.resultsDone = true;
}

function toLearn() {
  showScreen('learn');
  audio.medal();
  celebrate();
}

function clearRoundProgress() {
  state.myVote = null;
  state.pendingVote = null;
  state.voice = null;
  state.heard.clear();
  state.resultsDone = false;
  chamber?.clearVotes();
  chamber?.setSpotlight(null);
  confetti?.clear();
  stampEl.classList.remove('is-on');
}

function resetRun() {
  revealToken += 1;
  window.clearInterval(typingTimer);
  typingTimer = null;
  state.country = null;
  state.voice = null;
  state.heard.clear();
  state.myVote = null;
  state.pendingVote = null;
  state.maxStep = 0;
  state.resultsDone = false;
  state.tab = 'all';
  chamber?.clearVotes();
  chamber?.setHighlight(null);
  chamber?.setSpotlight(null);
  setSeatLabels([]);
  chamber?.delegates.forEach((d) => {
    d.setMine(false);
    d.setSpeaking(false);
    d.gesture('');
  });
  dioramas?.hide();
  stampEl.classList.remove('is-on');
  confetti?.clear();
}

function replay() {
  resetRun();
  showScreen('select');
  toast('Elige un nuevo país para tu próxima misión');
  audio.whoosh();
}

function goMission(step) {
  if (step > state.maxStep) return;
  if (!state.country && step > 0) return openSelect();
  switch (step) {
    case 0:
      showScreen('select');
      break;
    case 1:
      showScreen('briefing');
      break;
    case 2: {
      const key = state.voice || VOICES[0].k;
      state.voice = key;
      state.heard.add(key);
      showScreen('debate');
      animateSpeaker(key);
      typeSpeech(VOICES.find((v) => v.k === key)?.speech ?? '');
      break;
    }
    case 3:
      if (state.myVote) toast('Ya votaste. Consulta el veredicto.');
      else showScreen('vote');
      break;
    case 4:
      if (!state.myVote) {
        toast('Primero escucha las voces y vota.');
        return;
      }
      if (state.resultsDone) restoreResults();
      else goResults();
      break;
    default:
      break;
  }
}

/* ---------------- Tutorial / audio ---------------- */

function openTutorial() {
  modalEl.innerHTML = S.tutorialModal();
  window.setTimeout(() => modalEl.querySelector('.modal-close')?.focus(), 60);
  audio.pop();
}

function closeTutorial() {
  modalEl.innerHTML = '';
}

function toggleAudio(kind) {
  audio.unlock();
  if (kind === 'sound') {
    soundOn = !soundOn;
    writePref('mc.sound', soundOn);
    audio.setEnabled(soundOn);
    if (soundOn) audio.tap();
    toast(soundOn ? 'Sonidos activados' : 'Sonidos silenciados', 1600);
  } else {
    musicOn = !musicOn;
    writePref('mc.music', musicOn);
    audio.setMusic(musicOn);
    toast(musicOn ? 'Música de aventura activada' : 'Música en pausa', 1600);
    if (musicOn) audio.chime();
  }
  renderHud();
}

let unlocked = false;
function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  audio.unlock().then(() => {
    audio.setEnabled(soundOn);
    if (musicOn) audio.startMusic();
  });
}
document.addEventListener('pointerdown', unlockAudio, { passive: true });
document.addEventListener('keydown', unlockAudio);

/* ---------------- Eventos ---------------- */

document.addEventListener('click', (event) => {
  const audioBtn = event.target.closest('[data-audio]');
  if (audioBtn) {
    toggleAudio(audioBtn.dataset.audio);
    return;
  }
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  switch (action) {
    case 'home': goHome(); break;
    case 'start': unlockAudio(); audio.whoosh(); showScreen('select'); toast('Elige la bandera de tu país'); break;
    case 'tutorial': openTutorial(); break;
    case 'close-tutorial': closeTutorial(); break;
    case 'tab': state.tab = el.dataset.tab || 'all'; paintScreen(); renderHud(); applyView('select'); audio.tap(); break;
    case 'pick-country': pickCountry(el.dataset.key); break;
    case 'confirm-country': confirmCountry(); break;
    case 'open-debate': openDebate(); break;
    case 'speak': activateVoice(el.dataset.key); break;
    case 'next-voice': nextVoice(); break;
    case 'to-vote': toVote(); break;
    case 'pick-vote': pickVote(el.dataset.v); break;
    case 'cancel-vote': cancelVote(); break;
    case 'confirm-vote': confirmVote(); break;
    case 'skip-reveal': skipReveal(); break;
    case 'to-learn': toLearn(); break;
    case 'replay': replay(); break;
    case 'mission': goMission(Number(el.dataset.step)); break;
    default: break;
  }
});

modalEl.addEventListener('click', (event) => {
  if (event.target.classList.contains('modal-backdrop')) closeTutorial();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (modalEl.innerHTML) closeTutorial();
    else if (state.pendingVote) cancelVote();
  }
});

/* ---------------- Bucle ---------------- */

let last = performance.now();
let frames = 0;
let frameTime = 0;
let qualityChecked = false;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (document.hidden) return;

  if (cam.auto && !reduced) cam.spin += dt * 0.04;
  computeCamTarget();
  const ease = 1 - Math.exp(-dt * 4.6);
  camera.position.lerp(cam.tPos, ease);
  cam.look.lerp(cam.tLook, ease);

  if (cam.shake > 0.002) {
    camera.position.x += (Math.random() - 0.5) * cam.shake;
    camera.position.y += (Math.random() - 0.5) * cam.shake;
    cam.shake *= Math.pow(0.02, dt);
  }
  camera.lookAt(cam.look);

  if (Math.abs(camera.fov - cam.tFov) > 0.01) {
    camera.fov += (cam.tFov - camera.fov) * ease;
    camera.updateProjectionMatrix();
  }

  const t = now / 1000;
  chamber.update(dt, t);
  dioramas.update(dt, t);
  renderer.render(scene, camera);

  if (!bootHidden) {
    bootHidden = true;
    bootEl.classList.add('is-done');
    window.setTimeout(() => { bootEl.style.display = 'none'; }, 800);
  }

  frames += 1;
  frameTime += dt;
  if (!qualityChecked && frameTime > 3) {
    qualityChecked = true;
    const fps = frames / frameTime;
    if (fps < 40 && renderer.getPixelRatio() > 1) {
      renderer.setPixelRatio(1);
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
}

function init() {
  if (!startEngine()) return;
  showScreen('home');
  requestAnimationFrame(frame);
}

init();
