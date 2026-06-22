/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#a7f3d0',
          400: '#34d399',
          500: '#14b8a6', // Teal 500
          600: '#0d9488', // Teal 600
          900: '#134e4a',
        }
      }
    },
  },
  plugins: [],
};
