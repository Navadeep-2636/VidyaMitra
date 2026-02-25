'use client'

import { useTranslations } from 'next-intl'
import { useAccessibility } from '@/components/AccessibilityProvider'
import { Type, Contrast, BookOpen, ZoomIn } from 'lucide-react'

function Toggle({ label, desc, enabled, onToggle, icon }: {
    label: string; desc: string; enabled: boolean; onToggle: () => void; icon: React.ReactNode
}) {
    return (
        <div className="card-surface p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
                <span className="w-9 h-9 flex-shrink-0 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
                    {icon}
                </span>
                <div>
                    <p className="font-semibold text-dark">{label}</p>
                    <p className="text-sm text-secondary">{desc}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                aria-pressed={enabled}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${enabled ? 'bg-primary' : 'bg-gray-200'}`}
            >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
        </div>
    )
}

export default function SettingsPage() {
    const t = useTranslations('accessibility')
    const { dyslexicFont, highContrast, simplifiedLanguage, textSize,
        toggleDyslexicFont, toggleHighContrast, toggleSimplifiedLanguage, setTextSize } = useAccessibility()

    return (
        <div className="min-h-screen bg-surface">
            <div className="max-w-2xl mx-auto px-4 py-10">
                <h1 className="section-title mb-2">{t('title')}</h1>
                <p className="section-subtitle mb-8">Customize your learning experience.</p>

                <div className="space-y-4">
                    <Toggle
                        icon={<Type size={18} />}
                        label={t('dyslexicFont')}
                        desc="Switches to OpenDyslexic font for easier reading."
                        enabled={dyslexicFont}
                        onToggle={toggleDyslexicFont}
                    />
                    <Toggle
                        icon={<Contrast size={18} />}
                        label={t('highContrast')}
                        desc="High contrast black-and-white mode for visual clarity."
                        enabled={highContrast}
                        onToggle={toggleHighContrast}
                    />
                    <Toggle
                        icon={<BookOpen size={18} />}
                        label={t('simplifiedLanguage')}
                        desc="AI generates simpler, shorter sentences for better comprehension."
                        enabled={simplifiedLanguage}
                        onToggle={toggleSimplifiedLanguage}
                    />

                    {/* Text size */}
                    <div className="card-surface p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="w-9 h-9 flex-shrink-0 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
                                <ZoomIn size={18} />
                            </span>
                            <div>
                                <p className="font-semibold text-dark">{t('textSize')}</p>
                                <p className="text-sm text-secondary">Increase font size for better readability.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {(['normal', 'large', 'xlarge'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setTextSize(s)}
                                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all capitalize ${textSize === s ? 'border-primary bg-primary-50 text-primary' : 'border-gray-200 text-secondary hover:border-gray-300'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-8">Settings are saved automatically in your browser.</p>
            </div>
        </div>
    )
}
