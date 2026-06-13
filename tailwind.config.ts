import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* === Material Design 3 Tokens === */
        surface: "var(--surface)",
        surfaceDim: "var(--surface-dim)",
        surfaceBright: "var(--surface-bright)",
        surfaceContainerLowest: "var(--surface-container-lowest)",
        surfaceContainerLow: "var(--surface-container-low)",
        surfaceContainer: "var(--surface-container)",
        surfaceContainerHigh: "var(--surface-container-high)",
        surfaceContainerHighest: "var(--surface-container-highest)",
        onSurface: "var(--on-surface)",
        onSurfaceVariant: "var(--on-surface-variant)",
        inverseSurface: "var(--inverse-surface)",
        inverseOnSurface: "var(--inverse-on-surface)",
        outline: "var(--outline)",
        outlineVariant: "var(--outline-variant)",
        surfaceTint: "var(--surface-tint)",
        primary: "var(--primary)",
        onPrimary: "var(--on-primary)",
        primaryContainer: "var(--primary-container)",
        onPrimaryContainer: "var(--on-primary-container)",
        inversePrimary: "var(--inverse-primary)",
        secondary: "var(--secondary)",
        onSecondary: "var(--on-secondary)",
        secondaryContainer: "var(--secondary-container)",
        onSecondaryContainer: "var(--on-secondary-container)",
        tertiary: "var(--tertiary)",
        onTertiary: "var(--on-tertiary)",
        tertiaryContainer: "var(--tertiary-container)",
        onTertiaryContainer: "var(--on-tertiary-container)",
        error: "var(--error)",
        onError: "var(--on-error)",
        errorContainer: "var(--error-container)",
        onErrorContainer: "var(--on-error-container)",
        primaryFixed: "var(--primary-fixed)",
        primaryFixedDim: "var(--primary-fixed-dim)",
        onPrimaryFixed: "var(--on-primary-fixed)",
        onPrimaryFixedVariant: "var(--on-primary-fixed-variant)",
        secondaryFixed: "var(--secondary-fixed)",
        secondaryFixedDim: "var(--secondary-fixed-dim)",
        onSecondaryFixed: "var(--on-secondary-fixed)",
        onSecondaryFixedVariant: "var(--on-secondary-fixed-variant)",
        tertiaryFixed: "var(--tertiary-fixed)",
        tertiaryFixedDim: "var(--tertiary-fixed-dim)",
        onTertiaryFixed: "var(--on-tertiary-fixed)",
        onTertiaryFixedVariant: "var(--on-tertiary-fixed-variant)",
        background: "var(--background)",
        onBackground: "var(--on-background)",
        surfaceVariant: "var(--surface-variant)",

        /* === Shadcn Generic Aliases (mapped to MD3) === */
        border: "var(--outline-variant)",
        input: "var(--outline)",
        ring: "var(--primary)",
        foreground: "var(--on-background)",
        "primary-foreground": "var(--on-primary)",
        "secondary-foreground": "var(--on-secondary)",
        muted: {
          DEFAULT: "var(--surface-container-low)",
          foreground: "var(--on-surface-variant)",
        },
        accent: {
          DEFAULT: "var(--surface-container-high)",
          foreground: "var(--on-surface)",
        },
        popover: {
          DEFAULT: "var(--surface-container-lowest)",
          foreground: "var(--on-surface)",
        },
        card: {
          DEFAULT: "var(--surface-container-lowest)",
          foreground: "var(--on-surface)",
        },
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "var(--on-error)",
        },

        /* === Shadcn Sidebar === */
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans)", "var(--font-noto-sans-khmer)", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      }
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
