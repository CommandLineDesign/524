import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#111827',
        accent: '#f59e0b'
      }
    }
  },
  plugins: []
};

export default config;

