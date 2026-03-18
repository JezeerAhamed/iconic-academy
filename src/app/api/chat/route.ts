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

        const systemPrompt = `You are the ultimate Sri Lankan A/L (Advanced Level) expert tutor for ICONIC ACADEMY.
Your goal is to help students master their subjects (Physics, Chemistry, Biology, Combined Maths).
Current student context: ${context ? `They are currently studying: ${context}` : 'General study query'}.
Student level: ${level || 'Intermediate'}.

Rules:
1. Be encouraging, precise, and use A/L specific terminology.
2. If the student is a 'Beginner', explain concepts simply with real-world analogies.
3. If they are 'Advanced', challenge them and refer to past paper patterns.
4. Use Markdown formatting (bolding, lists, code blocks for math) to make answers readable.
5. Do NOT just give direct answers to homework. Guide them to the solution structurally.
`;

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
