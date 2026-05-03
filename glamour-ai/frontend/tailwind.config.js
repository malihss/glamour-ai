/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Glamour AI luxury palette
        noir: {
          DEFAULT: '#000000',
          50: '#1A1A1A',
          100: '#141414',
        },
        champagne: {
          DEFAULT: '#C9A96E',
          light: '#E8D5A3',
          dark: '#A07840',
        },
        blush: {
          DEFAULT: '#E8B4B8',
          deep: '#C97B7B',
          rose: '#D4808E',
        },
        ivory: {
          DEFAULT: '#FFFFFF',
          warm: '#F5EFE6',
          pure: '#FEFEFE',
        },
        charcoal: {
          DEFAULT: '#1f1f1f',
          light: '#404040',
          soft: '#5A5A5A',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-jost)', 'Helvetica', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-luxury': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)',
        'gradient-champagne': 'linear-gradient(135deg, #C9A96E 0%, #E8D5A3 50%, #C9A96E 100%)',
        'gradient-blush': 'linear-gradient(135deg, #E8B4B8 0%, #FAF7F2 50%, #C97B7B 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'luxury': '0 4px 24px rgba(201, 169, 110, 0.15)',
        'luxury-lg': '0 8px 48px rgba(201, 169, 110, 0.20)',
        'soft': '0 2px 20px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 32px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 48px rgba(0, 0, 0, 0.12)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
