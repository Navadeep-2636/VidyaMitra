import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'VidyaMitra',
    description: 'AI That Speaks Your Language',
}

// The root layout must be minimal to avoid nesting with [locale]/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return children
}
