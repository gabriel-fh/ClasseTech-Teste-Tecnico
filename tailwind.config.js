/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // 'class' instead of the default 'media': on web, react-native-css-interop reads this flag
  // after the stylesheet lands and then calls colorScheme.set(), which throws under 'media'.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cor primaria do app, derivada do azul do splash (#208AEF).
        primary: {
          50: '#eef7ff',
          100: '#d9ecff',
          200: '#bcdfff',
          300: '#8ecdff',
          400: '#59b1ff',
          500: '#3394fb',
          600: '#208aef',
          700: '#155fc2',
          800: '#18509d',
          900: '#19467c',
        },
      },
    },
  },
  plugins: [],
};
