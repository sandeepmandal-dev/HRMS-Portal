/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Ledger" palette — precise and trustworthy, built for a data-heavy daily tool.
        paper: '#F7F7F5',
        ink: {
          DEFAULT: '#14151A',
          soft: '#2A2C36',
          900: '#12131A',
          800: '#1B1C24',
          700: '#2A2C36',
        },
        indigo: {
          DEFAULT: '#4F46E5',
          50: '#EEF2FF',
          100: '#E0E4FF',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E5E7EB',
          400: '#94A3B8',
          500: '#6B7280',
          600: '#4B5563',
        },
        amber: {
          50: '#FFFBEB',
          500: '#D97706',
          600: '#B45309',
        },
        emerald: {
          50: '#ECFDF5',
          500: '#059669',
          600: '#047857',
        },
        rose: {
          50: '#FFF1F2',
          500: '#E11D48',
          600: '#BE123C',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        'display-sm': ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 19, 26, 0.04), 0 1px 1px rgba(18, 19, 26, 0.02)',
        popover: '0 12px 32px -8px rgba(18, 19, 26, 0.18), 0 4px 12px -4px rgba(18, 19, 26, 0.08)',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
