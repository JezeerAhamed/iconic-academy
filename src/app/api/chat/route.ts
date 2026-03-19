import { NextResponse } from 'next/server';
import { geminiModel, safeGeminiCall } from '@/lib/gemini';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

interface ChatMessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function normalizeMessages(body: Record<string, unknown>) {
  const directMessage = typeof body.message === 'string' ? body.message.trim() : '';
  const history = Array.isArray(body.history) ? body.history : [];
  const fallbackMessages = Array.isArray(body.messages) ? body.messages : [];

  if (directMessage) {
    return [
      ...history.filter(
        (entry): entry is ChatMessagePayload =>
          Boolean(entry) &&
          typeof entry === 'object' &&
          typeof (entry as ChatMessagePayload).role === 'string' &&
          typeof (entry as ChatMessagePayload).content === 'string'
      ),
      {
        role: 'user',
        content: directMessage,
      } satisfies ChatMessagePayload,
    ];
  }

  return fallbackMessages.filter(
    (entry): entry is ChatMessagePayload =>
      Boolean(entry) &&
      typeof entry === 'object' &&
      typeof (entry as ChatMessagePayload).role === 'string' &&
      typeof (entry as ChatMessagePayload).content === 'string'
  );
}

function buildAssistantPayload(content: string) {
  return {
    role: 'assistant',
    content,
    message: content,
    response: content,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const subject = typeof body.subject === 'string' ? body.subject : undefined;
    const context = typeof body.context === 'string' ? body.context : subject;
    const level = typeof body.level === 'string' ? body.level : 'Intermediate';
    const messages = normalizeMessages(body);

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'A message is required to start the chat.' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      const mockContent = `*(Mock Response - API Key Missing)*\n\nI see you're asking about **${context || 'your A/L studies'}** at the **${level || 'Beginner'}** level. To make this AI functional, please ensure GEMINI_API_KEY is properly set.`;
      return NextResponse.json(buildAssistantPayload(mockContent));
    }

    const userId =
      req.headers.get('x-user-id') ||
      (typeof body.userId === 'string' ? body.userId : null);

    if (userId) {
      try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const plan = userDoc.data()?.plan || 'free';

        if (plan === 'free') {
          const today = new Date().toISOString().split('T')[0];
          const trackRef = adminDb.collection('usage').doc(`${userId}_${today}`);
          const trackDoc = await trackRef.get();
          const count = trackDoc.exists ? (trackDoc.data()?.chatCount || 0) : 0;

          if (count >= 10) {
            const limitContent = `**Daily Limit Reached!**\n\nYou've used your 10 free AI Tutor messages for today.\n\nUpgrade to **Basic** for unlimited AI tutoring!`;
            return NextResponse.json(buildAssistantPayload(limitContent));
          }

          await trackRef.set({ chatCount: count + 1 }, { merge: true });
        }
      } catch (usageErr) {
        console.warn('[chat] Usage tracking skipped:', (usageErr as Error).message);
      }
    }

    let validMessages = messages.slice(0, -1);
    if (validMessages.length > 0 && validMessages[0].role !== 'user') {
      validMessages = validMessages.slice(1);
    }

    const geminiHistory = validMessages.map((message) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const contextString = `\n\n[SYSTEM CONTEXT INJECTION - DO NOT REPLY TO THIS PART, JUST USE IT FOR CONTEXT: Student is currently studying: ${context || 'General topic'} at level ${level}]`;
    const finalMessage = `${lastMessage.content}${contextString}`;

    const chat = geminiModel.startChat({
      history: geminiHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    });

    const responseText = await safeGeminiCall(async () => {
      const result = await chat.sendMessage(finalMessage);
      return result.response.text();
    });

    return NextResponse.json(buildAssistantPayload(responseText));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred during AI generation';
    console.error('Gemini AI Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
