/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        steam: {
          dark: '#171a21',
          light: '#1b2838',
          accent: '#66c0f4',
          text: '#c6d4df',
          hover: '#2a475e'
        }
      }
    },
  },
  plugins: [],
}
