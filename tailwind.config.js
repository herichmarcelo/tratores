/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#198754',
          600: '#0F6D2B',
          700: '#065f46',
          800: '#064e3b',
          900: '#064e3b',
        },
        accent: '#FFC107',
        background: '#F5F7F5',
      },
    },
  },
  plugins: [],
}
