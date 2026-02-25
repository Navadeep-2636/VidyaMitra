/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1E3A8A',
                    50: '#EFF3FB',
                    100: '#D9E5F5',
                    200: '#B3CAEA',
                    300: '#8DB0E0',
                    400: '#6695D5',
                    500: '#1E3A8A',
                    600: '#1B3480',
                    700: '#152A67',
                    800: '#10204E',
                    900: '#0B1534',
                },
                secondary: '#374151',
                accent: '#F59E0B',
                surface: '#F8FAFC',
                dark: '#111827',
            },
            fontFamily: {
                sans: ['Inter', 'Poppins', 'sans-serif'],
                heading: ['Poppins', 'Inter', 'sans-serif'],
                dyslexic: ['OpenDyslexic', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
            },
            keyframes: {
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
            },
        },
    },
    plugins: [],
}
