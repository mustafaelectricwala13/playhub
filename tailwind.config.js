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
          50: '#f0f5ff',
          100: '#e0ebff',
          500: '#4338ca',
          600: '#4f46e5',
          700: '#3730a3',
          neon: '#6366f1',
          accent: '#ec4899',
          yellow: '#f59e0b',
          cyan: '#06b6d4',
          emerald: '#10b981',
          dark: '#0b0f19',
          card: '#111827',
          surface: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
        arcade: ['"Orbitron"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif']
      },
      animation: {
        'bounce-soft': 'bounceSoft 2s infinite',
        'pulse-glow': 'pulseGlow 2.5s infinite',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.6))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.3))' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      }
    },
  },
  plugins: [],
}

