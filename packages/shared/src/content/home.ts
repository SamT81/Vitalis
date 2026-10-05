/** Textos de la pantalla de inicio (iguales en web y móvil). Cada app pone sus iconos. */
export const HOME_CONTENT = {
  pill: 'Red Interinstitucional de Bancos de Sangre',
  title: 'Cada donación es una vida que continúa',
  lead: 'Vitalis conecta los bancos de sangre de la red RIBAS en una sola plataforma: encuentra campañas, agenda tu donación y sigue en tiempo real el impacto de cada componente sanguíneo que das.',
  kicker: 'Tecnología al servicio de la vida',
  missionLabel: 'Nuestra misión',
  mission:
    'Conectar y optimizar la Red Interinstitucional de Bancos de Sangre (RIBAS) mediante una plataforma tecnológica eficiente, ágil y transparente que facilite la gestión, donación y distribución oportuna de componentes sanguíneos para salvar vidas.',
  missionSign: '— Vitalis · RIBAS',
  benefitsTitle: 'Una red, muchos bancos de sangre',
  benefitsLead: 'Todo lo que necesitas para convertir la donación en un hábito, sin fricción.',
  stepsTitle: 'Cómo funciona',
  stepsLead: 'Tres pasos entre tú y tu próxima donación.',
  ctaTitle: 'Únete a la red de donantes y empieza a sumar estrellas',
  trust:
    'Tus datos y resultados de tamizaje se manejan de forma confidencial, conforme al Decreto 1571 de 1993 y la normativa de protección de datos vigente en Colombia.',
  copyright: '© 2026 Vitalis · RIBAS · Tecnología al servicio de la vida',
} as const;

export const HOME_STATS = [
  { value: '12,400+', label: 'Donantes activos' },
  { value: '38,200', label: 'Unidades donadas' },
  { value: '9,700', label: 'Vidas asistidas' },
] as const;

export const HOME_BENEFITS = [
  {
    id: 'gamification',
    title: 'Gamificación real',
    desc: 'Gana puntos, sube de nivel y desbloquea insignias de "Héroe" cada vez que donas sangre.',
  },
  {
    id: 'impact',
    title: 'Impacto personalizado',
    desc: 'Entérate exactamente a qué hospital y a cuántas personas ayudó tu última donación.',
  },
  {
    id: 'campaigns',
    title: 'Campañas cercanas',
    desc: 'Encuentra jornadas de la red RIBAS cerca de ti e inscríbete al instante, sin llamadas ni filas.',
  },
] as const;

export type HomeBenefitId = (typeof HOME_BENEFITS)[number]['id'];

export const HOME_STEPS = [
  {
    n: '01',
    title: 'Crea tu cuenta',
    desc: 'Regístrate como donante con tus datos básicos y tu tipo de sangre en menos de dos minutos.',
  },
  {
    n: '02',
    title: 'Elige una campaña',
    desc: 'Explora las jornadas activas y próximas de la red y reserva tu cupo cuando te convenga.',
  },
  {
    n: '03',
    title: 'Dona y sigue tu impacto',
    desc: 'Acumula puntos, sube de nivel y mira en tiempo real la vida que ayudaste a salvar.',
  },
] as const;
