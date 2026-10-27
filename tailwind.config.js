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
        paper: {
          50: '#fcfbf8',
          100: '#f5f2ea',
          200: '#ebe6da',
          300: '#ddd6c6',
        },
        ink: {
          300: '#b2a998',
          400: '#8c8373',
          500: '#6a6153',
          700: '#3b342b',
          900: '#171310',
        },
        accent: {
          50: '#eef2f7',
          100: '#d8e2ee',
          200: '#b3c6dc',
          600: '#1f4a74',
          700: '#163a5c',
          800: '#102840',
          900: '#0b1c2d',
        },
        moss: {
          100: '#e3ece0',
          700: '#2f5d3a',
        },
        ochre: {
          100: '#f6ecd6',
          700: '#8a5a16',
        },
        brick: {
          100: '#f3dfdb',
          700: '#8f2d1f',
        },
      },
      fontFamily: {
        display: ['Montserrat_700Bold'],
        'display-medium': ['Montserrat_600SemiBold'],
        body: ['Montserrat_400Regular'],
        'body-medium': ['Montserrat_500Medium'],
        'body-semibold': ['Montserrat_600SemiBold'],
      },
      borderRadius: {
        field: '10px',
        card: '14px',
      },
    },
  },
  plugins: [],
};
