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
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: { primary },
      // En React Native cada peso es una familia distinta (ver src/components/ui/text.tsx).
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
