import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})

export async function POST(req: Request) {
    try {
        const { messages, locale } = await req.json()

        const systemPrompt = `
            You are "VidyaMitra AI", a helpful and friendly educational assistant for the VidyaMitra platform.
            Your goal is to solve students' doubts and explain how to use the website.
            
            VidyaMitra Features:
            1. AI Slide Generator: Generates structured educational slides with multilingual voice narration.
            2. AI Flashcards: Interactive cards for quick revision with flip animations and TTS.
            3. Personalized Roadmaps: Step-by-step learning paths with a vertical timeline and voice guidance.
            4. Careers Page: Real-time search for jobs and internships with city-wise filtering.
            
            Guidelines:
            - Respond in the user's language: ${locale}.
            - Be concise, professional, and encouraging.
            - If asked about website info, explain the features listed above.
            - Provide clear, step-by-step answers for educational doubts.
            - Use markdown for formatting (bold, lists, etc.).
        `

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1024,
        })

        const response = chatCompletion.choices[0].message.content || "I'm sorry, I couldn't process that."
        return NextResponse.json({ response })

    } catch (error) {
        console.error('Chat API Error:', error)
        return NextResponse.json({ error: 'Failed to connect to AI' }, { status: 500 })
    }
}
