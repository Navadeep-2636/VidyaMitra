'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || url === '' || key === '' || !url.startsWith('https://')) {
        console.warn('Supabase credentials missing or invalid. Auth features will be disabled.')
        return null
    }

    return createBrowserClient(url, key)
}

export function useSupabaseUser() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const supabase = getSupabase()
        if (!supabase) return

        supabase.auth.getUser().then(({ data }) => setUser(data.user))

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        const supabase = getSupabase()
        if (!supabase) return
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
            }
        })
    }

    const signOut = async () => {
        const supabase = getSupabase()
        if (!supabase) return
        await supabase.auth.signOut()
        setUser(null)
    }

    return { user, signInWithGoogle, signOut, supabase: getSupabase() }
}
