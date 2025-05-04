// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        animation: {
          'float': 'float 3s ease-in-out infinite',
          'float-slow': 'float-slow 6s ease-in-out infinite',
          'blob': 'blob 15s ease-in-out infinite',
          'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0px) rotate(12deg)' },
            '50%': { transform: 'translateY(-15px) rotate(12deg)' },
          },
          'float-slow': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-8px)' },
          },
          blob: {
            '0%, 100%': { transform: 'scale(1) translate(0px, 0px)' },
            '33%': { transform: 'scale(1.1) translate(30px, -50px)' },
            '66%': { transform: 'scale(0.9) translate(-20px, 20px)' },
          },
        },
        backgroundColor: {
          'gray-750': '#2D3748',
          'gray-850': '#1A202C',
          'gray-950': '#0B0F19',
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        },
      },
    },
    plugins: [],
  }