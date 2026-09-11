/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F5EFE6',
          300: '#EBE2D5',
          border: '#EFE8DE',
          DEFAULT: '#FAF6F0',
        },
        terracotta: {
          50: '#FDF3EE',
          100: '#FAE5DB',
          200: '#F5CBBA',
          300: '#EB9E7E',
          400: '#E07A4B',
          500: '#D4622C',
          600: '#BE5323',
          700: '#9C4119',
          DEFAULT: '#D4622C',
        },
        navy: {
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          DEFAULT: '#1E293B',
        },
        slate: {
          subtext: '#64748B',
          muted: '#94A3B8',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px -2px rgba(30, 41, 59, 0.04), 0 1px 4px -1px rgba(30, 41, 59, 0.02)',
        'card': '0 8px 30px -4px rgba(30, 41, 59, 0.06), 0 2px 8px -1px rgba(30, 41, 59, 0.03)',
        'card-hover': '0 16px 36px -6px rgba(30, 41, 59, 0.09), 0 4px 12px -2px rgba(30, 41, 59, 0.04)',
        'floating': '0 14px 34px -4px rgba(30, 41, 59, 0.08), 0 4px 12px -1px rgba(30, 41, 59, 0.03)',
      },
      borderRadius: {
        'xl': '0.75rem',   // 12px
        '2xl': '1rem',      // 16px
        '3xl': '1.5rem',    // 24px
      },
    },
  },
  plugins: [],
}
