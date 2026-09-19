/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "secondary-text": "rgb(51 65 85)", // dark blue #334155
        "accent-background-1": "rgb(173 70 255)", // violet #ad46ff
        "accent-background-2": "rgb(0 201 80)", // green #00c950
        "accent-background-3": "rgb(0 184 219)", // cyan #00b8db
        "accent-background-4": "rgb(240 177 0)", // amber #f0b100
        "secondary-background": "rgb(51 65 85)", // dark blue #334155
      },
    },
  },
  plugins: [],
};
