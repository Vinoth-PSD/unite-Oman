/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pink:   { DEFAULT: '#E8317A', light: '#FCE8F1', mid: '#F472A8' },
        orange: { DEFAULT: '#F05A28', light: '#FEF0EA' },
        purple: { DEFAULT: '#5B2D8E', light: '#EDE5F7', mid: '#9B59D0', dark: '#3D1C63' },
        ink:    '#0F0A1A',
        hero:   '#0A0614',
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Instrument Serif', 'serif'],
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(90deg, #E8317A 0%, #F05A28 50%, #5B2D8E 100%)',
        'brand-diag': 'linear-gradient(135deg, #E8317A 0%, #F05A28 45%, #5B2D8E 100%)',
      },
    },
  },
  plugins: [],
}
