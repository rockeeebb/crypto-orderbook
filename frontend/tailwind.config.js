/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bull: '#16c784',
        bear: '#ea3943',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
