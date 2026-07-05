import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e1f5ee',
          100: '#9fe1cb',
          500: '#1d9e75',
          700: '#0f6e56',
        },
      },
    },
  },
  plugins: [],
}
export default config
