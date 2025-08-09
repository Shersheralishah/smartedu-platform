// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ... your files
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        progressBar: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animation: {
        progress: 'progressBar linear forwards', // No duration here, it will be set by JS
      },
    },
  },
  plugins: [],
};