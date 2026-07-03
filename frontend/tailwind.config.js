/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: hsl(222.2, 84%, 4.5%),
          foreground: hsl(210, 40%, 98%),
        },
        secondary: {
          DEFAULT: hsl(210, 40%, 96%),
          foreground: hsl(222.2, 84%, 4.5%),
        },
        destructive: {
          DEFAULT: hsl(0, 84%, 60.2%),
          foreground: hsl(210, 40%, 98%),
        },
        muted: {
          DEFAULT: hsl(210, 40%, 96%),
          foreground: hsl(215, 28%, 48%),
        },
        accent: {
          DEFAULT: hsl(210, 40%, 96%),
          foreground: hsl(222.2, 84%, 4.5%),
        },
        background: "hsl(var(--background))",
        card: {
          DEFAULT: hsl(var(--card)),
          foreground: hsl(var(--card-foreground)),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Menlo", "Monaco", "monospace"],
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-custom": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-custom": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
