// Datos históricos: borrador S/2021/990 y reunión S/PV.8926 (13 de diciembre de 2021).
// Se conservan los 15 países, sus votos y la explicación del veto.

export const VOTE_LABEL = { y: 'Sí', n: 'No', a: 'Abstención' };

export const VOTE_COLOR = { y: '#3ED3A3', n: '#FF7C6B', a: '#B79CFF' };

export const COUNTRIES = [
  { k: 'us', n: 'Estados Unidos', p: 1, v: 'y', role: 'Permanente',
    t: 'Votó a favor: consideró que el clima también es un asunto de paz y seguridad.' },
  { k: 'gb', n: 'Reino Unido', p: 1, v: 'y', role: 'Permanente',
    t: 'Votó a favor de que el Consejo escuche la evidencia sobre el clima.' },
  { k: 'fr', n: 'Francia', p: 1, v: 'y', role: 'Permanente',
    t: 'Votó a favor: para Francia, prevenir conflictos incluye cuidar el clima.' },
  { k: 'ru', n: 'Rusia', p: 1, v: 'n', role: 'Permanente',
    t: 'Como es un país permanente, su no fue un veto. Dijo que la propuesta no era aceptable y que el clima no debía tratarse en el Consejo.' },
  { k: 'cn', n: 'China', p: 1, v: 'a', role: 'Permanente',
    t: 'Se abstuvo: ni sí ni no. Opinó que la ONU tiene otros espacios más adecuados para hablar del clima.' },
  { k: 'ie', n: 'Irlanda', v: 'y', role: 'Temporal', sponsor: true,
    t: 'Escribió la propuesta junto con Níger y pidió que el Consejo se prepare para los riesgos del clima.' },
  { k: 'ne', n: 'Níger', v: 'y', role: 'Temporal', sponsor: true,
    t: 'Escribió la propuesta junto con Irlanda: en su región, la sequía ya cambia la vida de las familias.' },
  { k: 'ke', n: 'Kenia', v: 'y', role: 'Temporal',
    t: 'Votó a favor: la sequía y las inundaciones ya afectan la seguridad de muchas comunidades.' },
  { k: 'mx', n: 'México', v: 'y', role: 'Temporal',
    t: 'Votó a favor de incluir el clima en la prevención de conflictos.' },
  { k: 'no', n: 'Noruega', v: 'y', role: 'Temporal',
    t: 'Votó a favor: trabajar con anticipación cuesta menos que responder a una crisis.' },
  { k: 'ee', n: 'Estonia', v: 'y', role: 'Temporal',
    t: 'Votó a favor de que el Consejo reciba información sobre riesgos climáticos.' },
  { k: 'vc', n: 'San Vicente y las Granadinas', v: 'y', role: 'Temporal',
    t: 'Votó a favor: los pequeños Estados insulares sienten el clima como una amenaza real.' },
  { k: 'tn', n: 'Túnez', v: 'y', role: 'Temporal',
    t: 'Votó a favor: el clima y la seguridad se cruzan en el norte de África.' },
  { k: 'vn', n: 'Vietnam', v: 'y', role: 'Temporal',
    t: 'Votó a favor: su costa y sus cultivos ya enfrentan eventos extremos.' },
  { k: 'in', n: 'India', v: 'n', role: 'Temporal',
    t: 'Dijo que apoya la acción contra el cambio climático, pero que el lugar para hablar de eso son otros espacios de la ONU y que la propuesta podía dividir a los países.' },
];

export const COUNTRY_BY_KEY = Object.fromEntries(COUNTRIES.map((c) => [c.k, c]));

// Orden de la mesa (igual que el original).
export const SEAT_ORDER = 'us ie ne gb ke mx fr no ee ru vc tn cn vn in'.split(' ');

// Voces clave de la misión 2: seis delegaciones con posturas distintas.
export const VOICES = [
  {
    k: 'ie', stance: 'y', tag: 'Propone', diorama: 'letter', gesture: 'point', mood: 'proud',
    headline: 'Una carta para la mesa',
    speech: 'Con Níger escribimos esta propuesta. El clima ya está cambiando la vida de muchas familias, y queremos que el Consejo pueda mirar esos riesgos antes de que se conviertan en conflictos.',
    prop: 'La carta S/2021/990',
  },
  {
    k: 'ne', stance: 'y', tag: 'Propone', diorama: 'drought', gesture: 'wave', mood: 'serious',
    headline: 'El lago que se hizo grieta',
    speech: 'En mi región el agua falta cada vez más y las cosechas se pierden. Cuando la gente no tiene qué comer, es más fácil que aparezcan peleas. Por eso pedimos ayuda a tiempo.',
    prop: 'Tierra seca y un brote',
  },
  {
    k: 'us', stance: 'y', tag: 'Apoya', diorama: 'shield', gesture: 'nod', mood: 'happy',
    headline: 'Prevenir es proteger',
    speech: 'Apoyamos la propuesta. Si el Consejo conoce los riesgos del clima, puede ayudar a prevenir conflictos y proteger a más personas. Es mejor actuar antes que llegar tarde.',
    prop: 'Un escudo que protege',
  },
  {
    k: 'ru', stance: 'n', tag: 'Veto', diorama: 'stamp', gesture: 'shake', mood: 'serious',
    headline: 'El sello que frena todo',
    speech: 'No estamos de acuerdo. El clima es importantísimo, pero este no es el lugar para tratarlo, y esta propuesta no es aceptable. Como miembro permanente, usamos nuestro voto: veto.',
    prop: 'El sello del veto',
  },
  {
    k: 'cn', stance: 'a', tag: 'Se abstiene', diorama: 'signpost', gesture: 'shrug', mood: 'calm',
    headline: 'Ni sí, ni no',
    speech: 'Nos abstenemos. Creemos que la ONU debe ocuparse del clima, pero en otros espacios que ya existen para eso. Abstenerse no es lo mismo que vetar: no frena la propuesta.',
    prop: 'Tres caminos posibles',
  },
  {
    k: 'in', stance: 'n', tag: 'Se opone', diorama: 'split', gesture: 'point', mood: 'serious',
    headline: 'Dos grupos, una grieta',
    speech: 'Apoyamos la acción por el clima, pero nos preocupa que esta propuesta divida a los países y que el Consejo no sea el espacio correcto. Por eso votamos no.',
    prop: 'La grieta entre grupos',
  },
];

export const MISSIONS = [
  { id: 'arrival', name: 'Llegada', icon: 'seat', caption: 'Elige tu silla en la mesa' },
  { id: 'proposal', name: 'La propuesta', icon: 'scroll', caption: 'Lee la carta de Irlanda y Níger' },
  { id: 'voices', name: 'Las voces', icon: 'chat', caption: 'Escucha a seis delegaciones' },
  { id: 'vote', name: 'Tu voto', icon: 'ballot', caption: 'Sí, no o abstención' },
  { id: 'verdict', name: 'Veredicto', icon: 'medal', caption: 'Conteo, veto y medallas' },
];

export const TALLY = COUNTRIES.reduce(
  (acc, c) => { acc[c.v] += 1; return acc; },
  { y: 0, n: 0, a: 0 }
);

export const FACTS = {
  date: '13 de diciembre de 2021',
  place: 'Nueva York',
  draft: 'S/2021/990',
  meeting: 'S/PV.8926',
  supporters: 113,
  needed: 9,
  permanent: 5,
};
