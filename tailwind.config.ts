import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f8ff',
          100: '#d9e7ff',
          500: '#2f5cff',
          700: '#1c3bbb'
        }
      }
    }
  },
  plugins: []
};

export default config;
