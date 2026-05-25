/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        night: {
          950: '#07070d',
          900: '#0b0b14',
          800: '#11111c',
          700: '#1a1a2a',
          600: '#262640',
          500: '#3a3a5a',
        },
        moon: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        ember: {
          400: '#fbbf77',
          500: '#f59e4f',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
