import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Incident Dossier Color Palette
      colors: {
        // Base surfaces
        paper: "#F4F1EA",
        surface: "#FFFFFF",

        // Ink colors
        ink: {
          DEFAULT: "#0B1220",
          subtle: "#475569",
          muted: "#64748B",
        },

        // Rule & border
        rule: "#E6E2D8",

        // Accent colors
        accent: {
          ops: {
            DEFAULT: "#0F766E",
            light: "#14B8A6",
            dark: "#0D5D56",
          },
          info: {
            DEFAULT: "#1D4ED8",
            light: "#3B82F6",
            dark: "#1E40AF",
          },
          legal: {
            DEFAULT: "#B91C1C",
            light: "#DC2626",
            dark: "#991B1B",
          },
          warning: {
            DEFAULT: "#D97706",
            light: "#F59E0B",
            dark: "#B45309",
          },
          success: {
            DEFAULT: "#166534",
            light: "#22C55E",
            dark: "#14532D",
          },
        },

        // Semantic aliases for quick use
        dossier: {
          paper: "#F4F1EA",
          cardstock: "#FFFFFF",
          ink: "#0B1220",
          slate: "#475569",
          rule: "#E6E2D8",
          teal: "#0F766E",
          blue: "#1D4ED8",
          red: "#B91C1C",
          amber: "#D97706",
          green: "#166534",
        },
      },

      // Typography
      fontFamily: {
        heading: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Menlo", "monospace"],
      },

      fontSize: {
        // Custom sizes for dossier typography
        "dossier-title": ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "0.01em", fontWeight: "700" }],
        "dossier-subtitle": ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "0.005em", fontWeight: "600" }],
        "dossier-body": ["0.9375rem", { lineHeight: "1.5rem" }],
        "dossier-caption": ["0.8125rem", { lineHeight: "1.25rem" }],
        "dossier-label": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.05em", fontWeight: "600" }],
        "dossier-mono": ["0.75rem", { lineHeight: "1rem" }],
      },

      // Border radius - more refined, less bubbly
      borderRadius: {
        "dossier-surface": "10px",
        "dossier-control": "8px",
        "dossier-chip": "999px",
        "dossier-sm": "6px",
      },

      // Shadows - tactile, not fluffy
      boxShadow: {
        "dossier-surface": "0 1px 2px 0 rgba(11, 18, 32, 0.04), 0 1px 3px 0 rgba(11, 18, 32, 0.06)",
        "dossier-elevated": "0 2px 4px -1px rgba(11, 18, 32, 0.06), 0 4px 6px -1px rgba(11, 18, 32, 0.08)",
        "dossier-bevel": "0 1px 0 0 rgba(255, 255, 255, 0.8) inset, 0 -1px 0 0 rgba(11, 18, 32, 0.08) inset, 0 1px 2px 0 rgba(11, 18, 32, 0.12)",
        "dossier-pressed": "0 1px 1px 0 rgba(11, 18, 32, 0.12) inset",
        "dossier-focus": "0 0 0 2px #F4F1EA, 0 0 0 4px #1D4ED8",
      },

      // Spacing utilities
      spacing: {
        "dossier-gutter": "1.5rem",
        "dossier-section": "2rem",
      },

      // Background images for textures
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        "ledger-lines": "repeating-linear-gradient(to bottom, transparent, transparent 31px, #E6E2D8 31px, #E6E2D8 32px)",
      },

      // Animation
      keyframes: {
        "stamp-in": {
          "0%": { transform: "scale(1.5) rotate(-5deg)", opacity: "0" },
          "50%": { transform: "scale(0.95) rotate(0deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "seal-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(15, 118, 110, 0.4)" },
          "50%": { boxShadow: "0 0 0 4px rgba(15, 118, 110, 0)" },
        },
      },
      animation: {
        "stamp-in": "stamp-in 0.3s ease-out",
        "seal-pulse": "seal-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
