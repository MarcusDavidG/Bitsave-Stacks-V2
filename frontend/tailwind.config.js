/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bitcoin: '#f7931a',
        stacks: '#5546ff',
      },
    },
  },
  plugins: [],
}
