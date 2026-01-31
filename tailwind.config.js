/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          800: 'rgba(20, 20, 28, 0.8)',
          900: 'rgba(10, 10, 15, 0.9)',
          glass: 'rgba(20, 20, 28, 0.5)',
        },
        accent: {
          DEFAULT: '#d4a853',
          light: '#e5c078',
          dark: '#b8923f',
          muted: 'rgba(212, 168, 83, 0.15)',
        },
        gold: {
          400: '#e5c078',
          500: '#d4a853',
          600: '#b8923f',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 24px -4px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.04)',
        'card-hover': '0 12px 40px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 168, 83, 0.1)',
        'gold': '0 0 20px rgba(212, 168, 83, 0.15)',
        'gold-glow': '0 4px 24px -4px rgba(212, 168, 83, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
