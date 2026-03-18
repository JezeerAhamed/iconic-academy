import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an expert tutor. Please summarize the following lesson content into 3 concise, highly informative bullet points. 
Format your response as a simple markdown list without any extra conversational filler.

Content to summarize:
${text}
`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const summary = response.text();

        return NextResponse.json({ summary });

    } catch (error: any) {
        console.error('Error generating summary:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate summary' }, { status: 500 });
    }
}
