/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fff0ee',
          100: '#ffd5ce',
          400: '#ff6644',
          500: '#FF2300',
          600: '#cc1c00',
          700: '#991500',
        }
      }
    },
  },
  plugins: [],
}
