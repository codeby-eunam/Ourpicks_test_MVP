import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF6B4A',
          dark: '#E85A3A',
          light: '#FFE4DC',
        },
        surface: '#FAFAFA',
        ink: {
          DEFAULT: '#1E293B',
          muted: '#64748B',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 10px 0 rgba(30, 41, 59, 0.06)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-up': 'slide-up 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
