/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dark-blue': {
          50: '#e7e9ef',
          100: '#c4c9d9',
          200: '#9da3bf',
          300: '#767da5',
          400: '#586091',
          500: '#3a437d',
          600: '#333c75',
          700: '#2b336a',
          800: '#232a5e',
          900: '#1a2052',
        },
        petrol: {
          50: '#e6f4f5',
          100: '#c0e3e6',
          200: '#96d0d5',
          300: '#6cbdc4',
          400: '#4daeb6',
          500: '#2e9fa8',
          600: '#29919a',
          700: '#238089',
          800: '#1d7078',
          900: '#145c63',
        },
        anthracite: {
          50: '#f4f4f4',
          100: '#e0e0e0',
          200: '#c0c0c0',
          300: '#a0a0a0',
          400: '#7d7d7d',
          500: '#5b5b5b',
          600: '#515151',
          700: '#454545',
          800: '#3a3a3a',
          900: '#2d2d2d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
