/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dough: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f3d9a8',
          300: '#eabd6f',
          400: '#e0a03d',
          500: '#d4861f',
          600: '#b86b17',
          700: '#985215',
          800: '#7c4118',
          900: '#673718',
        },
      },
    },
  },
  plugins: [],
}
