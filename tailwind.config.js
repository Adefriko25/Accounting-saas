/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0e1a',
          800: '#0f1629',
          700: '#141c33',
          600: '#1a2342',
        },
        glass: {
          DEFAULT: 'rgba(15, 22, 41, 0.7)',
          border: 'rgba(255, 255, 255, 0.06)',
          hover: 'rgba(255, 255, 255, 0.03)',
        },
        accent: {
          blue: '#3b82f6',
          emerald: '#10b981',
          rose: '#f43f5e',
          purple: '#8b5cf6',
          amber: '#f59e0b',
          cyan: '#06b6d4',
        }
      },
      backdropBlur: {
        glass: '20px',
      }
    },
  },
  plugins: [],
}
