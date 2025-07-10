/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F5DC",
        tangy: "#FF6B35",
      },
      fontFamily: {
        meowscript: ["MeowScript", "cursive"],
      },
    },
  },
  plugins: [],
};
