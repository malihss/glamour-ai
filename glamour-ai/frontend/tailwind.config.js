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
        // ── Affine luxury palette ──────────────────────────────
        ivory: {
          DEFAULT: '#FAF8F6',   // warm ivory — page background
          soft:    '#F1EDE9',   // soft beige — secondary background
          warm:    '#E8E2DD',   // warm taupe — borders/dividers
        },
        taupe: {
          DEFAULT: '#3E3A39',   // deep taupe — headings / primary text
          mid:     '#7A736F',   // medium taupe — body text
          soft:    '#A89E99',   // soft taupe — captions, labels
          pale:    '#D4CCC8',   // pale taupe — disabled / placeholder
        },
        rose: {
          DEFAULT: '#C6A9A3',   // muted rose — primary accent
          hover:   '#B09892',   // muted rose darker — hover state
          pale:    '#EDE5E3',   // rose pale — light fill
          light:   '#F7F0EE',   // rose light — subtle background tint
          deep:    '#9A7E79',   // deep rose — emphasis
        },
        sage: {
          DEFAULT: '#A8B5A2',   // sage green — optional accent
          pale:    '#EDF0EC',   // sage pale — light fill
          mid:     '#8A9985',   // sage mid — hover
        },
        // ── Preserved for admin panel / legacy ────────────────
        noir: {
          DEFAULT: '#1A1A1A',
          50:      '#1A1A1A',
          100:     '#141414',
        },
        champagne: {
          DEFAULT: '#C9A96E',
          light:   '#E8D5A3',
          dark:    '#A07840',
        },
        blush: {
          DEFAULT: '#E8B4B8',
          deep:    '#C97B7B',
          rose:    '#D4808E',
        },
        charcoal: {
          DEFAULT: '#3E3A39',
          light:   '#7A736F',
          soft:    '#A89E99',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body:    ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:    ['var(--font-jost)', 'Helvetica', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-ivory':    'linear-gradient(135deg, #FAF8F6 0%, #F1EDE9 50%, #FAF8F6 100%)',
        'gradient-rose':     'linear-gradient(135deg, #F7F0EE 0%, #EDE5E3 50%, #F7F0EE 100%)',
        'gradient-champagne':'linear-gradient(135deg, #C9A96E 0%, #E8D5A3 50%, #C9A96E 100%)',
      },
      boxShadow: {
        'soft':     '0 2px 16px rgba(62,58,57,0.06)',
        'card':     '0 4px 24px rgba(62,58,57,0.07)',
        'card-hover':'0 8px 40px rgba(62,58,57,0.11)',
        'rose':     '0 4px 24px rgba(198,169,163,0.18)',
        'rose-lg':  '0 12px 48px rgba(198,169,163,0.22)',
        'luxury':   '0 4px 24px rgba(201, 169, 110, 0.15)',
        'luxury-lg':'0 8px 48px rgba(201, 169, 110, 0.20)',
      },
      animation: {
        'fade-in':      'fadeIn 0.6s ease-out forwards',
        'slide-up':     'slideUp 0.5s ease-out forwards',
        'slide-in-right':'slideInRight 0.4s ease-out forwards',
        'shimmer':      'shimmer 2s infinite',
        'pulse-soft':   'pulseSoft 2s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:      { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseSoft:    { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        float:        { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      transitionDuration: { '400': '400ms' },
    },
  },
  plugins: [],
}
