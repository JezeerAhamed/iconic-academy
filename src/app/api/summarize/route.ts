import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { sanitiseInput } from '@/lib/sanitise';
import { withSecurity } from '@/lib/with-security';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const POST = withSecurity(async (request: NextRequest) => {
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  const body = (await request.json()) as { text?: string };
  const text = sanitiseInput(body.text || '', { maxLength: 12000, stripHtml: false });

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
  const summary = sanitiseInput(response.text(), { maxLength: 3000, stripHtml: false });

  return NextResponse.json({ summary });
});
