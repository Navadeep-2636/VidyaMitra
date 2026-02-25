'use client'

import { useState, useCallback } from 'react'

export function useNarrator() {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const sanitizeText = (text: string) => {
        return text
            .replace(/[*#=~_`\[\]()<>]/g, '') // Remove markdown symbols
            .replace(/\n/g, ' ')               // Replace newlines with spaces
            .replace(/\s+/g, ' ')              // Normalize whitespace
            .trim()
    }

    const speak = useCallback(async (text: string, lang: string) => {
        if (!window.speechSynthesis) return

        window.speechSynthesis.cancel()
        if ((window as any)._currentAudio) {
            ; (window as any)._currentAudio.pause()
                ; (window as any)._currentAudio = null
        }

        const langMap: Record<string, string> = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'te': 'te-IN',
            'ta': 'ta-IN',
            'mr': 'mr-IN'
        }

        const targetLang = langMap[lang] || 'en-IN'
        const voices = window.speechSynthesis.getVoices()
        const hasLocalVoice = voices.some(v => v.lang.startsWith(lang))

        const sanitizedText = sanitizeText(text)
        if (!sanitizedText) return

        setIsSpeaking(true)
        setIsPaused(false)

        if (hasLocalVoice && (lang === 'en' || lang === 'hi')) {
            const utterance = new SpeechSynthesisUtterance(sanitizedText)
            utterance.lang = targetLang
            utterance.onend = () => { setIsSpeaking(false); setIsPaused(false) }
            utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false) }
            window.speechSynthesis.speak(utterance)
        } else {
            // Sequential Playback for Proxy (TE, TA, MR)
            const chunks = sanitizedText.match(/.{1,180}(?:\s|$)/g) || [sanitizedText]

            const playSequentially = async (index: number) => {
                if (index >= chunks.length) {
                    setIsSpeaking(false)
                    setIsPaused(false)
                    return
                }

                const audio = new Audio(`/api/tts?text=${encodeURIComponent(chunks[index])}&lang=${lang}`)
                    ; (window as any)._currentAudio = audio

                audio.onended = () => playSequentially(index + 1)
                audio.onerror = () => { setIsSpeaking(false); setIsPaused(false) }

                try {
                    await audio.play()
                } catch (err) {
                    console.error('Audio playback failed', err)
                    setIsSpeaking(false)
                }
            }

            await playSequentially(0)
        }
    }, [])

    const pause = useCallback(() => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause()
        }
        if ((window as any)._currentAudio) {
            ; (window as any)._currentAudio.pause()
        }
        setIsPaused(true)
    }, [])

    const resume = useCallback(() => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume()
        }
        if ((window as any)._currentAudio) {
            ; (window as any)._currentAudio.play()
        }
        setIsPaused(false)
    }, [])

    const stop = useCallback(() => {
        window.speechSynthesis.cancel()
        if ((window as any)._currentAudio) {
            ; (window as any)._currentAudio.pause()
                ; (window as any)._currentAudio.src = ''
                ; (window as any)._currentAudio = null
        }
        setIsSpeaking(false)
        setIsPaused(false)
    }, [])

    return { speak, stop, pause, resume, isSpeaking, isPaused }
}
