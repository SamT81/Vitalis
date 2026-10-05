/**
 * Tokens de marca de Vitalis · RIBAS (paleta rose del sitio original, css/global.css).
 * El bloque `primary` es idéntico en frontend-web y frontend-mobile.
 */
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

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { primary },
      fontFamily: {
        sans: [
          '"Inter Variable"',
          'Inter',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.05)',
        auth: '0 30px 60px rgba(15, 23, 42, 0.10)',
      },
    },
  },
  plugins: [],
};
