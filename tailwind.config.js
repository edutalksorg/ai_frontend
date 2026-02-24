/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '320px',
      'sm': '480px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      height: {
        'dvh': '100dvh',
        'screen-dvh': '100dvh',
      },
      minHeight: {
        'dvh': '100dvh',
        'screen-dvh': '100dvh',
      },
      maxHeight: {
        'dvh': '100dvh',
        'screen-dvh': '100dvh',
      },
      colors: {
        primary: {
          50: '#fff0f0',
          100: '#ffdede',
          200: '#ffc2c2',
          300: '#ff9696',
          400: '#ff5c5c',
          500: '#ff2e2e',
          600: '#E10600', // Base Primary
          700: '#b80000',
          800: '#960404',
          900: '#7d0a0a',
          DEFAULT: '#E10600',
        },
        secondary: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#1A1A1A', // Base Secondary
          900: '#171717',
          DEFAULT: '#1A1A1A',
        },
        accent: {
          DEFAULT: '#0E1A2B',
          50: '#f0f4f8',
          100: '#dbe4ef',
          200: '#bccce3',
          300: '#92acd3',
          400: '#668abf',
          500: '#466ca8',
          600: '#34558b',
          700: '#2b446f',
          800: '#263a5b',
          900: '#0E1A2B', // Base Accent
        },
        background: '#FAFAFA',
        surface: '#FFFFFF',
        muted: '#6B7280',
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '40px'],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
