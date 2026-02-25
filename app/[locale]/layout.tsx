import { NextIntlClientProvider } from 'next-intl'
import { getMessages, unstable_setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n'
import type { Metadata } from 'next'
import '../globals.css'
import { Navbar } from '@/components/Navbar'
import { AccessibilityProvider } from '@/components/AccessibilityProvider'
import { ChatWidget } from '@/components/ChatWidget'

export const metadata: Metadata = {
    title: 'VidyaMitra — AI That Speaks Your Language',
    description: 'Generate AI-powered slides, flashcards, and voice narration in 5 Indian languages.',
}

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }))
}

interface Props {
    children: React.ReactNode
    params: { locale: string }
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = params

    if (!locales.includes(locale as any)) notFound()

    unstable_setRequestLocale(locale)

    const messages = await getMessages()

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body suppressHydrationWarning>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <AccessibilityProvider>
                        <Navbar locale={locale} />
                        <main className="min-h-screen pt-16">
                            {children}
                        </main>
                        <ChatWidget />
                    </AccessibilityProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
