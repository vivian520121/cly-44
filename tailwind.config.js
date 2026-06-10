/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '900px',
      },
    },
    extend: {
      colors: {
        paper: {
          50: '#FBF8F1',
          100: '#F5F0E6',
          200: '#EAE0CC',
          300: '#DDCEB0',
          400: '#C9B48C',
          500: '#B09768',
        },
        ink: {
          50: '#F5F5F5',
          100: '#8A8A8A',
          200: '#5C5C5C',
          300: '#3D3D3D',
          400: '#2C2C2C',
          500: '#1A1A1A',
        },
        vermilion: {
          50: '#FCECE8',
          100: '#F7CFC5',
          200: '#EBA594',
          300: '#DB7A62',
          400: '#C84B31',
          500: '#A83D28',
          600: '#873120',
        },
        bamboo: {
          50: '#EEF3E1',
          100: '#D6E2B8',
          200: '#B8CF89',
          300: '#95BA5A',
          400: '#6B8E23',
          500: '#58741D',
        },
      },
      fontFamily: {
        song: ['"Noto Serif SC"', '"Source Han Serif SC"', '"SimSun"', 'serif'],
        kai: ['"LXGW WenKai"', '"Kaiti SC"', '"KaiTi"', '"STKaiti"', 'serif'],
      },
      boxShadow: {
        'paper': '0 1px 3px rgba(44,44,44,0.06), 0 4px 12px rgba(44,44,44,0.04)',
        'paper-lg': '0 4px 8px rgba(44,44,44,0.08), 0 12px 32px rgba(44,44,44,0.06)',
        'vermilion': '0 2px 8px rgba(200,75,49,0.25)',
      },
      backgroundImage: {
        'paper-texture': "radial-gradient(circle at 20% 30%, rgba(176,151,104,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(176,151,104,0.06) 0%, transparent 50%)",
        'ink-wash': "linear-gradient(135deg, rgba(44,44,44,0.04) 0%, transparent 50%, rgba(44,44,44,0.02) 100%)",
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200,75,49,0.35)' },
          '50%': { boxShadow: '0 0 0 8px rgba(200,75,49,0)' },
        },
        'ink-spread': {
          '0%': { opacity: '0', transform: 'scale(0.8)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'ink-spread': 'ink-spread 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
