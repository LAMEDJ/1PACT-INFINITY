/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Palette ARCTIC / FRZN – alignée sur index.css */
        deep: {
          green: '#223445',
          'green-light': '#3b5268',
        },
        petrol: '#8fb7ff',
        mist: {
          DEFAULT: '#dde6f2',
          light: '#e7edf8',
          dark: '#bcc9da',
        },
        accent: {
          turquoise: '#a6c9ff',
          green: '#f2f5ff',
        },
        /* Texte panels / widgets utilisateur (beige / sable, teinte plus chaude) */
        panel: {
          primary: '#DBC6B8',
          secondary: '#E9DDD2',
        },
      },
      borderRadius: {
        card: '20px',
        'card-lg': '28px',
      },
      backdropBlur: {
        card: '12px',
        nav: '16px',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(15, 61, 62, 0.08)',
        'soft-lg': '0 8px 32px rgba(15, 61, 62, 0.12)',
        glow: '0 0 40px rgba(45, 212, 191, 0.15)',
      },
      transitionDuration: {
        smooth: '200ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
