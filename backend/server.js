const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const LOCALE_NAMES = {
    en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil', mr: 'Marathi',
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Chat AI Route
app.post('/api/chat', async (req, res) => {
    const { messages, locale } = req.body;
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY missing' });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    try {
        const systemPrompt = `You are "VidyaMitra AI", a helpful educational assistant for the VidyaMitra platform. Respond in: ${locale}.`;
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1024,
        });
        res.json({ response: chatCompletion.choices[0].message.content });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Content Generation Route (Slides)
app.post('/api/generate', async (req, res) => {
    const { topic, language, difficulty, accessibilityMode } = req.body;
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY missing' });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    try {
        const prompt = `Create a 5-slide JSON presentation about "${topic}" in ${language}. Difficulty: ${difficulty}. Accessibility: ${accessibilityMode}.`;
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        });
        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Roadmap Route
app.post('/api/generate-roadmap', async (req, res) => {
    const { subject, grade = '10', language = 'en' } = req.body;
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY missing' });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    try {
        const langName = LOCALE_NAMES[language] ?? 'English';
        const prompt = `Create a 6-week learning roadmap for Grade ${grade} "${subject}" in ${langName}. Return ONLY JSON array.`;
        const completion = await groq.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: prompt }],
        });
        const match = completion.choices[0].message.content.match(/\[[\s\S]*\]/);
        res.json({ roadmap: JSON.parse(match[0]), language, subject });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Flashcards Route
app.post('/api/generate-flashcards', async (req, res) => {
    const { topic, language } = req.body;
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY missing' });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    try {
        const prompt = `Create 10 JSON flashcards about "${topic}" in ${language} with fields: question, answer, hints[].`;
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        });
        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Translate Route
app.post('/api/translate', async (req, res) => {
    const { text, targetLang } = req.body;
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY missing' });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    try {
        const prompt = `Translate to ${targetLang}: "${text}". Provide ONLY the translation.`;
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });
        res.json({ translatedText: completion.choices[0].message.content });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
