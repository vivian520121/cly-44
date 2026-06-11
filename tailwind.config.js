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
        'paper-noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.69 0 0 0 0 0.59 0 0 0 0 0.42 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        'vermilion-gradient': "linear-gradient(90deg, #873120 0%, #C84B31 50%, #A83D28 100%)",
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
          '0%': { opacity: '0', transform: 'scale(0.75)', filter: 'blur(8px)', letterSpacing: '0.3em' },
          '50%': { opacity: '0.7', filter: 'blur(2px)', letterSpacing: '0.15em' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0)', letterSpacing: '0.05em' },
        },
        'ink-spread-deluxe': {
          '0%': { opacity: '0', transform: 'scale(0.6) rotate(-2deg)', filter: 'blur(12px)' },
          '30%': { opacity: '0.4', transform: 'scale(0.9) rotate(1deg)', filter: 'blur(4px)' },
          '60%': { opacity: '0.85', transform: 'scale(1.02) rotate(0deg)', filter: 'blur(1px)' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
        },
        'stamp-press': {
          '0%': { opacity: '0', transform: 'scale(1.3) rotate(-8deg)' },
          '50%': { opacity: '0.9', transform: 'scale(0.95) rotate(2deg)' },
          '70%': { transform: 'scale(1.02) rotate(-1deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        'stamp-border-pulse': {
          '0%, 100%': { boxShadow: 'inset 0 0 0 2px rgba(200,75,49,0.8), 0 0 0 0 rgba(200,75,49,0.25)' },
          '50%': { boxShadow: 'inset 0 0 0 2px rgba(200,75,49,1), 0 0 0 6px rgba(200,75,49,0)' },
        },
        'stamp-inner-dash': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.9' },
        },
        'urgent-blink': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '25%': { opacity: '0.5', filter: 'brightness(1.3)' },
          '75%': { opacity: '1', filter: 'brightness(0.9)' },
        },
        'urgent-pulse-scale': {
          '0%, 100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
          '50%': { transform: 'scaleX(1.02)', transformOrigin: 'left' },
        },
        'fire-particle': {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0.3)' },
          '30%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(-40px) scale(1.2)' },
        },
        'fire-wisp': {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0.2) rotate(0deg)' },
          '30%': { opacity: '0.9', transform: 'translateY(-10px) scale(0.8) rotate(5deg)' },
          '70%': { opacity: '0.6', transform: 'translateY(-25px) scale(1) rotate(-5deg)' },
          '100%': { opacity: '0', transform: 'translateY(-50px) scale(0.5) rotate(0deg)' },
        },
        'combo-flash': {
          '0%, 100%': { textShadow: '0 0 4px rgba(200,75,49,0.4)' },
          '50%': { textShadow: '0 0 20px rgba(200,75,49,0.9), 0 0 40px rgba(200,75,49,0.4)' },
        },
        'wrong-ink-drop': {
          '0%': { opacity: '0', transform: 'scale(0.5)', filter: 'blur(10px)' },
          '40%': { opacity: '0.8', transform: 'scale(1.1)', filter: 'blur(2px)' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
        },
        'wrong-shake-heavy': {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '15%': { transform: 'translateX(-8px) rotate(-1deg)' },
          '30%': { transform: 'translateX(8px) rotate(1deg)' },
          '45%': { transform: 'translateX(-6px) rotate(-0.5deg)' },
          '60%': { transform: 'translateX(6px) rotate(0.5deg)' },
          '75%': { transform: 'translateX(-3px)' },
          '90%': { transform: 'translateX(3px)' },
        },
        'scroll-unfold': {
          '0%': { opacity: '0', transform: 'scaleX(0.3)', filter: 'blur(4px)' },
          '60%': { opacity: '1', transform: 'scaleX(1.02)', filter: 'blur(0)' },
          '100%': { opacity: '1', transform: 'scaleX(1)' },
        },
        'scroll-rod-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        'number-roll': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'number-flip': {
          '0%': { transform: 'rotateX(-90deg)', opacity: '0' },
          '50%': { opacity: '0.5' },
          '100%': { transform: 'rotateX(0deg)', opacity: '1' },
        },
        'ink-wash-reveal': {
          '0%': { clipPath: 'circle(0% at 50% 50%)', opacity: '0' },
          '40%': { opacity: '1' },
          '100%': { clipPath: 'circle(150% at 50% 50%)', opacity: '1' },
        },
        'ink-wash-cover': {
          '0%': { clipPath: 'circle(0% at 50% 50%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { clipPath: 'circle(150% at 50% 50%)', opacity: '0' },
        },
        'ink-brush-sweep': {
          '0%': { transform: 'translateX(-100%) skewX(-20deg)', opacity: '0.8' },
          '100%': { transform: 'translateX(100%) skewX(-20deg)', opacity: '0' },
        },
        'paper-fiber': {
          '0%, 100%': { opacity: '0.04' },
          '50%': { opacity: '0.08' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'ink-spread': 'ink-spread 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'ink-spread-deluxe': 'ink-spread-deluxe 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'stamp-press': 'stamp-press 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'stamp-border-pulse': 'stamp-border-pulse 2.2s ease-in-out infinite',
        'stamp-inner-dash': 'stamp-inner-dash 2.2s ease-in-out infinite',
        'urgent-blink': 'urgent-blink 0.6s ease-in-out infinite',
        'urgent-pulse-scale': 'urgent-pulse-scale 0.6s ease-in-out infinite',
        'fire-particle': 'fire-particle 0.9s ease-out forwards',
        'fire-wisp': 'fire-wisp 1.2s ease-out forwards',
        'combo-flash': 'combo-flash 0.8s ease-in-out infinite',
        'wrong-ink-drop': 'wrong-ink-drop 0.5s ease-out forwards',
        'wrong-shake-heavy': 'wrong-shake-heavy 0.7s ease-in-out',
        'scroll-unfold': 'scroll-unfold 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scroll-rod-in': 'scroll-rod-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'number-roll': 'number-roll 0.5s ease-out forwards',
        'number-flip': 'number-flip 0.4s ease-out forwards',
        'ink-wash-reveal': 'ink-wash-reveal 0.8s ease-out forwards',
        'ink-wash-cover': 'ink-wash-cover 0.8s ease-in-out forwards',
        'ink-brush-sweep': 'ink-brush-sweep 0.7s ease-in-out forwards',
        'paper-fiber': 'paper-fiber 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
