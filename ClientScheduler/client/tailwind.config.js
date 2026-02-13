/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mithra: {
          black: 'var(--body-bg)', // Semantic mapping
          surface: 'var(--surface-bg)',
          merino: 'rgb(var(--color-merino) / <alpha-value>)',
          text: 'var(--text-primary)',
          dim: 'var(--text-dim)',
          border: 'var(--glass-border)',
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
          visor: 'rgb(var(--color-visor) / <alpha-value>)',
          wine: 'rgb(var(--color-wine) / <alpha-value>)',
          soft: 'var(--accent-soft)',
          glow: 'var(--accent-glow)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}

