/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mithra: {
          black: 'rgb(var(--color-black) / <alpha-value>)',
          surface: 'rgb(var(--color-surface) / <alpha-value>)',
          merino: 'rgb(var(--color-merino) / <alpha-value>)',
          dim: 'rgb(var(--color-merino) / 0.6)',
        },
        accent: {
          visor: 'rgb(var(--color-visor) / <alpha-value>)',
          wine: 'rgb(var(--color-wine) / <alpha-value>)',
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

