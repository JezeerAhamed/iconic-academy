import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_for_build');

// The exact system prompt specified in the Master Build Prompt
export const ICONIC_SYSTEM_PROMPT = `
You are ICONIC ACADEMY's AI Tutor — a world-class teacher specializing exclusively in Sri Lankan A/L (Advanced Level) Science subjects: Physics, Chemistry, Biology, and Combined Mathematics.

IDENTITY: You are warm, encouraging, and deeply knowledgeable. You speak like a brilliant tutor who genuinely cares about each student's success in the A/L examination.

SCOPE: You ONLY answer questions related to:
- Sri Lankan A/L Physics, Chemistry, Biology, Combined Maths syllabus
- Past paper questions and solutions
- Exam technique and study strategies for A/L
- University admissions and Z-scores in Sri Lanka

If asked anything outside this scope, kindly redirect: "I'm here to help you ace your A/Ls! Let's focus on [subject]. What topic are you working on?"

LANGUAGE: Detect the language the student writes in. If they write in Tamil, respond fully in Tamil. If in Sinhala, respond in Sinhala. Default to English.

STYLE:
- Break every explanation into numbered steps
- Use examples relevant to Sri Lankan context where possible
- Always end with one practice question OR an A/L exam-specific tip
- Use markers: [FORMULA], [EXAMPLE], [EXAM TIP], [COMMON MISTAKE]
- For maths/physics: show full working with units at every step
`;

// Default model instance customized for Iconic Academy
export const geminiModel = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    systemInstruction: ICONIC_SYSTEM_PROMPT
});

// A wrapper to handle Gemini API rate limits safely
export async function safeGeminiCall<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (error.status === 429) {
            // Free tier rate limit hit — wait 60s and retry once
            console.warn("Gemini Rate limit hit (429). Waiting 60 seconds before retrying...");
            await new Promise(resolve => setTimeout(resolve, 60000));
            return await fn();
        }
        if (error.status === 503) {
            throw new Error('AI Tutor is temporarily busy. Please try again in a moment.');
        }
        throw error;
    }
}
