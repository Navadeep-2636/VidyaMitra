'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, RefreshCw, Minus, Maximize2, Mic, Play, Pause, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useNarrator } from '@/hooks/useNarrator'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

declare global {
    interface Window {
        SpeechRecognition: any
        webkitSpeechRecognition: any
    }
}

export function ChatWidget() {
    const params = useParams()
    const locale = (params.locale as string) || 'en'
    const t = useTranslations('chat')
    const { speak, stop, pause, resume, isSpeaking, isPaused } = useNarrator()
    const { user, supabase } = useSupabaseUser()

    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [isWakeWordActive, setIsWakeWordActive] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const recognitionRef = useRef<any>(null)
    const wakeWordRecognitionRef = useRef<any>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    // Initialize Wake Word Detection
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) return

        const wakeWordRec = new SpeechRecognition()
        wakeWordRec.continuous = true
        wakeWordRec.interimResults = false
        wakeWordRec.lang = 'en-US'

        wakeWordRec.onresult = (event: any) => {
            const last = event.results.length - 1
            const text = event.results[last][0].transcript.toLowerCase()
            console.log('Wake word check:', text)
            if (text.includes('vidyamitra') || text.includes('vidya mitra')) {
                setIsOpen(true)
                setIsMinimized(false)
                startListening()
            }
        }

        wakeWordRec.onend = () => {
            if (isWakeWordActive) wakeWordRec.start()
        }

        wakeWordRecognitionRef.current = wakeWordRec
        wakeWordRec.start()
        setIsWakeWordActive(true)

        return () => {
            wakeWordRec.stop()
        }
    }, [])

    // Fetch Chat History
    useEffect(() => {
        if (!user || !supabase) {
            setMessages([])
            return
        }

        const fetchHistory = async () => {
            const { data, error } = await supabase
                .from('chat_history')
                .select('role, content')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })

            if (data && !error) {
                setMessages(data as Message[])
            }
        }

        fetchHistory()
    }, [user, supabase])

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert('Speech Recognition not supported in this browser.')
            return
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }

        const recognition = new SpeechRecognition()
        recognition.lang = locale === 'en' ? 'en-US' : locale === 'hi' ? 'hi-IN' : locale === 'te' ? 'te-IN' : locale === 'ta' ? 'ta-IN' : 'en-US'
        recognition.interimResults = false

        recognition.onstart = () => setIsListening(true)
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            setInput(transcript)
            // Auto-send after voice input
            handleSend(transcript)
        }
        recognition.onend = () => setIsListening(false)
        recognition.onerror = () => setIsListening(false)

        recognitionRef.current = recognition
        recognition.start()
    }

    const handleSend = async (voiceInput?: string) => {
        const messageText = voiceInput || input
        if (!messageText.trim() || isLoading) return

        const userMsg: Message = { role: 'user', content: messageText }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        try {
            // Save User Message to Supabase
            if (user && supabase) {
                await supabase.from('chat_history').insert({
                    user_id: user.id,
                    role: 'user',
                    content: messageText
                })
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
                    locale
                })
            })

            const data = await response.json()
            if (data.response) {
                const assistantMsg: Message = { role: 'assistant', content: data.response }
                setMessages(prev => [...prev, assistantMsg])

                // Save Assistant Message to Supabase
                if (user && supabase) {
                    await supabase.from('chat_history').insert({
                        user_id: user.id,
                        role: 'assistant',
                        content: data.response
                    })
                }

                // Auto-read if it was a voice interaction
                if (voiceInput) {
                    speak(data.response, locale)
                }
            }
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }])
        } finally {
            setIsLoading(false)
        }
    }

    const clearHistory = async () => {
        if (!user || !supabase) {
            setMessages([])
            return
        }

        const { error } = await supabase
            .from('chat_history')
            .delete()
            .eq('user_id', user.id)

        if (!error) {
            setMessages([])
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans flex items-end gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            x: 0,
                            height: isMinimized ? '64px' : '550px',
                            width: '600px'
                        }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-dark p-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <Bot size={18} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm">{t('header')}</h3>
                                        {isWakeWordActive && (
                                            <span className="flex items-center gap-1 text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/30">
                                                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" /> {t('listening')}
                                            </span>
                                        )}
                                    </div>
                                    {!isMinimized && <p className="text-[10px] text-slate-400">{t('subHeader')}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {messages.length > 0 && (
                                    <button
                                        onClick={clearHistory}
                                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                                        title={t('clear')}
                                    >
                                        <RefreshCw size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
                                </button>
                                <button
                                    onClick={() => { setIsOpen(false); stop() }}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                                    {messages.length === 0 && (
                                        <div className="text-center py-10 space-y-4">
                                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100 dark:border-slate-700">
                                                <Bot size={32} className="text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-dark dark:text-white">{t('welcomeTitle')}</h4>
                                                <p className="text-xs text-secondary dark:text-slate-400 px-6">
                                                    {t('welcomeDesc')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={clsx(
                                                "flex items-start gap-2 max-w-[85%]",
                                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                                msg.role === 'user' ? "bg-slate-200 dark:bg-slate-700 dark:text-white" : "bg-primary text-white"
                                            )}>
                                                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className={clsx(
                                                    "p-3 rounded-2xl text-sm leading-relaxed relative group",
                                                    msg.role === 'user'
                                                        ? "bg-dark text-white rounded-tr-none"
                                                        : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-dark dark:text-white shadow-sm rounded-tl-none whitespace-pre-wrap"
                                                )}>
                                                    {msg.content}
                                                    {msg.role === 'assistant' && (
                                                        <div className="absolute -right-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => {
                                                                    if (isSpeaking && !isPaused) pause()
                                                                    else if (isPaused) resume()
                                                                    else speak(msg.content, locale)
                                                                }}
                                                                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm text-primary hover:scale-110 transition-all"
                                                                title={isSpeaking && !isPaused ? "Pause" : "Play"}
                                                            >
                                                                {isSpeaking && !isPaused ? <Pause size={12} /> : <Volume2 size={12} />}
                                                            </button>
                                                            {isSpeaking && (
                                                                <button
                                                                    onClick={stop}
                                                                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm text-red-500 hover:scale-110 transition-all"
                                                                    title={t('stop')}
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-start gap-2 mr-auto max-w-[85%]">
                                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white">
                                                <Bot size={12} />
                                            </div>
                                            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-none flex items-center gap-1">
                                                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                                                <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                                <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 flex gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus-within:border-primary transition-all">
                                            <button
                                                onClick={startListening}
                                                className={clsx(
                                                    "p-2 rounded-xl transition-all",
                                                    isListening ? "bg-red-500 text-white animate-pulse" : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-primary"
                                                )}
                                                title={t('micTitle')}
                                            >
                                                <Mic size={18} />
                                            </button>
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                placeholder={isListening ? t('voiceListening') : t('inputPlaceholder')}
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                                className="flex-1 bg-transparent px-2 py-2 outline-none text-sm text-dark dark:text-white"
                                            />
                                            <button
                                                onClick={() => handleSend()}
                                                disabled={!input.trim() || isLoading}
                                                className="p-2.5 bg-dark dark:bg-primary text-white rounded-xl hover:bg-slate-800 dark:hover:bg-primary-600 transition-all disabled:opacity-50 active:scale-95"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Breathing Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    boxShadow: [
                        "0 0 0 0px rgba(59, 130, 246, 0)",
                        "0 0 0 15px rgba(59, 130, 246, 0.2)",
                        "0 0 0 0px rgba(59, 130, 246, 0)"
                    ]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className={clsx(
                    "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500",
                    isOpen ? "bg-dark text-white rotate-90" : "bg-primary text-white"
                )}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </motion.button>
        </div>
    )
}
