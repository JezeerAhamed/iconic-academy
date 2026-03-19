import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-source-sans)",
          "Source Sans 3",
          "Source Sans Pro",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      colors: {
        // WCAG AA verified text/background pairs used across the app:
        // text-cgray-600 on bg-white / bg-cgray-50
        // text-cgray-900 on bg-white / bg-cgray-50
        // text-cgreen-600 on bg-cgreen-50
        // text-white on bg-cblue-500
        cblue: {
          25: "#F0F4FF",
          50: "#E6EEFA",
          100: "#CCDCF5",
          200: "#99BAE8",
          300: "#6697DB",
          400: "#3375CE",
          500: "#0056D2",
          600: "#0047B3",
          700: "#003894",
          800: "#002975",
          900: "#001A56",
        },
        cgray: {
          0: "#FFFFFF",
          25: "#FAFAFA",
          50: "#F5F5F5",
          100: "#EEEEEE",
          200: "#E0E0E0",
          300: "#BDBDBD",
          400: "#9E9E9E",
          500: "#757575",
          600: "#616161",
          700: "#424242",
          800: "#212121",
          900: "#1F1F1F",
        },
        cgreen: {
          50: "#E8F5E9",
          100: "#C8E6C9",
          500: "#2E7D32",
          600: "#1B5E20",
        },
        cyellow: {
          400: "#F5BE41",
          500: "#F9A825",
        },
        cred: {
          50: "#FFEBEE",
          500: "#C62828",
        },
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.2" }],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        semibold: "600",
        bold: "700",
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.12)",
        nav: "0 1px 0 0 #E0E0E0",
        dropdown: "0 4px 12px rgba(0,0,0,0.15)",
        modal: "0 8px 32px rgba(0,0,0,0.18)",
        none: "none",
      },
      maxWidth: {
        site: "1200px",
        coursera: "1200px",
      },
    },
  },
};

export default config;
