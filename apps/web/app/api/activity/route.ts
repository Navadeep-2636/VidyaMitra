import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { count } = await req.json()
        const date = new Date().toISOString().split('T')[0]

        // UPSERT activity: date, user_id, count
        // Note: This assumes a table 'user_activity' exists with columns: id (uuid), user_id (uuid), date (date), count (integer)
        // and a unique constraint on (user_id, date)

        const { data, error } = await supabase
            .from('user_activity')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', date)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is code for 'no rows found'
            throw error
        }

        if (data) {
            await supabase
                .from('user_activity')
                .update({ count: data.count + count })
                .eq('id', data.id)
        } else {
            await supabase
                .from('user_activity')
                .insert({ user_id: user.id, date, count })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Activity log error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data, error } = await supabase
            .from('user_activity')
            .select('date, count')
            .eq('user_id', user.id)
            .order('date', { ascending: true })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Activity get error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

