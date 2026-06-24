/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FAFAF9',
          100: '#F5F0EB',
          200: '#E8E0D5',
          300: '#D6CCC2',
          400: '#B8A99A',
          500: '#9C8B7A',
          600: '#84715E',
          700: '#6B5D4F',
          800: '#564A40',
          900: '#3D352E',
        },
        rose: {
          soft: '#E8C5C5',
          light: '#F2DCDC',
          medium: '#D4A0A0',
        },
        blue: {
          soft: '#C5D3E8',
          light: '#DCE4F2',
          medium: '#A0B4D4',
        },
        sage: {
          soft: '#C5E8D3',
          light: '#DCF2E4',
          medium: '#A0D4B4',
        },
        oat: {
          soft: '#E8DDC5',
          light: '#F2EBDC',
          medium: '#D4C5A0',
        },
        lavender: {
          soft: '#D3C5E8',
          light: '#E4DCF2',
          medium: '#B4A0D4',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', '"Fira Code"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 4px 24px rgba(60, 53, 46, 0.08)',
        'card': '0 2px 8px rgba(60, 53, 46, 0.06), 0 6px 20px rgba(60, 53, 46, 0.08)',
        'card-hover': '0 4px 12px rgba(60, 53, 46, 0.1), 0 12px 32px rgba(60, 53, 46, 0.12)',
      },
      animation: {
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
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
}
