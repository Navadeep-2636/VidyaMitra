'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
    BookOpen, Layers, Zap, RefreshCw, ChevronLeft, ChevronRight,
    Play, Lightbulb, CheckCircle2, Info, Sparkles, MousePointer2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useNarrator } from '@/hooks/useNarrator'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'

export default function FlashcardsPage() {
    const params = useParams()
    const locale = params.locale as string
    const t = useTranslations('dashboard')
    const { speak, stop, isSpeaking } = useNarrator()
    const { user } = useSupabaseUser()

    const [topic, setTopic] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cards, setCards] = useState<any[]>([])
    const [currentIdx, setCurrentIdx] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [showHintIdx, setShowHintIdx] = useState(-1) // -1: no hint

    // Activity logging
    const logActivity = async (count: number) => {
        if (!user) return
        try {
            await fetch('/api/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count })
            })
        } catch (err) {
            console.error('Log activity error:', err)
        }
    }

    const handleGenerate = async () => {
        if (!topic) return
        setIsGenerating(true)
        setError(null)
        setCards([])
        try {
            const response = await fetch('/api/generate-flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, language: locale })
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.details || data.error || 'Failed to generate flashcards. Please try again.')
            }

            if (data.flashcards && data.flashcards.length > 0) {
                setCards(data.flashcards)
                setCurrentIdx(0)
                setIsFlipped(false)
                setShowHintIdx(-1)
                logActivity(1) // Generation activity
            } else {
                throw new Error('AI returned no flashcards for this topic. Try something else!')
            }
        } catch (error: any) {
            console.error('Generation error:', error)
            setError(error.message)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleNext = () => {
        const next = Math.min(cards.length - 1, currentIdx + 1)
        if (next !== currentIdx) {
            setCurrentIdx(next)
            setIsFlipped(false)
            setShowHintIdx(-1)
            logActivity(1) // Practice activity
        }
    }

    const handleBack = () => {
        setCurrentIdx(Math.max(0, currentIdx - 1))
        setIsFlipped(false)
        setShowHintIdx(-1)
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-12 pb-24">
            {/* Header - Cleaned up profile icon removed */}
            <header className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10 text-primary animate-pulse-slow">
                    <Sparkles size={14} className="fill-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Master Your Knowledge</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black font-heading text-dark dark:text-white tracking-tight">
                    AI Flashcards
                </h1>
                <p className="text-secondary dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Generate personalized flashcards with progressive hints to accelerate your learning in 5 languages.
                </p>
            </header>

            {/* Input Section */}
            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-slate-800/40 shadow-2xl">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="What do you want to learn today?"
                        className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-slate-900 text-dark dark:text-white shadow-inner transition-all text-lg font-medium"
                    />
                    <Layers className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={24} />
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic}
                    className="px-10 py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:scale-100"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" size={22} /> : <Zap size={22} className="fill-white" />}
                    {isGenerating ? 'Generating...' : 'Unlock Cards'}
                </button>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/40 rounded-2xl flex items-center gap-4 text-red-600 dark:text-red-400 shadow-lg shadow-red-500/5 mx-auto max-w-2xl"
                    >
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                            <Info size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="font-black text-sm uppercase tracking-tight">Generation Failed</p>
                            <p className="text-sm opacity-80 font-medium">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="min-h-[550px] flex flex-col items-center justify-center relative">
                {cards.length > 0 ? (
                    <div className="w-full max-w-xl space-y-10">
                        {/* Premium Flashcard */}
                        <div className="relative h-[400px] perspective-2000 group">
                            <motion.div
                                className="w-full h-full relative preserve-3d cursor-pointer"
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 15 }}
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                {/* Front - Question */}
                                <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-slate-50 dark:border-slate-800/50 flex flex-col items-center justify-start p-10 pt-12 text-center overflow-hidden backface-hidden">
                                    {/* Background Decor */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />

                                    <div className="px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[12px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-8">
                                        Active Recall
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl font-black text-dark dark:text-white leading-tight tracking-tight mt-4">
                                        {cards[currentIdx].question}
                                    </h2>

                                    <div className="mt-12 flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-full">
                                        <MousePointer2 size={14} className="animate-bounce" /> Click to reveal answer
                                    </div>
                                </div>

                                {/* Back - Answer */}
                                {/* Back - Answer */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white rounded-[3rem] shadow-[0_20px_50px_rgba(59,130,246,0.3)] flex flex-col items-center justify-center p-12 text-center backface-hidden"
                                    style={{ transform: 'rotateY(180deg)' }}
                                >
                                    <div className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-2xl text-[12px] font-black text-white uppercase tracking-[0.2em] mb-8">
                                        Mastered Content
                                    </div>
                                    <p className="text-2xl sm:text-3xl font-bold leading-relaxed tracking-tight max-w-md">
                                        {cards?.[currentIdx]?.answer}
                                    </p>

                                    <div className="absolute bottom-12 flex items-center gap-2 text-white/60 font-bold uppercase text-[10px] tracking-widest">
                                        <CheckCircle2 size={16} /> Mark as known
                                    </div>
                                </div>
                            </motion.div>

                            {/* Voice Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isSpeaking) stop();
                                    else speak(isFlipped ? cards[currentIdx].answer : cards[currentIdx].question, locale);
                                }}
                                className={clsx(
                                    "absolute top-8 right-8 w-14 h-14 rounded-2xl shadow-xl transition-all z-20 flex items-center justify-center",
                                    isSpeaking ? "bg-accent text-dark scale-110" : "bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-primary dark:text-blue-400 hover:scale-110 active:scale-95"
                                )}
                            >
                                <Play size={24} fill={isSpeaking ? "currentColor" : "none"} className={isSpeaking ? "animate-pulse" : ""} />
                            </button>
                        </div>

                        {/* Enhanced Hints System */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-center gap-8">
                                {[1, 2, 3].map((h) => (
                                    <div key={h} className="relative">
                                        <button
                                            onClick={() => setShowHintIdx(h - 1)}
                                            className={clsx(
                                                "w-16 h-16 rounded-[1.25rem] flex flex-col items-center justify-center border-4 transition-all relative group shadow-lg",
                                                showHintIdx >= h - 1
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-300 hover:text-primary hover:border-primary/50 hover:bg-primary/5"
                                            )}
                                        >
                                            <Lightbulb size={24} className={clsx("transition-transform group-hover:scale-110", showHintIdx >= h - 1 && "fill-primary/20")} />
                                            <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter mt-1">Hint {h}</span>

                                            {showHintIdx >= h - 1 && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                                                    <CheckCircle2 size={10} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {showHintIdx !== -1 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border-2 border-primary/20 p-6 rounded-[2rem] flex items-start gap-4 shadow-xl shadow-primary/5"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                                            <Info size={20} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Hint Breakdown</p>
                                            <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                                                "{cards[currentIdx].hints?.[showHintIdx] || "Consider the core principles of the topic!"}"
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Master Controls */}
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={handleBack}
                                disabled={currentIdx === 0}
                                className="flex-1 p-6 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl border-2 border-slate-50 dark:border-slate-800 text-dark dark:text-white disabled:opacity-20 hover:border-primary transition-all flex items-center justify-center gap-3 active:scale-95 group font-bold"
                            >
                                <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="hidden sm:inline text-slate-900 dark:text-white font-black">Previous</span>
                            </button>

                            <div className="px-8 py-4 bg-dark dark:bg-slate-800 rounded-full flex flex-col items-center">
                                <span className="font-black text-white text-xl leading-none">{currentIdx + 1}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">OF {cards.length}</span>
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={currentIdx === cards.length - 1}
                                className="flex-1 p-6 rounded-[2rem] bg-gradient-to-r from-primary to-blue-600 shadow-xl shadow-primary/20 text-white disabled:opacity-20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 group font-bold"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-8 animate-fade-in py-12">
                        <div className="relative inline-block">
                            <div className="w-40 h-40 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-[3rem] flex items-center justify-center mx-auto border-2 border-dashed border-primary/20">
                                <Layers size={80} className="text-primary/30" />
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 animate-bounce">
                                <Zap size={32} className="text-primary fill-primary/20" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-dark dark:text-white">Ready for Active Recall?</h2>
                            <p className="text-secondary dark:text-slate-500 max-w-sm mx-auto font-medium">
                                Unlock high-performance learning with AI-generated flashcards. 100% focused on recall.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
