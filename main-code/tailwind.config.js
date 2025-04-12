/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './client/src/**/*.{html,js,jsx}', // Include your JS/JSX files
  ],
  theme: {
    extend: {
      animation: {
        float: 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(15px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
