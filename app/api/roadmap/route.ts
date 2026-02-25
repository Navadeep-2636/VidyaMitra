import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const LOCALE_NAMES: Record<string, string> = {
    en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil', mr: 'Marathi',
}

export async function POST(req: NextRequest) {
    try {
        const { subject, grade = '10', language = 'en' } = await req.json()
        if (!subject) return NextResponse.json({ error: 'Subject required' }, { status: 400 })

        const langName = LOCALE_NAMES[language] ?? 'English'

        const prompt = `Create a 6-week learning roadmap for Grade ${grade} "${subject}" in ${langName}.
Return ONLY valid JSON array:
[
  {
    "week": 1,
    "title": "week title in ${langName}",
    "topics": ["topic1", "topic2", "topic3"],
    "goal": "what the student will achieve by end of week in ${langName}"
  }
]`

        const completion = await groq.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.6,
            max_tokens: 1500,
        })

        const raw = completion.choices[0]?.message?.content ?? ''
        const jsonMatch = raw.match(/\[[\s\S]*\]/)
        if (!jsonMatch) return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 })

        const roadmap = JSON.parse(jsonMatch[0])
        return NextResponse.json({ roadmap, language, subject })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
