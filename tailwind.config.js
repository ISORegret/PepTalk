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
          DEFAULT: '#5EEAD4',
          light: '#99F6E4',
          dark: '#14B8A6',
          muted: 'rgba(94, 234, 212, 0.15)',
        },
        gold: {
          400: '#5EEAD4',
          500: '#5EEAD4',
          600: '#14B8A6',
        },
        success: '#22C55E',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 24px -4px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(94, 234, 212, 0.24)',
        'card-hover': '0 12px 40px -8px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(94, 234, 212, 0.36)',
        'gold': '0 0 20px rgba(94, 234, 212, 0.15)',
        'gold-glow': '0 4px 24px -4px rgba(94, 234, 212, 0.28)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
