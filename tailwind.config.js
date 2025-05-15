import typography from '@styles/tailwind/typography';
import colors from '@styles/tailwind/colors';
import spacing from '@styles/tailwind/spacing';
import { fontFamily } from 'tailwindcss/defaultTheme';
import typographyPlugin from '@tailwindcss/typography';
import formsPlugin from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: colors,
      spacing: spacing,
      typography: typography,
      fontFamily: {
        sans: ['Inter var', ...fontFamily.sans],
        display: ['Montserrat', ...fontFamily.sans],
      },
      screens: {
        xs: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [typographyPlugin, formsPlugin],
};
