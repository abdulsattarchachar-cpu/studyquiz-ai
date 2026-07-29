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
          50: "#EEF2FF",
          100: "#e0e7ff",
          500: "#4F6DF5",
          600: "#3F5AE5",
          700: "#2f42b8",
        },
        ink: {
          900: "#0F172A",
          600: "#475569",
        },
        surface: "#F8FAFC",
        line: "#E2E8F0",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#06B6D4",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
        control: "14px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)",
        lift: "0 8px 24px rgba(15,23,42,0.10)",
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [],
};
