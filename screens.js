import { COUNTRIES, COUNTRY_BY_KEY, VOICES, MISSIONS, FACTS, TALLY, VOTE_LABEL, SEAT_ORDER } from '../data.js';
import { flagImg } from '../flags.js';
import { icon } from './icons.js';

export const MISSION_INDEX = {
  home: 0,
  select: 0,
  briefing: 1,
  debate: 2,
  vote: 3,
  results: 4,
  learn: 4,
};

const EMBLEM = `<svg viewBox="0 0 64 64" aria-hidden="true">
  <circle cx="32" cy="32" r="27" fill="none" stroke="currentColor" stroke-width="2.4"/>
  <circle cx="32" cy="32" r="21" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".55"/>
  <path d="M18 38c6-9 16-13 27-11-5 2-7 5-8 8 5 .2 8 2 9 5-6-1-12 0-17 3-3-2-6-4-11-5z" fill="currentColor" opacity=".95"/>
  <circle cx="32" cy="5" r="2.3" fill="currentColor"/>
</svg>`;

export function topbar(state, sound) {
  const step = MISSION_INDEX[state.screen] ?? 0;
  return `
    <button class="brand" data-action="home" aria-label="Volver al inicio">
      <span class="brand__mark">${EMBLEM}</span>
      <span class="brand__txt"><b>Misión Consejo</b><small>15 sillas · una decisión</small></span>
    </button>
    <div class="topbar__right">
      ${state.screen !== 'home' ? `<span class="chip chip--step">${icon('medal')} Misión ${step + 1}/5</span>` : ''}
      <button class="iconbtn ${sound.sound ? 'is-on' : ''}" data-audio="sound" aria-label="${sound.sound ? 'Silenciar sonidos' : 'Activar sonidos'}" aria-pressed="${sound.sound}">
        ${icon(sound.sound ? 'sound' : 'mute')}
      </button>
      <button class="iconbtn ${sound.music ? 'is-on' : ''}" data-audio="music" aria-label="${sound.music ? 'Pausar música' : 'Activar música'}" aria-pressed="${sound.music}">
        ${icon('music')}
      </button>
      ${state.screen !== 'home' ? `<button class="iconbtn" data-action="home" aria-label="Ir al inicio">${icon('home')}</button>` : ''}
    </div>`;
}

export function missionBar(state) {
  if (state.screen === 'home') return '';
  const idx = MISSION_INDEX[state.screen] ?? 0;
  const fill = (idx / (MISSIONS.length - 1)) * 100;
  return `
    <div class="missionbar__track" aria-hidden="true"><span class="missionbar__fill" style="width:${fill}%"></span></div>
    ${MISSIONS.map((m, i) => {
      const unlocked = i <= state.maxStep;
      const cls = i === idx ? 'is-current' : i < idx ? 'is-done' : unlocked ? 'is-open' : 'is-locked';
      return `<button class="mstep ${cls}" data-action="mission" data-step="${i}" ${unlocked ? '' : 'disabled'} aria-current="${i === idx ? 'step' : 'false'}">
        <span class="mstep__dot">${i < idx ? icon('check') : `<b>${i + 1}</b>`}</span>
        <span class="mstep__name">${m.name}</span>
      </button>`;
    }).join('')}`;
}

export function homeScreen() {
  return `
  <div class="home">
    <p class="kicker"><span class="kicker__pip"></span>Misión clima · ${FACTS.date}</p>
    <h1 class="title">
      <span class="title__line"><em>¿Y si tú</em></span>
      <span class="title__line">fueras el</span>
      <span class="title__line title__line--big">Consejo</span>
      <span class="title__line title__line--big">de Seguridad?</span>
    </h1>
    <p class="lede">Quince países, una mesa redonda y una carta que puede cambiar el futuro. Siéntate, escucha a las delegaciones y decide con tu voto.</p>
    <div class="home__actions">
      <button class="btn btn--gold btn--xl" data-action="start">${icon('sparkle')} Comenzar misión</button>
      <button class="btn btn--ghost" data-action="tutorial">${icon('info')} Cómo se juega</button>
    </div>
    <div class="home__facts">
      <span class="fact"><b>15</b> delegaciones</span>
      <span class="fact__sep"></span>
      <span class="fact"><b>9</b> votos para aprobar</span>
      <span class="fact__sep"></span>
      <span class="fact"><b>1</b> veto lo cambia todo</span>
    </div>
  </div>
  <p class="home__hint">${icon('hand')} Arrastra para mirar la sala</p>
  <p class="home__credit">Una historia real del Consejo de Seguridad · 2021</p>`;
}

export function selectScreen(state) {
  const tab = state.tab || 'all';
  const list = COUNTRY_BY_KEY;
  const ordered = SEAT_ORDER.map((k) => list[k]).filter(Boolean);
  const filtered = tab === 'p' ? ordered.filter((c) => c.p) : tab === 't' ? ordered.filter((c) => !c.p) : ordered;
  const selected = state.country ? COUNTRY_BY_KEY[state.country] : null;

  const cards = filtered.map((c) => `
    <button class="ctry ${state.country === c.k ? 'is-sel' : ''}" data-action="pick-country" data-key="${c.k}" aria-pressed="${state.country === c.k}">
      <span class="ctry__flag">${flagImg(c.k, 44)}</span>
      <span class="ctry__body">
        <span class="ctry__name">${c.n}</span>
        <span class="ctry__role">${c.p ? 'Permanente' : 'Temporal'}</span>
      </span>
      ${c.p ? `<span class="ctry__star" aria-label="Miembro permanente">${icon('star')}</span>` : ''}
    </button>`).join('');

  const pick = selected ? `
    <div class="dock-pick">
      <span class="dock-pick__flag">${flagImg(selected.k, 50)}</span>
      <div class="dock-pick__txt">
        <b>${selected.n}</b>
        <small>${selected.p ? 'Miembro permanente · puede usar el veto' : 'Miembro temporal · sin derecho de veto'}</small>
      </div>
      <button class="btn btn--mint btn--sm" data-action="confirm-country">Sentarme ${icon('arrow')}</button>
    </div>` : '';

  return `
  <header class="screen-head">
    <p class="kicker"><span class="kicker__pip"></span>Misión 01 · Llegada</p>
    <h2 class="h2">Elige tu silla</h2>
    <p class="screen-head__sub">Hay 15 sillas alrededor de la mesa. Cinco son permanentes y llevan una estrella dorada: su voto en contra es un <b>veto</b>.</p>
    <div class="legend">
      <span class="legend__item">${icon('star')} Permanente · con veto</span>
      <span class="legend__item">${icon('seat')} Temporal · sin veto</span>
    </div>
  </header>

  <aside class="dock" aria-label="Países">
    <div class="dock__head">
      <span class="dock__title">${icon('globe')} Delegaciones</span>
      <span class="dock__count">${filtered.length}</span>
    </div>
    <div class="tabs" role="tablist" aria-label="Filtrar países">
      <button class="tab ${tab === 'all' ? 'is-on' : ''}" role="tab" aria-selected="${tab === 'all'}" data-action="tab" data-tab="all">Todos <b>15</b></button>
      <button class="tab ${tab === 'p' ? 'is-on' : ''}" role="tab" aria-selected="${tab === 'p'}" data-action="tab" data-tab="p">Permanentes <b>5</b></button>
      <button class="tab ${tab === 't' ? 'is-on' : ''}" role="tab" aria-selected="${tab === 't'}" data-action="tab" data-tab="t">Temporales <b>10</b></button>
    </div>
    ${pick}
    <div class="ctry-grid" role="tabpanel">${cards}</div>
    <p class="dock__foot">Los 10 temporales cambian cada dos años. Los 5 permanentes siguen en la mesa.</p>
  </aside>`;
}

export function briefingScreen(state) {
  const c = COUNTRY_BY_KEY[state.country];
  return `
  <article class="letter" aria-labelledby="letter-title">
    <div class="letter__pin">${icon('scroll')}</div>
    <div class="letter__head">
      <span class="letter__kicker">Borrador de resolución</span>
      <span class="letter__code">${FACTS.draft}</span>
    </div>
    <h2 id="letter-title">Una carta llega a la mesa</h2>
    <p class="letter__place">${FACTS.place} · ${FACTS.date}</p>
    <p>El clima está cambiando la vida de muchas familias: hay sequías, inundaciones y cosechas que se pierden. A veces, cuando falta agua o comida, aparecen conflictos.</p>
    <p><b>Irlanda</b> y <b>Níger</b> escribieron esta propuesta para que el Consejo de Seguridad tenga en cuenta el clima cuando trabaja para prevenir conflictos. Ya hay <b>${FACTS.supporters} países</b> que la apoyan.</p>
    <blockquote>«Que el Consejo escuche la evidencia del clima antes de que el riesgo se convierta en conflicto.»</blockquote>
    <div class="sponsors">
      <span class="sponsors__label">La proponen</span>
      <span class="sponsor">${flagImg('ie', 34)} Irlanda</span>
      <span class="sponsor">${flagImg('ne', 34)} Níger</span>
    </div>
    <button class="btn btn--mint btn--lg" data-action="open-debate">${icon('chat')} Escuchar las voces ${icon('arrow')}</button>
  </article>

  <aside class="brief-aside">
    <div class="brief-card">
      <p class="tiny-label">Tu silla</p>
      <div class="brief-country">${flagImg(c.k, 56)}<div><b>${c.n}</b><small>${c.p ? 'Miembro permanente' : 'Miembro temporal'}</small></div></div>
      ${c.p ? `<p class="brief-note brief-note--veto">${icon('gavel')} Tu voto en contra sería un veto.</p>` : `<p class="brief-note">${icon('ballot')} Tu voto cuenta, pero no puedes vetar.</p>`}
    </div>
    <div class="brief-card brief-card--rules">
      <p class="tiny-label">Para aprobar</p>
      <ul class="rule-list">
        <li><b>9</b> votos a favor de 15</li>
        <li><b>0</b> vetos de los permanentes</li>
      </ul>
      <p class="brief-foot">Abstenerse no bloquea la propuesta.</p>
    </div>
  </aside>`;
}

export function debateScreen(state) {
  const current = VOICES.find((v) => v.k === state.voice) || VOICES[0];
  const c = COUNTRY_BY_KEY[current.k];
  const heard = state.heard.size;
  const list = VOICES.map((v) => {
    const cc = COUNTRY_BY_KEY[v.k];
    return `<button class="voice ${state.voice === v.k ? 'is-on' : ''}" data-action="speak" data-key="${v.k}" aria-pressed="${state.voice === v.k}">
      <span class="voice__flag">${flagImg(v.k, 38)}</span>
      <span class="voice__txt"><b>${cc.n}</b><small>${v.tag}</small></span>
      <span class="voice__dot voice__dot--${v.stance}" aria-hidden="true"></span>
      ${state.heard.has(v.k) ? `<span class="voice__heard" aria-label="Escuchado">${icon('check')}</span>` : ''}
    </button>`;
  }).join('');

  const header = c;
  return `
  <aside class="voices">
    <p class="kicker"><span class="kicker__pip"></span>Misión 02 · Las voces</p>
    <h2 class="h2 h2--sm">Seis miradas</h2>
    <p class="voices__hint">Toca una voz para escuchar su argumento.</p>
    <div class="voices__list">${list}</div>
    <div class="hear-meter">
      <div class="hear-meter__ring" style="--p:${(heard / VOICES.length) * 360}deg">
        <span>${heard}<small>/${VOICES.length}</small></span>
      </div>
      <p><b>Voces escuchadas</b><br><small>Escuchar también es parte de votar.</small></p>
    </div>
  </aside>

  <article class="speech" aria-live="polite">
    <div class="speech__top">
      <span class="speech__flag">${flagImg(current.k, 46)}</span>
      <div class="speech__who">
        <b>${header.n}</b>
        <small>${header.p ? 'Miembro permanente' : 'Miembro temporal'} · ${current.tag}</small>
      </div>
      <span class="stance stance--${current.stance}">${current.stance === 'y' ? icon('check') : current.stance === 'n' ? icon('cross') : icon('dash')} ${VOTE_LABEL[current.stance]}</span>
    </div>
    <h3 class="speech__headline">${current.headline}</h3>
    <p class="speech__quote" data-typed>${current.speech}</p>
    <div class="speech__bottom">
      <span class="speech__prop">${icon('sparkle')} ${current.prop}</span>
      <div class="speech__nav">
        <button class="btn btn--ghost btn--sm" data-action="next-voice">Siguiente voz ${icon('arrow')}</button>
        <button class="btn btn--mint" data-action="to-vote">${icon('ballot')} Ir al voto</button>
      </div>
    </div>
  </article>`;
}

export function voteScreen(state, pending) {
  const c = COUNTRY_BY_KEY[state.country];
  if (!c) return '';
  const tiles = [
    { v: 'y', title: 'Sí', text: 'Apoyas que el Consejo incluya el clima para prevenir conflictos.', icon: 'check' },
    { v: 'n', title: 'No', text: c.p ? 'Rechazas la propuesta. Tu no sería un veto.' : 'Rechazas la propuesta. No puedes vetar.', icon: 'cross' },
    { v: 'a', title: 'Abstención', text: 'Ni sí ni no. Abstenerse no bloquea la propuesta.', icon: 'dash' },
  ];
  const modal = pending ? `
    <div class="modal-backdrop">
      <div class="ballot-confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <span class="ballot-confirm__seal">${icon('ballot')}</span>
        <p class="tiny-label">Confirma tu voto</p>
        <h3 id="confirm-title">${flagImg(c.k, 44)} ${c.n} vota <em class="vote-word vote-word--${pending}">${VOTE_LABEL[pending]}</em></h3>
        <p>${pending === 'y' ? 'Tu voto quedará registrado en el acta de la reunión.' : pending === 'n' ? (c.p ? 'Como miembro permanente, tu no es un veto y puede frenar la propuesta.' : 'Como miembro temporal, tu no no es un veto.') : 'Abstenerse significa no votar ni sí ni no. La propuesta puede seguir.'}</p>
        <div class="ballot-confirm__actions">
          <button class="btn btn--ghost" data-action="cancel-vote">Cambiar</button>
          <button class="btn btn--gold" data-action="confirm-vote">${icon('check')} Sí, este es mi voto</button>
        </div>
      </div>
    </div>` : '';

  return `
  <div class="vote-panel">
    <p class="kicker"><span class="kicker__pip"></span>Misión 03 · Tu voto</p>
    <h2 class="h2">¿Cómo vota <span class="hl">${c.n}</span>?</h2>
    <p class="vote-panel__sub">Puedes escuchar otra vez las voces antes de decidir. Cuando votes, el Consejo contará los 15 votos.</p>
    <div class="ballots">
      ${tiles.map((t) => `
        <button class="ballot ballot--${t.v}" data-action="pick-vote" data-v="${t.v}">
          <span class="ballot__icon">${icon(t.icon)}</span>
          <span class="ballot__title">${t.title}</span>
          <span class="ballot__text">${t.text}</span>
          ${t.v === 'n' && c.p ? '<span class="ballot__flag">Poder de veto</span>' : ''}
        </button>`).join('')}
    </div>
    <div class="vote-panel__foot">
      <span>${icon('info')} Para aprobar: 9 votos a favor y ningún veto.</span>
      <button class="btn btn--ghost btn--sm" data-action="mission" data-step="2">${icon('back')} Escuchar otra vez</button>
    </div>
  </div>
  ${modal}`;
}

export function resultsScreen(state) {
  const c = COUNTRY_BY_KEY[state.country];
  const same = state.myVote === c.v;
  return `
  <header class="results__head">
    <p class="kicker"><span class="kicker__pip"></span>Misión 04 · El veredicto</p>
    <h2 class="h2">El conteo final</h2>
    <p class="results__sub">Cada cartel muestra el voto real de ese país en 2021. Mira el conteo y después la decisión más importante.</p>
  </header>

  <div class="tally" aria-label="Conteo de votos">
    ${['y', 'n', 'a'].map((v) => `
      <div class="tally__item tally__item--${v}">
        <span class="tally__ico">${v === 'y' ? icon('check') : v === 'n' ? icon('cross') : icon('dash')}</span>
        <b class="tally__num" data-count="${v}">0</b>
        <span class="tally__label">${VOTE_LABEL[v]}</span>
        <span class="tally__total">de 15</span>
      </div>`).join('')}
  </div>

  <div class="rule-row">
    <article class="rule-card is-hidden" data-reveal="votes">
      <div class="rule-card__top"><span class="tiny-label">Regla 1</span><span class="rule-badge rule-badge--ok">${icon('check')} Cumplida</span></div>
      <h3>Hacen falta 9 votos</h3>
      <div class="meter"><span class="meter__fill" style="width:0%"></span><i class="meter__mark" style="left:60%"></i></div>
      <p class="meter__labels"><span>0</span><b>9 necesarios</b><span>15</span></p>
      <p class="rule-card__text">Se alcanzaron 12 votos a favor: más de los 9 necesarios.</p>
    </article>
    <article class="rule-card is-hidden" data-reveal="veto">
      <div class="rule-card__top"><span class="tiny-label">Regla 2</span><span class="rule-badge rule-badge--no">${icon('cross')} Bloqueada</span></div>
      <h3>Ningún permanente puede votar no</h3>
      <p class="rule-card__text">Rusia, miembro permanente, votó <b>no</b>. Ese voto se llama <b>veto</b> y frena la propuesta, aunque haya 12 sí.</p>
      <p class="rule-card__text">China se abstuvo: ni sí ni no. Una abstención no bloquea.</p>
    </article>
  </div>

  <article class="verdict is-hidden" data-reveal="verdict">
    <div class="verdict__seal">${icon('gavel')}</div>
    <div class="verdict__body">
      <p class="tiny-label">Resultado</p>
      <h3>La propuesta no se aprobó</h3>
      <p><b>${TALLY.y} sí · ${TALLY.n} no · ${TALLY.a} abstención.</b> Rusia usó su veto.</p>
      <div class="verdict__compare">
        <span class="compare ${same ? 'compare--same' : ''}">${icon(same ? 'check' : 'info')} Tú votaste <b>${VOTE_LABEL[state.myVote]}</b>.</span>
        <span class="compare">${flagImg(c.k, 28)} ${c.n} votó <b>${VOTE_LABEL[c.v]}</b>.</span>
      </div>
      <div class="verdict__medal">
        <span class="result-medal">${icon('medal')}</span>
        <div><b>Medalla del Voto emitido</b><small>Escuchaste, decidiste y completaste tu misión.</small></div>
      </div>
      ${c.t ? `<p class="verdict__why">${c.t}</p>` : ''}
    </div>
  </article>

  <div class="results__actions is-hidden" data-reveal="actions">
    <button class="btn btn--gold" data-action="to-learn">${icon('medal')} Ver mis medallas</button>
    <button class="btn btn--ghost" data-action="replay">${icon('replay')} Jugar con otro país</button>
  </div>
  <button class="skip is-hidden" data-action="skip-reveal" data-reveal="skip">Saltar animación ${icon('arrow')}</button>`;
}

export function learnScreen(state) {
  const c = COUNTRY_BY_KEY[state.country];
  const heardAll = state.heard.size >= 5;
  const same = state.myVote === c.v;
  const medals = [
    { key: 'vote', on: true, title: 'Voto emitido', text: 'Te sentaste, escuchaste y decidiste.', icon: 'ballot' },
    { key: 'listen', on: heardAll, title: 'Oído atento', text: `Escuchaste ${state.heard.size} de ${VOICES.length} voces del Consejo.`, icon: 'chat' },
    { key: 'mind', on: true, title: same ? 'Sintonía con tu país' : 'Criterio propio', text: same ? `Votaste igual que ${c.n}.` : `Votaste distinto a ${c.n}. En el Consejo, cada voz cuenta.`, icon: 'star' },
  ];
  return `
  <header class="learn__head">
    <p class="kicker"><span class="kicker__pip"></span>Misión completada</p>
    <h2 class="h2">Tu carnet de delegado</h2>
    <div class="learn__delegate">${flagImg(c.k, 54)}<div><b>${c.n}</b><small>${c.p ? 'Miembro permanente' : 'Miembro temporal'} · Misión clima 2021</small></div></div>
  </header>

  <div class="medals">
    ${medals.map((m, i) => `
      <article class="medal ${m.on ? 'is-won' : 'is-locked'}" style="--i:${i}">
        <div class="medal__disc">${icon(m.icon)}<span class="medal__shine"></span></div>
        <h3>${m.title}</h3>
        <p>${m.text}</p>
      </article>`).join('')}
  </div>

  <div class="lessons">
    <article class="lesson"><span class="lesson__num">1</span><div><h3>El Consejo tiene 15 miembros</h3><p>5 permanentes y 10 temporales que cambian cada dos años.</p></div></article>
    <article class="lesson"><span class="lesson__num">2</span><div><h3>Hacen falta 9 votos, pero un veto frena todo</h3><p>Un solo no de un país permanente puede detener la propuesta.</p></div></article>
    <article class="lesson"><span class="lesson__num">3</span><div><h3>Abstenerse no bloquea</h3><p>Quien se abstiene no vota ni sí ni no, y la propuesta puede seguir adelante.</p></div></article>
  </div>

  <div class="learn__source">
    <p>${icon('info')} Fuente histórica: borrador de resolución <b>${FACTS.draft}</b> y acta de la reunión <b>${FACTS.meeting}</b> del Consejo de Seguridad de la ONU, ${FACTS.date}.</p>
  </div>

  <div class="learn__actions">
    <button class="btn btn--gold" data-action="replay">${icon('replay')} Jugar con otro país</button>
    <button class="btn btn--ghost" data-action="home">${icon('home')} Volver al inicio</button>
  </div>`;
}

export function tutorialModal() {
  const steps = [
    { n: '01', icon: 'seat', title: 'Elige tu país', text: 'Ocupa una de las 15 sillas del Consejo. Los permanentes tienen veto; los temporales, no.' },
    { n: '02', icon: 'chat', title: 'Escucha las voces', text: 'Seis delegaciones explican su punto de vista con escenas y gestos. Toca cada voz.' },
    { n: '03', icon: 'ballot', title: 'Vota y descubre', text: 'Decide sí, no o abstención. Después verás el conteo, el veto y tus medallas.' },
  ];
  return `
  <div class="modal-backdrop">
    <div class="tutorial" role="dialog" aria-modal="true" aria-labelledby="tut-title">
      <button class="modal-close" data-action="close-tutorial" aria-label="Cerrar">${icon('cross')}</button>
      <p class="kicker"><span class="kicker__pip"></span>Cómo se juega</p>
      <h2 id="tut-title">Una misión en tres pasos</h2>
      <div class="tutorial__steps">
        ${steps.map((s) => `
          <article class="tut-step">
            <span class="tut-step__num">${s.n}</span>
            <span class="tut-step__ico">${icon(s.icon)}</span>
            <h3>${s.title}</h3>
            <p>${s.text}</p>
          </article>`).join('')}
      </div>
      <button class="btn btn--gold" data-action="close-tutorial">${icon('sparkle')} Entendido</button>
    </div>
  </div>`;
}
