/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        foreground: "#f3f4f6",
        card: {
          DEFAULT: "#111827",
          foreground: "#f3f4f6",
        },
        popover: {
          DEFAULT: "#111827",
          foreground: "#f3f4f6",
        },
        primary: {
          DEFAULT: "#6366F1",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1F2937",
          foreground: "#f3f4f6",
        },
        muted: {
          DEFAULT: "#1F2937",
          foreground: "#9ca3af",
        },
        accent: {
          DEFAULT: "#3B82F6",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "rgba(255,255,255,0.06)",
        input: "rgba(255,255,255,0.06)",
        ring: "#6366F1",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
