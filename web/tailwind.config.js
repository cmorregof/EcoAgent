/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        risk: {
          low: '#4ade80',    /* success */
          medium: '#f5c347', /* warn */
          high: '#f97316',
          critical: '#ff6b6b', /* danger */
        },
        obsidian: {
          bg: '#0e0e10',
          'surface-low': '#131315',
          'surface-mid': '#1a1a1c',
          'surface-high': '#222224',
          'surface-bright': '#2c2c2e',
          accent: '#3b82f6',
          'accent-dim': '#2563eb',
          primary: '#57f1db', /* Cyan */
          'on-surface': '#e8e4e7',
          'on-surface-var': '#a89fa8',
          outline: '#4a484c',
          'outline-var': '#2a282c',
        },
      },
    },
  },
  plugins: [],
};
