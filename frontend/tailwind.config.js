/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        cyan: {
          DEFAULT: '#00FFFF',
          dark: '#00CCCC',
          light: '#33FFFF',
        },
        gray: {
          50: '#F9F9F9', // Subtle off-white background
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#888888', // Secondary/support text
          500: '#9E9E9E',
          600: '#444444', // Regular text
          700: '#616161',
          800: '#222222', // Titles
          900: '#111111', // Primary titles
        },
      },
      spacing: {
        'header': '64px',
        'sidebar': '240px',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '6px',
        'lg': '8px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'neumorphic': '2px 2px 4px rgba(0, 0, 0, 0.08), -1px -1px 3px rgba(255, 255, 255, 0.6)',
        'neumorphic-inset': 'inset 1px 1px 2px rgba(0, 0, 0, 0.08), inset -1px -1px 2px rgba(255, 255, 255, 0.5)',
      },
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
  plugins: [],
}
