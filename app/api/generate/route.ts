import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})

export async function POST(req: Request) {
    try {
        const { topic, language, difficulty, accessibilityMode } = await req.json()

        const prompt = `
            You are an expert educator. Create a structured educational presentation about "${topic}".
            
            Language: ${language}
            Difficulty: ${difficulty}
            Accessibility Mode: ${accessibilityMode ? 'Simplified and clear language for students with learning needs' : 'Standard academic language'}
            
            Output format: Strictly JSON.
            Structure:
            {
                "metadata": {
                    "topic": string,
                    "language": string,
                    "difficulty": string
                },
                "slides": [
                    {
                        "title": string,
                        "content": string[] (at least 3-4 bullet points)
                    }
                ]
            }
            
            Create exactly 5 slides. Ensure the content is in ${language}.
            For Indian languages like Hindi, Telugu, Tamil, Marathi, use the native script.
        `

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        })

        const rawContent = chatCompletion.choices[0].message.content || '{}'
        let content
        try {
            content = JSON.parse(rawContent)
        } catch (e) {
            console.error('Failed to parse Groq response:', rawContent)
            // Attempt to extract JSON if it's wrapped in markers
            const match = rawContent.match(/\{[\s\S]*\}/)
            if (match) content = JSON.parse(match[0])
            else throw new Error('Invalid JSON from AI')
        }

        return NextResponse.json(content)

    } catch (error) {
        console.error('Groq AI Error:', error)
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
    }
}
