/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1d2e',
          card: '#212435',
          hover: '#2a2d42',
        },
        border: {
          DEFAULT: '#2e3248',
        },
        primary: {
          DEFAULT: '#6366f1',
          hover: '#5558e3',
        },
        danger: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
    },
  },
  plugins: [],
}
