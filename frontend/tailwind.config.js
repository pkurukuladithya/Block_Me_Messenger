/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        charcoal: "#0f172a",
        indigoShade: "#4c1d95",
        accent: "#a855f7",
      },
    },
  },
  plugins: [],
};
