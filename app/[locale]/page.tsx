import { useTranslations } from 'next-intl'
import { unstable_setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { Globe, Mic, Zap, BarChart2, ShieldCheck, BookOpenCheck } from 'lucide-react'

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="card-surface p-6 hover:shadow-lg transition-shadow duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {icon}
            </div>
            <h3 className="font-semibold text-dark dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-secondary dark:text-slate-400">{desc}</p>
        </div>
    )
}

// Locale is passed via Next.js [locale] dynamic param
export default function HomePage({ params }: { params: { locale: string } }) {
    unstable_setRequestLocale(params.locale)
    const t = useTranslations('hero')
    const tBtn = useTranslations('buttons')
    const tFeat = useTranslations('features')
    const tAuth = useTranslations('auth')
    const tHome = useTranslations('home')
    const locale = params.locale

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary-600 to-primary-800 text-white pt-24 pb-32 px-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-5xl mx-auto text-center animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
                        <Globe size={14} /> <span>EN · हि · తె · த · म</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold font-heading leading-tight mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-white/80 mb-4">{t('subtitle')}</p>
                    <p className="text-base text-white/60 max-w-2xl mx-auto mb-10">{t('description')}</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href={`/${locale}/dashboard`}
                            className="bg-accent hover:bg-yellow-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <Zap size={20} /> {t('cta')}
                        </Link>
                        <Link
                            href={`/${locale}/login`}
                            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 flex items-center gap-2"
                        >
                            <ShieldCheck size={18} /> {tAuth('loginWithGoogle')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Wave Separator */}
            <div className="-mt-1">
                <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full transition-colors duration-500">
                    <path d="M0 60L1440 0V60H0Z" fill="currentColor" className="text-surface dark:text-slate-900" />
                </svg>
            </div>

            {/* Features Grid */}
            <section className="py-20 px-4 bg-surface dark:bg-slate-900 transition-colors duration-500">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="section-title dark:text-white">{tHome('whyTitle')}</h2>
                        <p className="section-subtitle dark:text-slate-400">{tHome('whySubtitle')}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard icon={<Globe size={22} />} title={tFeat('multilingualAI')} desc={tFeat('multilingualAIDesc')} />
                        <FeatureCard icon={<Mic size={22} />} title={tFeat('voiceNarration')} desc={tFeat('voiceNarrationDesc')} />
                        <FeatureCard icon={<ShieldCheck size={22} />} title={tFeat('accessibility')} desc={tFeat('accessibilityDesc')} />
                        <FeatureCard icon={<BookOpenCheck size={22} />} title={tFeat('progress')} desc={tFeat('progressDesc')} />
                        <FeatureCard icon={<BarChart2 size={22} />} title={tFeat('roadmap')} desc={tFeat('roadmapDesc')} />
                        <FeatureCard icon={<Zap size={22} />} title={tFeat('instant')} desc={tFeat('instantDesc')} />
                    </div>
                </div>
            </section>

            {/* CTA Band */}
            <section className="bg-gradient-to-r from-primary to-primary-700 text-white py-16 px-4 text-center">
                <h2 className="text-3xl font-bold font-heading mb-4">{tHome('readyTitle')}</h2>
                <p className="text-white/70 mb-8">{tHome('readySubtitle')}</p>
                <Link
                    href={`/${locale}/dashboard`}
                    className="inline-block bg-accent hover:bg-yellow-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                >
                    {tBtn('generate')} →
                </Link>
            </section>

            {/* Footer */}
            <footer className="bg-dark text-white/50 text-center text-xs py-6">
                <p>{tHome('footer')}</p>
            </footer>
        </div>
    )
}
