/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A1628",
        cyan: "#1ECAD3",
        teal: "#0FA3B1",
        gold: "#C8A96E",
      },
      fontFamily: {
        fraunces: ["Fraunces", "serif"],
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};