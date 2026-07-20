/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAFA',
        surface: '#F4F4F5',
        border: '#E4E4E7',
        text: '#09090B',
        'text-secondary': '#71717A',
        'text-tertiary': '#A1A1AA',
        teal: {
          DEFAULT: '#00B894',
          light: '#CCFBF1',
          lighter: '#E8FDF8',
        },
        yellow: {
          DEFAULT: '#D4A017',
          light: '#FEF3C7',
        },
        rose: {
          DEFAULT: '#F472B6',
          light: '#FCE7F3',
        },
      },
      fontFamily: {
        'space-grotesk': ['SpaceGrotesk-Regular'],
        'space-grotesk-medium': ['SpaceGrotesk-Medium'],
        'space-grotesk-semibold': ['SpaceGrotesk-SemiBold'],
        'space-grotesk-bold': ['SpaceGrotesk-Bold'],
        'inter': ['Inter-Regular'],
        'inter-medium': ['Inter-Medium'],
        'inter-semibold': ['Inter-SemiBold'],
      },
      borderRadius: {
        card: '14px',
        button: '13px',
      },
    },
  },
  plugins: [],
};
