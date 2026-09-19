/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "secondary-text": "rgb(74 85 101)", // blue #4a5565
        "tertiary-text": "rgb(54 65 83)", // dark blue #364153
        "accent-background-1": "rgb(0 201 80)", // green #00c950
        "accent-background-2": "rgb(255 223 32)", // amber #ffdf20
        "accent-background-3": "rgb(173 70 255)", // violet #ad46ff
        "accent-background-4": "rgb(0 184 219)", // cyan #00b8db
        "secondary-background": "rgb(240 177 0)", // amber #f0b100
        "accent-icon": "rgb(0 201 80)", // green #00c950
      },
    },
  },
  plugins: [],
};
