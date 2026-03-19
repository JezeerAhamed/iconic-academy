import { NextRequest, NextResponse } from 'next/server';
import { geminiModel, safeGeminiCall } from '@/lib/gemini';
import { adminDb } from '@/lib/firebase-admin';
import { sanitiseInput } from '@/lib/sanitise';
import { withSecurity } from '@/lib/with-security';

export const dynamic = 'force-dynamic';

interface ChatMessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function normaliseMessage(entry: unknown): ChatMessagePayload | null {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const role = typeof (entry as ChatMessagePayload).role === 'string'
    ? (entry as ChatMessagePayload).role
    : '';
  const content = typeof (entry as ChatMessagePayload).content === 'string'
    ? sanitiseInput((entry as ChatMessagePayload).content, { maxLength: 1200 })
    : '';

  if (!role || !content) {
    return null;
  }

  return {
    role: role as ChatMessagePayload['role'],
    content,
  };
}

function normalizeMessages(body: Record<string, unknown>) {
  const directMessage = typeof body.message === 'string'
    ? sanitiseInput(body.message, { maxLength: 1200 })
    : '';
  const history = Array.isArray(body.history) ? body.history : [];
  const fallbackMessages = Array.isArray(body.messages) ? body.messages : [];

  if (directMessage) {
    return [
      ...history.map(normaliseMessage).filter((entry): entry is ChatMessagePayload => Boolean(entry)),
      {
        role: 'user',
        content: directMessage,
      } satisfies ChatMessagePayload,
    ];
  }

  return fallbackMessages
    .map(normaliseMessage)
    .filter((entry): entry is ChatMessagePayload => Boolean(entry));
}

function buildAssistantPayload(content: string) {
  const safeContent = sanitiseInput(content, { maxLength: 6000, stripHtml: false });

  return {
    role: 'assistant',
    content: safeContent,
    message: safeContent,
    response: safeContent,
  };
}

export const POST = withSecurity(async (request: NextRequest) => {
  const body = (await request.json()) as Record<string, unknown>;
  const subject = typeof body.subject === 'string' ? sanitiseInput(body.subject, { maxLength: 120 }) : undefined;
  const context = typeof body.context === 'string' ? sanitiseInput(body.context, { maxLength: 240 }) : subject;
  const level = typeof body.level === 'string' ? sanitiseInput(body.level, { maxLength: 80 }) : 'Intermediate';
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
    request.headers.get('x-user-id') ||
    (typeof body.userId === 'string' ? sanitiseInput(body.userId, { maxLength: 128 }) : null);

  if (userId) {
    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const plan = sanitiseInput(String(userDoc.data()?.plan || 'free'), { maxLength: 32 });

      if (plan === 'free') {
        const today = new Date().toISOString().split('T')[0];
        const trackRef = adminDb.collection('usage').doc(`${userId}_${today}`);
        const trackDoc = await trackRef.get();
        const count = trackDoc.exists ? Number(trackDoc.data()?.chatCount || 0) : 0;

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
});
