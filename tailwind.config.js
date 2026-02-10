export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      animation: {
        'in': 'fadeIn 0.7s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#334155',
            a: {
              color: '#2563eb',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
            'h2': {
              color: '#0f172a',
              fontWeight: '700',
              borderBottomWidth: '1px',
              borderBottomColor: '#e2e8f0',
              paddingBottom: '0.5rem',
            },
            'h3': {
              color: '#0f172a',
              fontWeight: '700',
            },
            'code': {
              color: '#db2777',
              backgroundColor: '#fdf2f8',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            'pre': {
              backgroundColor: '#0f172a',
              color: '#e2e8f0',
            },
            'blockquote': {
              borderLeftColor: '#3b82f6',
              borderLeftWidth: '4px',
              fontStyle: 'italic',
              color: '#475569',
            },
            'table': {
              width: '100%',
            },
            'th': {
              backgroundColor: '#f1f5f9',
              padding: '0.75rem',
              textAlign: 'left',
              fontWeight: '700',
              borderWidth: '1px',
              borderColor: '#cbd5e1',
            },
            'td': {
              padding: '0.75rem',
              borderWidth: '1px',
              borderColor: '#cbd5e1',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
