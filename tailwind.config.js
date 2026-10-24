/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // 'class' instead of the default 'media': on web, react-native-css-interop reads this flag
  // after the stylesheet lands and then calls colorScheme.set(), which throws under 'media'.
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
