/**
 * Colores para props que no aceptan clases de Tailwind (iconos, navegación, placeholder).
 * Deben coincidir con los tokens de tailwind.config.js.
 */
export const colors = {
  primary: '#e11d48',
  primaryDark: '#be123c',
  primaryLight: '#fb7185',
  white: '#ffffff',
  slate50: '#f8fafc',
  slate300: '#cbd5e1',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate900: '#0f172a',
  emerald700: '#047857',
  sky700: '#0369a1',
  amber800: '#92400e',
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;
