/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#4f8ef7',
          green: '#3ecf8e',
        },
      },
    },
  },
  plugins: [],
}
