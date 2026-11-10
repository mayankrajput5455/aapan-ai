/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#0c0a09', // Warm Charcoal Obsidian (No blue)
          deep: '#060504',
          card: '#171412',
          cardElevated: '#211d1a'
        },
        surface: {
          1: 'rgba(28, 25, 23, 0.8)',
          2: 'rgba(41, 37, 36, 0.7)',
          3: 'rgba(68, 64, 60, 0.65)',
          4: 'rgba(87, 83, 78, 0.7)'
        },
        amber: {
          DEFAULT: '#f59e0b',
          glow: '#fbbf24',
          sunset: '#f43f5e',
          light: '#fef3c7'
        },
        emerald: {
          DEFAULT: '#10b981',
          glow: '#34d399',
          mint: '#6ee7b7'
        },
        stone: {
          850: '#1c1917',
          900: '#171412',
          950: '#0c0a09'
        }
      },
      backgroundImage: {
        'warm-radial': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(245, 158, 11, 0.15), transparent 70%), radial-gradient(circle at 100% 40%, rgba(244, 63, 94, 0.08), transparent 50%), radial-gradient(circle at 0% 80%, rgba(16, 185, 129, 0.08), transparent 50%)',
        'voice-gradient': 'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(28, 25, 23, 0.85) 0%, rgba(18, 16, 14, 0.95) 100%)'
      },
      fontFamily: {
        headline: ['"Plus Jakarta Sans"', 'Yantramanav', 'sans-serif'],
        body: ['"Atkinson Hyperlegible Next"', 'Yantramanav', 'sans-serif']
      },
      boxShadow: {
        'glow-amber': '0 0 35px -5px rgba(245, 158, 11, 0.45)',
        'glow-emerald': '0 0 35px -5px rgba(16, 185, 129, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)'
      }
    },
  },
  plugins: [],
}
