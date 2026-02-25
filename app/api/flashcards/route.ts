import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: 'AI service not configured: GROQ_API_KEY is missing' }, { status: 500 })
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const LOCALE_NAMES: Record<string, string> = {
        en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil', mr: 'Marathi',
    }

    try {
        const { topic, language = 'en', count = 6, simplifiedMode = false } = await req.json()
        if (!topic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })

        const langName = LOCALE_NAMES[language] ?? 'English'
        const simplifiedNote = simplifiedMode
            ? 'Use very short, simple sentences for all questions and answers.'
            : ''

        const prompt = `Create ${count} flashcards about "${topic}" in ${langName}.
${simplifiedNote}
Return ONLY a valid JSON array:
[
  {
    "id": 1,
    "question": "question text in ${langName}",
    "answer": "answer text in ${langName}",
    "difficulty": "easy|medium|hard"
  }
]`

        const completion = await groq.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.6,
            max_tokens: 1024,
        })

        const raw = completion.choices[0]?.message?.content ?? ''
        const jsonMatch = raw.match(/\[[\s\S]*\]/)
        if (!jsonMatch) return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 })

        const flashcards = JSON.parse(jsonMatch[0])
        return NextResponse.json({ flashcards, language, topic })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
