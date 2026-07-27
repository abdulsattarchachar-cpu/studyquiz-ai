/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#e0eaff",
          500: "#4f6df5",
          600: "#3d54e0",
          700: "#2f42b8",
        },
      },
    },
  },
  plugins: [],
};
