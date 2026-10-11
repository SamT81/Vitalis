/**
 * Tokens de marca de Vitalis · RIBAS.
 *
 * Toda la paleta sale de tres colores: azul marino #0F2347, rojo #E11D48 y rosado #E2C9CB,
 * sobre fondo blanco. Las escalas son tonos más claros u oscuros de esos mismos colores.
 */

/** Rojo de marca. Se reserva para la acción principal y los errores. */
const primary = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
  600: '#e11d48',
  700: '#be123c',
  800: '#9f1239',
  900: '#881337',
  DEFAULT: '#e11d48',
  foreground: '#ffffff',
};

/**
 * Neutros derivados del azul marino. Reemplazan la escala `slate` de Tailwind para que
 * textos, bordes y superficies compartan el mismo matiz. 900 es el marino de marca.
 */
const slate = {
  50: '#f5f6f9',
  100: '#eceef3',
  200: '#dadee7',
  300: '#bcc3d2',
  400: '#8e98af',
  500: '#66728f',
  600: '#47557a',
  700: '#2c3c63',
  800: '#1b2d54',
  900: '#0f2347',
  950: '#0a1832',
};

/** Rosado de marca y sus tonos: superficies cálidas, nunca texto. */
const blush = {
  50: '#fbf6f6',
  100: '#f6eced',
  200: '#eddcdd',
  300: '#e2c9cb',
  400: '#d0abae',
  DEFAULT: '#e2c9cb',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { primary, slate, blush },
      fontFamily: {
        sans: ['"Geist Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        display: ['"Newsreader Variable"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      fontSize: {
        // Titulares: tamaño fluido, interlineado apretado y tracking negativo.
        'display-xl': ['clamp(2.5rem, 6.4vw, 5.25rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 4.4vw, 3.5rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.625rem, 3vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      spacing: {
        // Ritmo vertical entre secciones de la portada.
        section: 'clamp(4.5rem, 10vw, 9rem)',
      },
      borderRadius: {
        // Regla de radios: controles en píldora, campos en `xl`, superficies grandes en `panel`.
        panel: '1.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 35, 71, 0.04), 0 12px 32px -12px rgba(15, 35, 71, 0.12)',
        auth: '0 24px 64px -24px rgba(15, 35, 71, 0.22)',
      },
      transitionTimingFunction: {
        'out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out-strong': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
    },
  },
  plugins: [],
};
