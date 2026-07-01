/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sageBg: '#f6f1e8',
        surface: '#fffdf8',
        surface2: '#f0e8db',
        ink: '#102016',
        muted: '#566258',
        pine: '#0d1f13',
        moss: '#173022',
        leaf: '#4d9e57',
        leafBright: '#79c66a',
      },
    },
  },
  plugins: [],
}