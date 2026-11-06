// Iconos dibujados como SVG en línea: mismo trazo redondeado que la tipografía.
const s = (body, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;

export const ICONS = {
  seat: s('<path d="M5 19v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6"/><path d="M3 19h18"/><path d="M7 11V6.5A2.5 2.5 0 0 1 9.5 4h5A2.5 2.5 0 0 1 17 6.5V11"/><path d="M9 8h6"/>'),
  scroll: s('<path d="M7 4h9a2 2 0 0 1 2 2v13a2 2 0 0 0 2-2V6"/><path d="M7 4a2 2 0 0 0-2 2v11a3 3 0 0 0 3 3h10"/><path d="M9 9h6M9 13h6M9 17h4"/>'),
  chat: s('<path d="M20 15.5a2.5 2.5 0 0 1-2.5 2.5H9l-4 3v-4.5A2.5 2.5 0 0 1 3 14V7a2.5 2.5 0 0 1 2.5-2.5h12A2.5 2.5 0 0 1 20 7z"/><path d="M8 9h8M8 12.5h5"/>'),
  ballot: s('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8.5 12 2.5 2.5 4.8-5"/>'),
  medal: s('<circle cx="12" cy="14.5" r="5.5"/><path d="m8.5 9.5-3-6M15.5 9.5l3-6"/><path d="m12 11.8.9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1L9 14l2.1-.3z"/>'),
  check: s('<path d="m4.5 12.5 4.5 4.5L19.5 6.5"/>'),
  cross: s('<path d="m6 6 12 12M18 6 6 18"/>'),
  dash: s('<path d="M5 12h14"/>'),
  star: s('<path d="m12 3.5 2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.6l5.9-.8z"/>'),
  sound: s('<path d="M11 5 6.5 8.5H3.5v7h3L11 19z"/><path d="M15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>'),
  mute: s('<path d="M11 5 6.5 8.5H3.5v7h3L11 19z"/><path d="m15.5 9.5 5 5M20.5 9.5l-5 5"/>'),
  music: s('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
  home: s('<path d="m4 10.5 8-6.5 8 6.5"/><path d="M6.5 9.5V19h11V9.5"/><path d="M10 19v-5h4v5"/>'),
  arrow: s('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  back: s('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  replay: s('<path d="M4 10a8 8 0 1 1 2.3 6.3"/><path d="M4 4v6h6"/>'),
  info: s('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none"/>'),
  globe: s('<circle cx="12" cy="12" r="8.5"/><path d="M3.6 12h16.8M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5S14.4 18.2 12 20.5C9.6 18.2 8.4 15.3 8.4 12S9.6 5.8 12 3.5"/>'),
  sparkle: s('<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>'),
  hand: s('<path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M14 10.5V6.5a1.5 1.5 0 0 1 3 0V13"/><path d="M17 11a1.5 1.5 0 0 1 3 0v3.5A6.5 6.5 0 0 1 13.5 21h-1a6 6 0 0 1-4.6-2.2L4 14.5a1.7 1.7 0 0 1 2.6-2.1L8 14"/>'),
  gavel: s('<path d="m14 4 6 6-3 3-6-6z"/><path d="m10.5 9.5-7 7 3 3 7-7"/><path d="M3 21h9"/>'),
  scrollSmall: s('<path d="M6 4h10v13a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2z"/><path d="M9 8h5M9 12h5"/>'),
};

export const icon = (name, cls = '') => `<span class="ic ${cls}">${ICONS[name] || ICONS.sparkle}</span>`;
