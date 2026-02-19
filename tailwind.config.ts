import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['"Clash Display"', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#eef1ff',
          100: '#dde4ff',
          200: '#c4ccff',
          300: '#a0aaff',
          400: '#7c80ff',
          500: '#5c54f5',
          600: '#4a3de8',
          700: '#3e2fd4',
          800: '#3228ab',
          900: '#2c2787',
        },
        neutral: {
          0:   '#ffffff',
          50:  '#f7f8fa',
          100: '#eef0f4',
          200: '#e1e5ed',
          300: '#c8cfdb',
          400: '#9aa3b5',
          500: '#6c788a',
          600: '#4e5a6e',
          700: '#374050',
          800: '#1f2a37',
          900: '#111820',
        },
        status: {
          draft:      '#9aa3b5',
          analyzed:   '#f59e0b',
          polling:    '#3b82f6',
          summarized: '#8b5cf6',
          finalized:  '#10b981',
        },
        vote: {
          yes:        '#10b981',
          no:         '#ef4444',
          maybe:      '#f59e0b',
          none:       '#9aa3b5',
        },
        provenance: {
          chat:       '#3b82f6',
          habit:      '#8b5cf6',
          manual:     '#6c788a',
        },
        confidence: {
          high:   '#10b981',
          medium: '#f59e0b',
          low:    '#ef4444',
        },
      },
      spacing: {
        'tap': '44px',
        'nav': '56px',
        'tabbar': '48px',
        'statusbar': '36px',
      },
      borderRadius: {
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
        'modal': '0 24px 64px -10px rgb(0 0 0 / 0.28)',
        'combo': '0 4px 20px 0 rgb(92 84 245 / 0.20)',
        'combo-hover': '0 8px 32px 0 rgb(92 84 245 / 0.30)',
        'inner-glow': 'inset 0 1px 0 0 rgb(255 255 255 / 0.08)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },
      transitionTimingFunction: {
        'ui': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      backgroundImage: {
        'grid-subtle': 'linear-gradient(rgb(228 232 240 / 0.6) 1px, transparent 1px), linear-gradient(90deg, rgb(228 232 240 / 0.6) 1px, transparent 1px)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        'gradient-hero': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgb(92 84 245 / 0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgb(139 92 246 / 0.08) 0%, transparent 50%)',
        'gradient-card': 'linear-gradient(135deg, rgb(255 255 255) 0%, rgb(247 248 250) 100%)',
      },
      animation: {
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 200ms cubic-bezier(0.2, 0, 0, 1)',
        'fade-in': 'fadeIn 200ms cubic-bezier(0.2, 0, 0, 1)',
        'scale-in': 'scaleIn 150ms cubic-bezier(0.2, 0, 0, 1)',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
