/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Design tokens — "Patisserie Noir" brand: deep cocoa + rich
        // mulberry/berry-compote accent + warm gilt, on a blush-ivory
        // base. Deliberately avoiding the generic cream+terracotta /
        // near-black+neon defaults — this is warm, dessert-coded, and
        // specific to a bakery rather than a generic "premium" SaaS look.
        cocoa: {
          50: '#F7F0EC',
          100: '#EADAD0',
          200: '#D2B6A6',
          300: '#B08A77',
          400: '#8A6451',
          500: '#664538',
          600: '#4A3026',
          700: '#3A1B14',
          800: '#2E1810',
          900: '#1E0F0A'
        },
        blush: {
          DEFAULT: '#FBF5EF',
          deep: '#F3E7DA'
        },
        mulberry: {
          50: '#FBEEF1',
          100: '#F3D6DF',
          200: '#E3A8BB',
          300: '#CC7A96',
          400: '#A8486A',
          500: '#8C2F4B',
          600: '#6B2138',
          700: '#4F1729',
          800: '#380F1C'
        },
        gilt: {
          100: '#F3E0AE',
          300: '#DDB85A',
          DEFAULT: '#C9952B',
          600: '#A6781D'
        },
        sage: {
          DEFAULT: '#5F7355',
          light: '#E4EADF'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 6vw, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.01em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 3.75rem)', { lineHeight: '1.02', letterSpacing: '-0.01em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.08' }]
      },
      borderRadius: {
        soft: '1.25rem',
        pill: '999px'
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(58, 27, 20, 0.08), 0 12px 28px -8px rgba(58, 27, 20, 0.10)',
        lift: '0 8px 20px -6px rgba(58, 27, 20, 0.18), 0 20px 40px -12px rgba(58, 27, 20, 0.16)',
        glow: '0 0 0 1px rgba(201, 149, 43, 0.25), 0 8px 24px -8px rgba(201, 149, 43, 0.35)'
      },
      keyframes: {
        rise: {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        candleFlicker: {
          '0%, 100%': { opacity: 1, transform: 'scaleY(1) rotate(-1deg)' },
          '50%': { opacity: 0.85, transform: 'scaleY(0.94) rotate(1deg)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        rise: 'rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        flicker: 'candleFlicker 2.2s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite'
      }
    }
  },
  plugins: []
};
