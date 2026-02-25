import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: 'AI service not configured: GROQ_API_KEY is missing' }, { status: 500 })
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    try {
        const { topic, language } = await req.json()

        const prompt = `
            Create 10 educational flashcards about "${topic}".
            Language: ${language}
            
            Output format: Strictly JSON.
            Structure:
            {
                "flashcards": [
                    { 
                        "question": string, 
                        "answer": string,
                        "hints": [string, string, string]
                    }
                ]
            }
            
            Keep questions short and answers concise. 
            Provide 3 progressive hints for each question (hint 1: broad, hint 2: medium, hint 3: specific).
            Use native script for Indian languages.
        `

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        })

        const content = chatCompletion.choices[0].message.content || '{}'

        try {
            return NextResponse.json(JSON.parse(content))
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError, 'Content:', content)
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
        }
    } catch (error: any) {
        console.error('generate-flashcards error:', error)
        return NextResponse.json({
            error: 'Failed',
            details: error.message || String(error)
        }, { status: 500 })
    }
}

