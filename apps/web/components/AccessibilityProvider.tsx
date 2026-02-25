'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AccessibilityState {
    dyslexicFont: boolean
    highContrast: boolean
    simplifiedLanguage: boolean
    theme: 'light' | 'dark'
    textSize: 'normal' | 'large' | 'xlarge'
    toggleDyslexicFont: () => void
    toggleHighContrast: () => void
    toggleSimplifiedLanguage: () => void
    toggleTheme: () => void
    setTextSize: (size: 'normal' | 'large' | 'xlarge') => void
}

const AccessibilityContext = createContext<AccessibilityState | null>(null)

export function useAccessibility() {
    const ctx = useContext(AccessibilityContext)
    if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider')
    return ctx
}

const TEXT_SIZE_CLASS: Record<string, string> = {
    normal: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl',
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [dyslexicFont, setDyslexicFont] = useState(false)
    const [highContrast, setHighContrast] = useState(false)
    const [simplifiedLanguage, setSimplifiedLanguage] = useState(false)
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [textSize, setTextSizeState] = useState<'normal' | 'large' | 'xlarge'>('normal')

    useEffect(() => {
        const saved = localStorage.getItem('accessibility')
        if (saved) {
            const s = JSON.parse(saved)
            setDyslexicFont(s.dyslexicFont ?? false)
            setHighContrast(s.highContrast ?? false)
            setSimplifiedLanguage(s.simplifiedLanguage ?? false)
            setTheme(s.theme ?? 'light')
            setTextSizeState(s.textSize ?? 'normal')
        }
    }, [])

    useEffect(() => {
        const body = document.body
        body.classList.toggle('dyslexic-font', dyslexicFont)
        body.classList.toggle('high-contrast', highContrast)

        // APPLY DARK MODE TO HTML ELEMENT (Tailwind darkMode: 'class')
        document.documentElement.classList.toggle('dark', theme === 'dark')

        // text size
        body.classList.remove('text-base', 'text-lg', 'text-xl')
        body.classList.add(TEXT_SIZE_CLASS[textSize])
        localStorage.setItem('accessibility', JSON.stringify({ dyslexicFont, highContrast, simplifiedLanguage, theme, textSize }))
    }, [dyslexicFont, highContrast, simplifiedLanguage, theme, textSize])

    return (
        <AccessibilityContext.Provider value={{
            dyslexicFont,
            highContrast,
            simplifiedLanguage,
            theme,
            textSize,
            toggleDyslexicFont: () => setDyslexicFont(v => !v),
            toggleHighContrast: () => setHighContrast(v => !v),
            toggleSimplifiedLanguage: () => setSimplifiedLanguage(v => !v),
            toggleTheme: () => setTheme(v => v === 'light' ? 'dark' : 'light'),
            setTextSize: (s) => setTextSizeState(s),
        }}>
            {children}
        </AccessibilityContext.Provider>
    )
}
