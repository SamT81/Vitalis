// Extiende la configuración de la raíz y agrega el plugin que ordena las clases de Tailwind
// (el plugin busca tailwind.config.js junto a este archivo).
module.exports = {
  ...require('../.prettierrc.json'),
  plugins: ['prettier-plugin-tailwindcss'],
};
