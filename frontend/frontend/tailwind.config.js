/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'c-bg':      'var(--c-bg)',
        'c-card':    'var(--c-card)',
        'c-card2':   'var(--c-card2)',
        'c-surface': 'var(--c-surface)',
        'c-input':   'var(--c-input)',
        'c-border':  'var(--c-border)',
        'c-text':    'var(--c-text)',
        'c-text2':   'var(--c-text2)',
        'c-text3':   'var(--c-text3)',
        'c-text4':   'var(--c-text4)',
        'c-green':        'var(--c-green)',
        'c-green2':       'var(--c-green2)',
        'c-green-muted':  'var(--c-green-muted)',
        'c-green-ring':   'var(--c-green-ring)',
        'c-blue':         'var(--c-blue)',
      },
    },
  },
  plugins: [],
}
