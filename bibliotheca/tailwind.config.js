/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        "bg-base": "#0A0A0F",
        "ink": "#E8E0D0",
        "gold": "#C9A96E",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        body: ['Inter', "sans-serif"],
      },
    },
  },
  plugins: [],
}

