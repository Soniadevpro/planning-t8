/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ratp-blue': '#004494',
        'ratp-green': '#00A566',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}