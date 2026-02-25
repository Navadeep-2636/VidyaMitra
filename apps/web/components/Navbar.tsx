'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAccessibility } from './AccessibilityProvider'
import { useState, useEffect, useCallback } from 'react'
import {
    Menu, X, BookOpen, Globe, Sun, Moon, Accessibility,
    User, LogOut, ChevronDown
} from 'lucide-react'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { ActivityHeatmap } from './ActivityHeatmap'

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'mr', label: 'మराठी', flag: '🇮🇳' },
]

export function Navbar({ locale }: { locale: string }) {
    const t = useTranslations('nav')
    const router = useRouter()
    const path = usePathname()
    const { user, signOut } = useSupabaseUser()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [langOpen, setLangOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const { theme, toggleTheme, toggleDyslexicFont } = useAccessibility()

    // Heatmap data
    const [activityData, setActivityData] = useState<any[]>([])

    const fetchActivity = useCallback(async () => {
        if (!user) return
        try {
            const res = await fetch('/api/activity')
            const data = await res.json()
            if (!data.error) setActivityData(data)
        } catch (err) {
            console.error('Fetch activity error:', err)
        }
    }, [user])

    useEffect(() => {
        if (user) fetchActivity()
    }, [user, fetchActivity])

    const switchLocale = (newLocale: string) => {
        const segments = path.split('/')
        segments[1] = newLocale
        router.push(segments.join('/'))
        setLangOpen(false)
    }

    const currentLang = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0]

    return (
        <header className="fixed top-0 left-0 right-0 z-[60] glass-surface shadow-sm border-b border-white/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo - Favicon styled */}
                    <Link href={`/${locale}`} className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm group-hover:scale-105 transition-all">
                            <BookOpen size={20} className="text-primary fill-primary/10" />
                        </div>
                        <span className="font-bold text-xl font-heading text-dark dark:text-white">
                            Vidya<span className="gradient-text">Mitra</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-1">
                        <Link href={`/${locale}`} className="nav-link">{t('home')}</Link>
                        <Link href={`/${locale}/dashboard`} className="nav-link">{t('dashboard')}</Link>
                        <Link href={`/${locale}/flashcards`} className="nav-link">{t('flashcards')}</Link>
                        <Link href={`/${locale}/roadmap`} className="nav-link">{t('roadmap')}</Link>
                        <Link href={`/${locale}/careers`} className="nav-link">{t('careers')}</Link>
                    </nav>

                    {/* Right Side */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Language */}
                        <div className="relative">
                            <button
                                onClick={() => setLangOpen(v => !v)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:border-primary-300 transition-all text-sm font-medium text-secondary"
                            >
                                <Globe size={15} />
                                <span>{currentLang.flag} {currentLang.label}</span>
                            </button>
                            <AnimatePresence>
                                {langOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 py-1"
                                    >
                                        {LANGUAGES.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => switchLocale(lang.code)}
                                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary-50 hover:text-primary transition-colors flex items-center gap-2
                                                ${locale === lang.code ? 'bg-primary-50 text-primary font-semibold' : 'text-secondary'}`}
                                            >
                                                <span>{lang.flag}</span> {lang.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Theme & Acc */}
                        <div className="flex gap-1.5 p-1 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all text-secondary dark:text-slate-300">
                                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} className="text-yellow-400" />}
                            </button>
                            <button onClick={toggleDyslexicFont} className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all text-secondary dark:text-slate-300">
                                <Accessibility size={16} />
                            </button>
                        </div>

                        {/* Profile Section */}
                        {user ? (
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 p-1 pl-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-primary transition-all active:scale-95 group shadow-sm"
                                >
                                    <div className="flex flex-col items-end text-[10px] pr-1">
                                        <span className="font-bold text-dark dark:text-white truncate max-w-[80px]">
                                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                        </span>
                                        <span className="text-primary font-black uppercase text-[8px] tracking-tighter">Pro Learner</span>
                                    </div>
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="avatar" className="w-8 h-8 rounded-xl shadow-sm border border-black/5" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-xs font-black shadow-sm uppercase">
                                            {user.email?.[0]}
                                        </div>
                                    )}
                                    <ChevronDown size={14} className={clsx("text-slate-400 transition-transform", profileOpen && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-50 overflow-hidden"
                                            >
                                                {/* Profile Card Summary */}
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/5">
                                                        <User size={28} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-dark dark:text-white leading-tight">Your Progress</h3>
                                                        <p className="text-xs text-secondary italic">Keep going, Mitra!</p>
                                                    </div>
                                                </div>

                                                {/* Reusable Heatmap */}
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-100/50 dark:border-slate-700/50">
                                                    <ActivityHeatmap activityData={activityData} />
                                                </div>

                                                <button
                                                    onClick={() => signOut()}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 transition-colors group mt-2"
                                                >
                                                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                                                        <LogOut size={18} />
                                                    </div>
                                                    <span className="text-sm font-bold">Sign Out</span>
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href={`/${locale}/login`} className="btn-primary py-2 px-6 text-sm rounded-2xl">
                                {t('login')}
                            </Link>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <button onClick={() => setMobileOpen(v => !v)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-secondary transition-colors">
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md overflow-hidden"
                    >
                        <div className="px-5 py-6 space-y-4">
                            <div className="grid grid-cols-1 gap-2">
                                <Link href={`/${locale}`} onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-primary-50 text-dark font-medium transition-colors">{t('home')}</Link>
                                <Link href={`/${locale}/dashboard`} onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-primary-50 text-dark font-medium transition-colors">{t('dashboard')}</Link>
                                <Link href={`/${locale}/flashcards`} onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-primary-50 text-dark font-medium transition-colors">{t('flashcards')}</Link>
                                <Link href={`/${locale}/roadmap`} onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-primary-50 text-dark font-medium transition-colors">{t('roadmap')}</Link>
                                <Link href={`/${locale}/careers`} onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-primary-50 text-dark font-medium transition-colors">{t('careers')}</Link>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Switch Language</p>
                                <div className="flex flex-wrap gap-2 px-2">
                                    {LANGUAGES.map(lang => (
                                        <button key={lang.code} onClick={() => { switchLocale(lang.code); setMobileOpen(false) }}
                                            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 border transition-all
                                            ${locale === lang.code ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-gray-100 text-secondary'}`}>
                                            {lang.flag} {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {user ? (
                                <button onClick={() => signOut()} className="w-full btn-secondary py-3 rounded-2xl flex items-center justify-center gap-2">
                                    <LogOut size={18} /> {t('logout')}
                                </button>
                            ) : (
                                <Link href={`/${locale}/login`} onClick={() => setMobileOpen(false)} className="block btn-primary py-3 rounded-2xl text-center">{t('login')}</Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
