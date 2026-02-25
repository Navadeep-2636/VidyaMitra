'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Zap, BookOpen, Layers, Accessibility, RefreshCw, Download, Play, FileText, Upload, MessageSquare, Volume2, Languages, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useAccessibility } from '@/components/AccessibilityProvider'
import { useNarrator } from '@/hooks/useNarrator'
// Initialized in useEffect

export default function DashboardPage() {
    const params = useParams()
    const locale = params.locale as string
    const t = useTranslations('dashboard')
    const tCommon = useTranslations('hero')
    const { simplifiedLanguage: accessibilityMode } = useAccessibility()
    const { speak, stop, isSpeaking } = useNarrator()

    const [topic, setTopic] = useState('')
    const [inputMode, setInputMode] = useState<'prompt' | 'pdf' | 'text'>('prompt')
    const [pastedText, setPastedText] = useState('')
    const [isExtracting, setIsExtracting] = useState(false)
    const [difficulty, setDifficulty] = useState('intermediate')
    const [isGenerating, setIsGenerating] = useState(false)
    const [content, setContent] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [pdfjsLoaded, setPdfjsLoaded] = useState(false)
    const pdfjsRef = useRef<any>(null)

    // Selection Features State
    const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null)
    const [isTranslating, setIsTranslating] = useState(false)
    const [translatedText, setTranslatedText] = useState<string | null>(null)
    const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false)
    const [originalSelectionText, setOriginalSelectionText] = useState<string>('')
    const [targetTranslateLang, setTargetTranslateLang] = useState<string>(locale)

    const availableLanguages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'mr', name: 'Marathi' },
        { code: 'ta', name: 'Tamil' },
        { code: 'te', name: 'Telugu' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'ja', name: 'Japanese' }
    ]

    useEffect(() => {
        const initPdf = async () => {
            try {
                // Use legacy build for better compatibility with Next.js/Webpack
                const pdfjs = await import('pdfjs-dist/legacy/build/pdf.min.mjs')

                // Use the local worker (copied from legacy/build)
                pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

                pdfjsRef.current = pdfjs
                setPdfjsLoaded(true)
            } catch (err) {
                console.error('[PDF.js] Initialization failed:', err)
                setError('Failed to load PDF library. Please refresh the page.')
            }
        }
        initPdf()
    }, [])

    useEffect(() => {
        const handleSelection = () => {
            const sel = window.getSelection()
            if (sel && sel.toString().trim().length > 0) {
                const range = sel.getRangeAt(0)
                const rect = range.getBoundingClientRect()
                // Only show if selection is within the slides container (handled by event delegation or simple check)
                setSelection({
                    text: sel.toString().trim(),
                    x: rect.left + rect.width / 2 + window.scrollX,
                    y: rect.top + window.scrollY
                })
            } else {
                setSelection(null)
            }
        }

        document.addEventListener('mouseup', handleSelection)
        return () => document.removeEventListener('mouseup', handleSelection)
    }, [])

    const handleTranslate = async (text: string, lang: string = targetTranslateLang) => {
        setIsTranslating(true)
        setIsTranslationModalOpen(true)
        setTranslatedText(null)
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, targetLang: lang })
            })
            const data = await response.json()
            if (data.error) throw new Error(data.error)
            setTranslatedText(data.translatedText)
        } catch (err) {
            console.error('Translation failed:', err)
            setTranslatedText('Translation failed. Please try again.')
        } finally {
            setIsTranslating(false)
        }
    }

    // Re-translate when language changes while modal is open
    useEffect(() => {
        if (isTranslationModalOpen && originalSelectionText) {
            handleTranslate(originalSelectionText, targetTranslateLang)
        }
    }, [targetTranslateLang, isTranslationModalOpen, originalSelectionText])

    const extractTextFromPDF = async (file: File) => {
        if (!pdfjsRef.current) {
            console.error('PDF.js not initialized yet')
            setError('PDF.js is still loading. Please try again in a moment.')
            return
        }
        const pdfjs = pdfjsRef.current
        setIsExtracting(true)
        setError(null)
        try {
            const getDocument = pdfjs.getDocument || (pdfjs.default && pdfjs.default.getDocument)
            if (!getDocument) {
                console.error('[PDF.js] getDocument not found in:', Object.keys(pdfjs))
                throw new Error('PDF library structure mismatch. Please try refreshing.')
            }
            const arrayBuffer = await file.arrayBuffer()
            const loadingTask = getDocument({ data: arrayBuffer })
            const pdf = await loadingTask.promise
            let fullText = ''
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const textContent = await page.getTextContent()
                const pageText = textContent.items.map((item: any) => item.str).join(' ')
                fullText += pageText + '\n'
            }
            setPastedText(fullText)
            if (!topic || topic === '') setTopic(file.name.replace('.pdf', ''))
        } catch (err: any) {
            console.error('PDF extraction failed:', err)
            if (err.name === 'PasswordException') {
                setError(t('pdfPassword'))
            } else {
                setError(t('invalidPDF'))
            }
        } finally {
            setIsExtracting(false)
        }
    }

    const handleGenerate = async () => {
        let currentTopic = ''
        if (inputMode === 'prompt') {
            currentTopic = topic
        } else if (inputMode === 'pdf') {
            // Use extracted text if available and non-empty, otherwise fallback to filename topic
            currentTopic = (pastedText && pastedText.trim() !== '') ? pastedText : topic
        } else {
            currentTopic = pastedText
        }

        if (!currentTopic || currentTopic.trim() === '') {
            setError(t('emptyText'))
            return
        }

        setIsGenerating(true)
        setError(null)
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Truncate topic to avoid 500 errors with extremely large inputs
                    topic: currentTopic.length > 6000 ? currentTopic.substring(0, 6000) + '...' : currentTopic,
                    language: locale,
                    difficulty,
                    accessibilityMode
                })
            })
            const data = await response.json()
            if (data.error) throw new Error(data.error)
            setContent(data)
        } catch (error: any) {
            console.error('Generation failed:', error)
            setError(error.message || 'Generation failed')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-dark dark:text-white">
                        {t('title')}
                    </h1>
                    <p className="text-secondary dark:text-slate-400">{t('welcome')}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="card-surface p-6 space-y-4">
                        <h2 className="flex items-center gap-2 font-semibold text-lg text-primary">
                            <Zap size={20} /> {t('generator')}
                        </h2>

                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1">
                            <button
                                onClick={() => setInputMode('prompt')}
                                className={clsx(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                                    inputMode === 'prompt' ? "bg-white dark:bg-slate-800 shadow-sm text-primary" : "text-secondary hover:bg-white/50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <Zap size={16} /> {t('inputModePrompt')}
                            </button>
                            <button
                                onClick={() => setInputMode('pdf')}
                                className={clsx(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                                    inputMode === 'pdf' ? "bg-white dark:bg-slate-800 shadow-sm text-primary" : "text-secondary hover:bg-white/50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <Upload size={16} /> {t('inputModePDF')}
                            </button>
                            <button
                                onClick={() => setInputMode('text')}
                                className={clsx(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                                    inputMode === 'text' ? "bg-white dark:bg-slate-800 shadow-sm text-primary" : "text-secondary hover:bg-white/50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <FileText size={16} /> {t('inputModeText')}
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {inputMode === 'prompt' ? (
                                <motion.div
                                    key="prompt"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-2"
                                >
                                    <label className="text-sm font-medium text-secondary dark:text-slate-400">{t('topicLabel')}</label>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder={t('topicPlaceholder')}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
                                    />
                                </motion.div>
                            ) : inputMode === 'pdf' ? (
                                <motion.div
                                    key="pdf"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) extractTextFromPDF(file)
                                            }}
                                            className="hidden"
                                            id="pdf-upload"
                                        />
                                        <label
                                            htmlFor="pdf-upload"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-primary transition-all group"
                                        >
                                            {isExtracting ? (
                                                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                                            )}
                                            <span className="mt-2 text-sm text-secondary dark:text-slate-400 group-hover:text-primary transition-colors">
                                                {isExtracting ? t('extracting') : t('uploadPlaceholder')}
                                            </span>
                                        </label>
                                    </div>
                                    {pastedText && !isExtracting && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs">
                                            <Zap size={14} /> {t('pdfExtracted')}
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="text"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-2"
                                >
                                    <label className="text-sm font-medium text-secondary dark:text-slate-400">{t('inputModeText')}</label>
                                    <textarea
                                        value={pastedText}
                                        onChange={(e) => setPastedText(e.target.value)}
                                        placeholder={t('pastePlaceholder')}
                                        className="w-full h-32 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary dark:text-slate-400">{t('difficultyLabel')}</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-dark dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="beginner">{t('difficultyOptions.beginner')}</option>
                                <option value="intermediate">{t('difficultyOptions.intermediate')}</option>
                                <option value="advanced">{t('difficultyOptions.advanced')}</option>
                            </select>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || (inputMode === 'prompt' ? !topic : !pastedText) || isExtracting}
                            className={clsx(
                                "w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
                                (isGenerating || isExtracting) ? "bg-slate-400 cursor-not-allowed" : "bg-primary hover:bg-primary-600 shadow-md hover:shadow-lg active:scale-95"
                            )}
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                            {isGenerating ? t('generating') : t('generateBtn')}
                        </button>
                    </section>
                </div>

                {/* Content Display Area */}
                <div className="lg:col-span-2 space-y-6 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {!content && !isGenerating ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50"
                            >
                                <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                                <h3 className="text-xl font-semibold text-slate-500 dark:text-slate-400">{t('emptyState')}</h3>
                                <p className="text-slate-400 dark:text-slate-500 max-w-sm mt-2">{t('emptyStateDesc')}</p>
                            </motion.div>
                        ) : isGenerating ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center p-12 space-y-6"
                            >
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
                                </div>
                                <div className="space-y-2 text-center">
                                    <h3 className="text-xl font-bold text-dark dark:text-white animate-pulse">{t('generatingContent')}</h3>
                                    <p className="text-secondary dark:text-slate-400 text-sm">{t('generationSteps')}</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex gap-2">
                                        <span className="badge-primary">{content?.metadata?.language || locale}</span>
                                        <span className="badge-secondary">{content?.metadata?.difficulty || difficulty}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (isSpeaking) stop()
                                                else {
                                                    const text = content.slides.map((s: any) => `${s.title}. ${s.content.join('. ')}`).join('. ')
                                                    speak(text, locale)
                                                }
                                            }}
                                            className={clsx("p-2 rounded-lg transition-colors", isSpeaking ? "bg-primary text-white" : "hover:bg-slate-100 text-secondary")}
                                            title="Narration"
                                        >
                                            <Play size={20} className={isSpeaking ? "animate-pulse" : ""} />
                                        </button>
                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-secondary" title="Download"><Download size={20} /></button>
                                    </div>
                                </div>

                                {/* Slides View */}
                                <div className="space-y-4">
                                    {content?.slides?.map((slide: any, idx: number) => (
                                        <div key={idx} className="card-surface p-8 border-l-4 border-l-primary animate-slide-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                                            <h3 className="text-2xl font-bold font-heading text-primary mb-4">{slide.title}</h3>
                                            <ul className="space-y-3">
                                                {slide.content.map((point: string, pIdx: number) => (
                                                    <li key={pIdx} className="flex gap-3 text-lg leading-relaxed text-dark dark:text-white">
                                                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Selection Popup */}
            <AnimatePresence>
                {selection && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: -45 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ left: selection.x, top: selection.y }}
                        className="fixed z-50 -translate-x-1/2 flex items-center gap-1 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <button
                            onClick={() => {
                                setOriginalSelectionText(selection.text)
                                handleTranslate(selection.text)
                                setSelection(null)
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-lg"
                        >
                            <Languages size={16} className="text-primary" />
                            Translate
                        </button>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                        <button
                            onClick={() => {
                                speak(selection.text, locale)
                                setSelection(null)
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-lg"
                        >
                            <Volume2 size={16} className="text-primary" />
                            Listen
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Translation Modal */}
            <AnimatePresence>
                {isTranslationModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsTranslationModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-3 text-primary font-bold text-lg">
                                    <Languages size={24} />
                                    Translation
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={targetTranslateLang}
                                        onChange={(e) => setTargetTranslateLang(e.target.value)}
                                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm"
                                    >
                                        {availableLanguages.map((lang) => (
                                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setIsTranslationModalOpen(false)}
                                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-full"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 space-y-6 overflow-y-auto flex-1">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Original Text</label>
                                    <p className="text-slate-600 dark:text-slate-300 italic text-lg leading-relaxed">{originalSelectionText}</p>
                                </div>
                                <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">Translated Content</label>
                                    {isTranslating ? (
                                        <div className="flex items-center gap-3 text-secondary py-4">
                                            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            Translating...
                                        </div>
                                    ) : (
                                        <p className="text-dark dark:text-white text-xl font-medium leading-relaxed">
                                            {translatedText}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                                <button
                                    onClick={() => setIsTranslationModalOpen(false)}
                                    className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
