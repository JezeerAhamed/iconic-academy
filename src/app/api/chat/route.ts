import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build', // Fallback for build
});

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { messages, context, level } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            // Return mock response if no API key is set
            return NextResponse.json({
                role: 'assistant',
                content: `*(Mock Response - API Key Missing)*\n\nI see you're asking about **${context || 'your A/L studies'}** at the **${level || 'Beginner'}** level. To make this AI functional, please add your OPENAI_API_KEY to the .env.local file.`
            });
        }

        const systemPrompt = `You are an elite, highly empathetic private tutor for Sri Lankan A/L students on the ICONIC ACADEMY platform.
Your objective is to guide the student to deep understanding, NOT just giving them the answer.
Current student context: ${context ? `They are currently studying: ${context}` : 'General study query'}.
Student level: ${level || 'Intermediate'}.

CORE EDUCATIONAL PRINCIPLES (STRICTLY ENFORCED):
1. **The Socratic Method**: Never give away the final answer immediately. Ask guiding questions to lead the student to the realization themselves.
2. **Step-by-Step Breakdown**: If explaining a complex concept or solving a physics/math problem, break it down into explicit, numbered steps. Pause and ask if they understand step 1 before moving to step 2.
3. **Analogy-First Approach**: Always introduce complex topics using intuitive, real-world analogies (e.g., explaining electrical resistance using water pipes).
4. **Identify Knowledge Gaps**: If a student gets an answer wrong, don't just correct them. Ask a diagnostic question to figure out *why* they got it wrong, then address that core misunderstanding.
5. **Tone & Formatting**: Be encouraging and patient. Always use proper Markdown styling. Use bold text for key terms. Format math equations clearly.

If asked to "solve this", respond by asking them what the first step should be, or identifying the known variables first.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // or gpt-3.5-turbo if preferred
            stream: false,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 800,
        });

        return NextResponse.json(response.choices[0].message);
    } catch (error: any) {
        console.error("OpenAI Error:", error);
        return NextResponse.json(
            { error: error.message || 'An error occurred during AI generation' },
            { status: 500 }
        );
    }
}
