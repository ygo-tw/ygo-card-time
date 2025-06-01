/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    screens: {
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1920px',
    },
    extend: {
      colors: {
        primary: {
          50: '#f7f7f8',
          100: '#eeeff1',
          200: '#dadce1',
          300: '#bbbfc7',
          400: '#969ba8',
          500: '#797e8e',
          600: '#64647c',
          700: '#535466',
          800: '#474856',
          900: '#2f323f',
          950: '#1f2029',
          DEFAULT: '#2f323f', // 預設的 primary 顏色
        },
        secondary: {
          50: '#f8f8f9',
          100: '#f1f1f3',
          200: '#e1e1e6',
          300: '#cbcbd3',
          400: '#afafbc',
          500: '#9999a9',
          600: '#64647c',
          700: '#5a5a70',
          800: '#4d4d5e',
          900: '#42424f',
          950: '#2a2a33',
          DEFAULT: '#64647c', // 預設的 secondary 顏色
        },
        accent: {
          50: '#fdf9f0',
          100: '#faf2e0',
          200: '#f4e2c0',
          300: '#eccc95',
          400: '#e3b168',
          500: '#dc9a46',
          600: '#c49f3b',
          700: '#a67e31',
          800: '#88652b',
          900: '#705428',
          950: '#3d2c13',
          DEFAULT: '#c49f3b', // 預設的 accent 顏色
        },
      },
    },
  },
  plugins: [],
};
