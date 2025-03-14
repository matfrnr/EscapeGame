/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#e07f51',
        background: '#292929'
      },
      screens: {
        'cm': '510px'
      }
    },
  },
  plugins: [],
};
