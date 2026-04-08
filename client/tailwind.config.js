/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        crm: {
          sidebar: '#0f172a',
          accent: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
};
