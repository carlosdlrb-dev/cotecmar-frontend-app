/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9ff',
          100: '#dff2fb',
          200: '#b8e6f6',
          300: '#7dd3f0',
          400: '#38bcd8',
          500: '#2aa8c2',
          600: '#1c6b81',
          700: '#165d72',
          800: '#124a5b',
          900: '#0d3340',
          950: '#071f2a',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 10px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)',
        'modal':      '0 24px 80px rgba(0,0,0,0.24)',
        'glow':       '0 4px 20px rgba(28,107,129,0.40)',
        'glow-sm':    '0 2px 12px rgba(28,107,129,0.30)',
        'glow-lg':    '0 8px 40px rgba(28,107,129,0.50)',
        'neon':       '0 0 20px rgba(56,188,216,0.5), 0 0 40px rgba(56,188,216,0.3)',
        '3d':         '0 20px 60px -15px rgba(0,0,0,0.3), 0 40px 80px -20px rgba(0,0,0,0.15)',
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'mesh': 'linear-gradient(135deg, rgba(56,188,216,0.15) 0%, transparent 50%), linear-gradient(225deg, rgba(42,168,194,0.15) 0%, transparent 50%)',
      },
      backgroundSize: {
        'dot': '28px 28px',
        '400%': '400% 400%',
      },
      animation: {
        'fade-up':     'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':     'fadeIn 0.4s ease both',
        'scale-in':    'scaleIn 0.35s cubic-bezier(0.34, 1.4, 0.64, 1) both',
        'scale-in-subtle': 'scaleInSubtle 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer':     'shimmer 2s infinite linear',
        'shimmer-fast':'shimmer 1s infinite linear',
        'float':       'float 6s ease-in-out infinite',
        'float-delayed':'float 6s ease-in-out 2s infinite',
        'float-slow':  'float 8s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'gradient-x':  'gradientX 8s ease infinite',
        'gradient-y':  'gradientY 8s ease infinite',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-left':  'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'bounce-in':   'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) both',
        'spin-slow':   'spin 3s linear infinite',
        'wiggle':      'wiggle 0.5s ease-in-out both',
        'ripple':      'ripple 0.6s ease-out both',
        'count-up':    'countUp 0.8s ease-out both',
        'morph':       'morph 8s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9) translateY(12px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        scaleInSubtle: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-20px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(56,188,216,0.4)' },
          '50%':      { boxShadow: '0 0 40px rgba(56,188,216,0.8), 0 0 60px rgba(56,188,216,0.4)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        gradientY: {
          '0%, 100%': { backgroundPosition: '50% 0%' },
          '50%':      { backgroundPosition: '50% 100%' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-40px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%':   { opacity: '0', transform: 'scale(0.3)' },
          '50%':  { opacity: '1', transform: 'scale(1.05)' },
          '70%':  { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%':      { transform: 'rotate(3deg)' },
        },
        ripple: {
          '0%':   { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%':      { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
      },
    },
  },
  plugins: [],
}
