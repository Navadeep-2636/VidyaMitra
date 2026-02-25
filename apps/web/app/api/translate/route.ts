import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})

export async function POST(req: Request) {
    try {
        const { text, targetLang } = await req.json()

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 })
        }

        const prompt = `
            Translate the following text into ${targetLang}. 
            Provide only the translated text as the output. 
            Do not include any explanations or conversational text.
            
            Text: "${text}"
        `

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        })

        const translatedText = chatCompletion.choices[0].message.content || ''

        return NextResponse.json({ translatedText })

    } catch (error) {
        console.error('Translation Error:', error)
        return NextResponse.json({ error: 'Failed to translate content' }, { status: 500 })
    }
}
