/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#adc2ff',
          400: '#7599ff',
          500: '#4F46E5', // vibrant premium indigo/violet
          600: '#4338CA',
          700: '#3730A3',
          800: '#1E1B4B',
        },
        darkbg: {
          DEFAULT: '#070913', // ultra-dark space
          card: '#0F1225',    // dark container card
          border: '#1E2442',  // glowing border color
          input: '#151932'   // input background
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
        'glass': '0 8px 32px 0 rgba(99, 102, 241, 0.15)',
        'glass-hover': '0 8px 32px 0 rgba(99, 102, 241, 0.3)',
      }
    },
  },
  plugins: [],
}
