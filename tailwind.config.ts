import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS variable-based color system
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          blue: {
            '1': 'hsl(var(--chart-blue-1))',
            '2': 'hsl(var(--chart-blue-2))',
            '3': 'hsl(var(--chart-blue-3))',
            '4': 'hsl(var(--chart-blue-4))',
            '5': 'hsl(var(--chart-blue-5))',
          },
          green: {
            '1': 'hsl(var(--chart-green-1))',
            '2': 'hsl(var(--chart-green-2))',
            '3': 'hsl(var(--chart-green-3))',
            '4': 'hsl(var(--chart-green-4))',
            '5': 'hsl(var(--chart-green-5))',
          },
          primary: {
            '1': 'hsl(var(--chart-primary-1))',
            '2': 'hsl(var(--chart-primary-2))',
            '3': 'hsl(var(--chart-primary-3))',
            '4': 'hsl(var(--chart-primary-4))',
            '5': 'hsl(var(--chart-primary-5))',
          },
          orange: {
            '1': 'hsl(var(--chart-orange-1))',
            '2': 'hsl(var(--chart-orange-2))',
            '3': 'hsl(var(--chart-orange-3))',
            '4': 'hsl(var(--chart-orange-4))',
            '5': 'hsl(var(--chart-orange-5))',
          },
          red: {
            '1': 'hsl(var(--chart-red-1))',
            '2': 'hsl(var(--chart-red-2))',
            '3': 'hsl(var(--chart-red-3))',
            '4': 'hsl(var(--chart-red-4))',
            '5': 'hsl(var(--chart-red-5))',
          },
          rose: {
            '1': 'hsl(var(--chart-rose-1))',
            '2': 'hsl(var(--chart-rose-2))',
            '3': 'hsl(var(--chart-rose-3))',
            '4': 'hsl(var(--chart-rose-4))',
            '5': 'hsl(var(--chart-rose-5))',
          },
          violet: {
            '1': 'hsl(var(--chart-violet-1))',
            '2': 'hsl(var(--chart-violet-2))',
            '3': 'hsl(var(--chart-violet-3))',
            '4': 'hsl(var(--chart-violet-4))',
            '5': 'hsl(var(--chart-violet-5))',
          },
          yellow: {
            '1': 'hsl(var(--chart-yellow-1))',
            '2': 'hsl(var(--chart-yellow-2))',
            '3': 'hsl(var(--chart-yellow-3))',
            '4': 'hsl(var(--chart-yellow-4))',
            '5': 'hsl(var(--chart-yellow-5))',
          },
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        primary: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      // Responsive spacing scale
      spacing: {
        'responsive-xs': 'var(--spacing-xs)',
        'responsive-sm': 'var(--spacing-sm)',
        'responsive-md': 'var(--spacing-md)',
        'responsive-lg': 'var(--spacing-lg)',
        'responsive-xl': 'var(--spacing-xl)',
      },
      // Responsive font sizes with line heights
      fontSize: {
        'responsive-xs': ['var(--text-xs)', { lineHeight: '1.5' }],
        'responsive-sm': ['var(--text-sm)', { lineHeight: '1.5' }],
        'responsive-base': ['var(--text-base)', { lineHeight: '1.5' }],
        'responsive-lg': ['var(--text-lg)', { lineHeight: '1.5' }],
        'responsive-xl': ['var(--text-xl)', { lineHeight: '1.25' }],
        'responsive-2xl': ['var(--text-2xl)', { lineHeight: '1.25' }],
        'responsive-3xl': ['var(--text-3xl)', { lineHeight: '1.25' }],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
