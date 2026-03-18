import { NextResponse } from 'next/server';
import { geminiModel, safeGeminiCall } from '@/lib/gemini';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { messages, context, level } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            // Return mock response if no API key is set
            return NextResponse.json({
                role: 'assistant',
                content: `*(Mock Response - API Key Missing)*\n\nI see you're asking about **${context || 'your A/L studies'}** at the **${level || 'Beginner'}** level. To make this AI functional, please ensure GEMINI_API_KEY is properly set.`
            });
        }

        const userId = req.headers.get('x-user-id'); // Read from custom header if passed from client
        if (userId) {
            const userDoc = await adminDb.collection('users').doc(userId).get();
            const plan = userDoc.data()?.plan || 'free';
            if (plan === 'free') {
                const today = new Date().toISOString().split('T')[0];
                const trackRef = adminDb.collection('usage').doc(`${userId}_${today}`);
                const trackDoc = await trackRef.get();
                const count = trackDoc.exists ? (trackDoc.data()?.chatCount || 0) : 0;

                if (count >= 10) {
                    return NextResponse.json({
                        role: 'assistant',
                        content: `**Daily Limit Reached! 🛑**\n\nYou've used your 10 free AI Tutor messages for today. \n\nUpgrade to the **Basic** plan for unlimited, personalized AI tutoring on every problem!`
                    });
                }
                await trackRef.set({ chatCount: count + 1 }, { merge: true });
            }
        }

        // Map openai role format to Gemini's user/model format
        const geminiHistory = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const lastMessage = messages[messages.length - 1];

        // Ensure we supply the dynamic context as part of the initial generation config,
        // or just append it safely to the chat logic.
        // Wait, the Master Prompt says:
        // CURRENT CONTEXT: Subject: {subject}, Unit: {unit}, Lesson: {lesson}, Mastery: {mastery}, Tier: {tier}
        // I will dynamically inject this context into the last message or as a system instruction override if supported,
        // but since systemInstruction is built into `geminiModel`, I will prepend context to the first user message invisibly.

        const contextString = `\n\n[SYSTEM CONTEXT INJECTION - DO NOT REPLY TO THIS PART, JUST USE IT FOR CONTEXT: Student is currently studying: ${context || 'General topic'} at level ${level || 'Intermediate'}]`;
        const finalMessage = lastMessage.content + contextString;

        // Start chat with history
        const chat = geminiModel.startChat({
            history: geminiHistory,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1500, // Master prompt says 1500
            }
        });

        // Use the safe wrapper to handle 429 scaling/limits
        const responseText = await safeGeminiCall(async () => {
            const result = await chat.sendMessage(finalMessage);
            return result.response.text();
        });

        return NextResponse.json({
            role: 'assistant',
            content: responseText
        });
    } catch (error: any) {
        console.error("Gemini AI Error:", error);
        return NextResponse.json(
            { error: error.message || 'An error occurred during AI generation' },
            { status: 500 }
        );
    }
}
