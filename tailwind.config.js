/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wonders-gold': '#C1A98F',
        'wonders-dark': '#1A1A1A',
        'wonders-muted': '#525252',
        'wonders-bg': '#FFFFFF',
        'wonders-border': '#E5E5E5',
        // Mobile-matched Lunar theme tokens
        'lunar-dark-bg': '#121212',
        'lunar-dark-surface': '#1E1E1E',
        'lunar-dark-elevated': '#282828',
        'lunar-dark-border': '#2E2E2E',
        'lunar-dark-text': '#F5F5F5',
        'lunar-dark-muted': '#AAAAAA',
        'lunar-gold': '#C1A98F',
        'lunar-gold-dark': '#A38363',
        'lunar-gold-light': '#E8DCCF',
        'lunar-accent': '#D4AF37',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
