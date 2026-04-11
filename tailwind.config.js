/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        /* Custom font — Monument Grotesk */
        sans: ['var(--font-monument)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-monument)', 'sans-serif'],
        jakarta: ['var(--font-monument)', 'sans-serif'],
        nunito: ['var(--font-monument)', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#4361EE',
          600: '#2B4DB8',
          700: '#1E3FA8',   /* primary */
          800: '#163090',
          900: '#0F2070',
          950: '#0A1550',
        },
        cta: {
          DEFAULT: '#EA580C',  /* orange-600 — energetic CTA */
          hover:   '#C2410C',  /* orange-700 */
          light:   '#FFF7ED',  /* orange-50 */
          50:  '#FFF7ED',
          100: '#FFEDD5',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        deal: {
          DEFAULT: '#059669',  /* emerald-600 */
          bg:      '#ECFDF5',  /* emerald-50 */
          text:    '#065F46',  /* emerald-800 */
        },
        score: {
          DEFAULT: '#F59E0B',  /* amber-500 — rating star gold */
          bg:      '#FFFBEB',
          text:    '#92400E',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        none: '0px',
        sm:   '0.375rem',
        DEFAULT: '0.625rem',
        md:   '0.625rem',
        lg:   '0.875rem',
        xl:   '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        full: '9999px',
      },
      boxShadow: {
        card:     '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 12px 40px rgba(30,63,168,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        btn:      '0 2px 8px rgba(234,88,12,0.35)',
        'btn-hover': '0 4px 16px rgba(234,88,12,0.45)',
        header:   '0 1px 3px rgba(30,63,168,0.4), 0 4px 16px rgba(30,63,168,0.15)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'fade-in-up':      'fade-in-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer:           'shimmer 1.5s infinite',
        'pulse-subtle':    'pulse-subtle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
