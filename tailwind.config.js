/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Тот самый синий цвет Telegram для будущего
        tg: {
          blue: '#0088cc',
          light: '#6abfef'
        }
      }
    },
  },
  plugins: [],
}
