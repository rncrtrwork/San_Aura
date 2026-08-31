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
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Arial', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      boxShadow: {
        booking: '0 12px 35px rgba(28, 43, 30, 0.16)',
        card: '0 8px 30px rgba(28, 43, 30, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
