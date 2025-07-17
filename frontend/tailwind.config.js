/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0c6b36',
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bce4cb',
          300: '#8ccfa7',
          400: '#56b47d',
          500: '#0c6b36',
          600: '#0a5a2e',
          700: '#084926',
          800: '#063a1f',
          900: '#052f1a',
        },
        secondary: {
          DEFAULT: '#43a4d6',
          50: '#f0f9ff',
          100: '#e0f3fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#43a4d6',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        subprimary: {
          DEFAULT: '#6b927c',
          50: '#f6f8f7',
          100: '#e9f0eb',
          200: '#d4e2d8',
          300: '#b5ccbc',
          400: '#92b09b',
          500: '#6b927c',
          600: '#547562',
          700: '#455e50',
          800: '#394d42',
          900: '#314039',
        },
        subsecondary: {
          DEFAULT: '#84bec0',
          50: '#f3fafa',
          100: '#e6f4f4',
          200: '#c9e8ea',
          300: '#9ed4d6',
          400: '#84bec0',
          500: '#5aa5a8',
          600: '#4a8b8e',
          700: '#3f7073',
          800: '#365c5e',
          900: '#2f4d4f',
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
