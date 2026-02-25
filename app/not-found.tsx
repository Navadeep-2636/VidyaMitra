'use client'

import Link from 'next/link'

export default function NotFound() {
    return (
        <html lang="en">
            <body className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans">
                <div className="text-center space-y-6 p-8 bg-white rounded-[2rem] shadow-xl border border-slate-100 max-w-md">
                    <h1 className="text-6xl font-bold text-primary">404</h1>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-dark">Page Not Found</h2>
                        <p className="text-slate-500 text-sm">
                            The page you are looking for doesn't exist or has been moved.
                        </p>
                    </div>
                    <Link
                        href="/en"
                        className="inline-block px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary/20"
                    >
                        Back to Home
                    </Link>
                </div>
            </body>
        </html>
    )
}
