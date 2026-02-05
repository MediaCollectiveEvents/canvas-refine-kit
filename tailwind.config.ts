
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        satisfy: ['Satisfy', 'cursive'],
        display: ['Montserrat', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
        script: ['Playlist Script', 'cursive'],
      },
      colors: {
        primary: 'hsl(168, 85%, 65%)', // Turquoise accent
        'primary-foreground': 'hsl(0, 0%, 8%)',
        secondary: 'hsl(200, 10%, 18%)',
        'secondary-foreground': 'hsl(0, 0%, 98%)',
        accent: 'hsl(168, 85%, 65%)',
        'accent-foreground': 'hsl(0, 0%, 8%)',
        muted: 'hsl(200, 8%, 22%)',
        'muted-foreground': 'hsl(200, 5%, 65%)',
        border: 'hsl(200, 10%, 24%)',
        background: 'hsl(200, 15%, 12%)',
        foreground: 'hsl(0, 0%, 98%)',
        icon: {
          lime: 'hsl(68, 82%, 50%)',
          cyan: 'hsl(191, 100%, 60%)',
          red: 'hsl(21, 100%, 65%)',
        },
      },
      boxShadow: {
        turquoise: '0 0 40px -10px hsl(168, 85%, 65%, 0.4)',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        scroll: 'scroll 7.5s linear infinite',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
``
