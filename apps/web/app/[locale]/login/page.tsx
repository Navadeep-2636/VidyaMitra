'use client'

import { useTranslations } from 'next-intl'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { BookOpen, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const t = useTranslations('auth')
    const { signInWithGoogle } = useSupabaseUser()

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-surface to-accent/10 flex items-center justify-center px-4">
            <div className="card-surface max-w-md w-full p-8 text-center animate-fade-in">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <span className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <BookOpen size={32} />
                    </span>
                </div>

                <h1 className="section-title text-2xl mb-2">{t('loginTitle')}</h1>
                <p className="text-secondary text-sm mb-8">{t('loginSubtitle')}</p>

                {/* Google Login Button */}
                <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border-2 border-gray-200 
                     bg-white hover:border-primary hover:shadow-md transition-all duration-200 font-semibold text-dark text-sm"
                >
                    {/* Google SVG */}
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                        <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.8 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" fill="#FFC107" />
                        <path d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" fill="#FF3D00" />
                        <path d="M24 44c5.2 0 9.8-1.8 13.4-4.7l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.2 0-9.6-3.1-11.4-7.6l-6.5 5C9.5 40.1 16.2 44 24 44z" fill="#4CAF50" />
                        <path d="M43.6 20.5H42V20H24v8h11.3c-.9 2.4-2.5 4.5-4.5 5.9l6.2 5.2C36.9 38 44 32.5 44 24c0-1.2-.1-2.4-.4-3.5z" fill="#1976D2" />
                    </svg>
                    {t('loginWithGoogle')}
                </button>

                {/* Trust Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <ShieldCheck size={14} />
                    <span>Your data is securely saved with Google OAuth</span>
                </div>
            </div>
        </div>
    )
}
