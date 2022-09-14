/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: {
            50: '#F8FAFC',
            100: '#E2F6FF',
            200: '#91B1FF',
            300: '#3755C5',
            400: '#2C44B3',
            500: '#2333A8',
            600: '#1F2E95'
          },
          purple: {
            50: '#FFD6FF',
            100: '#E7C6FF',
            200: '#C8B6FF'
          }
        },
        neutrals: {
          blueGray: {
            50: '#F0F4F8',
            100: '#D9E2EC',
            200: '#BCCCDC',
            300: '#9FB3C8',
            400: '#829AB1',
            500: '#627D98',
            600: '#486581',
            700: '#334E68',
            800: '#243B53',
            900: '#102A43'
          }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/aspect-ratio')]
};
