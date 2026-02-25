import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const dynamic = 'force-dynamic'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'MISSING_KEY'
})

export async function POST(req: Request) {
  try {
    const { profile, language } = await req.json()

    const prompt = `You are an elite learning strategist and curriculum architect.

Generate a highly personalized, structured learning roadmap based on this user profile:

GOAL: ${profile.goal}
DESIRED OUTCOME: ${profile.desiredOutcome || 'Not specified'}
SKILL LEVEL: ${profile.skillLevel}
BACKGROUND: ${profile.background || 'No prior knowledge'}
TIME AVAILABLE: ${profile.hoursPerWeek} hours/week
TIMELINE: ${profile.timeline}
LEARNING STYLE: ${profile.learningStyle}
RESOURCE PREFERENCE: ${profile.resourceTypes}
MOTIVATION: ${profile.motivation}
CURRENT SITUATION: ${profile.constraints}

Instructions:
- Break the roadmap into logical phases (4-7 phases depending on timeline)
- Each phase targets the user's specific skill level and time constraints
- Include REAL, CLICKABLE YouTube video links (format: https://www.youtube.com/watch?v=REAL_ID) and blog/documentation links that are actually relevant to the topic
- Be specific and avoid generic advice
- Optimize for the user's available hours (${profile.hoursPerWeek} hrs/week)
- If ${profile.timeline} is short, focus only on high-leverage skills

Output STRICTLY valid JSON (no markdown, no explanation, only JSON):
{
  "overview": "A 2-3 sentence personalized learning strategy summary mentioning their specific goal, timeline and constraints",
  "steps": [
    {
      "title": "Phase name",
      "why": "Why this phase matters for their specific goal",
      "description": "What they'll learn and accomplish in this phase",
      "tasks": ["specific topic 1", "specific topic 2", "specific topic 3", "specific topic 4"],
      "milestone": "Concrete measurable outcome at end of this phase",
      "resources": [
        { "title": "Resource Title", "url": "https://...", "type": "youtube" },
        { "title": "Resource Title", "url": "https://...", "type": "blog" },
        { "title": "Resource Title", "url": "https://...", "type": "course" }
      ]
    }
  ],
  "masterChecklist": [
    "Checklist item 1 - specific skill or deliverable",
    "Checklist item 2",
    "Checklist item 3",
    "Checklist item 4",
    "Checklist item 5"
  ],
  "risks": "Key risks for this specific person and how to avoid them (2-3 sentences)"
}`

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000
    })

    const raw = chatCompletion.choices[0].message.content || '{}'
    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('generate-roadmap error:', error)
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 })
  }
}
