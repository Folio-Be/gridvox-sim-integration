/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#39FF14",
        "background-light": "#f0f0f0",
        "background-dark": "#121212",
        "card-dark": "#1E1E1E",
        "border-dark": "#2C2C2C",
        "text-light": "#E0E0E0",
        "text-muted": "#888888",
        "green-border": "#3a5f40",
        "green-bg": "#132015",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
}
