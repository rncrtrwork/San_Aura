import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F7F3EA',
        'cream-alt': '#F1ECDF',
        forest: { 800: '#24331F', 900: '#1C2B1E' },
        ink: { 700: '#3A3A34' },
        gold: { 600: '#B8862E', 700: '#9C701F' },
        line: '#DCD5C4',
        admin: {
          sidebar: '#06442D',
          'sidebar-active': '#16583D',
          accent: '#C87500',
          'accent-hover': '#A96000',
          canvas: '#FBFAF6',
          surface: '#FFFEFA',
          border: '#DEDBD2',
          muted: '#687068',
          success: '#587D3D',
          danger: '#B22B2B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Arial', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      boxShadow: {
        booking: '0 12px 35px rgba(28, 43, 30, 0.16)',
        card: '0 8px 30px rgba(28, 43, 30, 0.08)',
        admin: '0 1px 2px rgba(28, 43, 30, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
