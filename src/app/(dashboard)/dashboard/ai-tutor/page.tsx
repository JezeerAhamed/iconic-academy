'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { BrainCircuit, Send, Sparkles } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SubjectOption = 'Physics' | 'Chemistry' | 'Biology' | 'Maths';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUBJECT_OPTIONS: SubjectOption[] = ['Physics', 'Chemistry', 'Biology', 'Maths'];
const STARTER_QUESTIONS = [
  "Explain Newton's laws of motion",
  'Help me with organic chemistry mechanisms',
  'How does photosynthesis work?',
  'Solve a quadratic equation step by step',
];

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <Card className="border-white/10 bg-[#0b101a] py-6">
        <CardContent className="space-y-4">
          <div className="h-10 w-56 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-white/5" />
          <div className="h-12 w-56 animate-pulse rounded-2xl bg-white/[0.04]" />
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#0b101a] py-6">
        <CardContent className="space-y-4">
          <div className="ml-auto h-24 w-2/3 animate-pulse rounded-3xl bg-violet-500/10" />
          <div className="h-24 w-2/3 animate-pulse rounded-3xl bg-white/[0.04]" />
          <div className="h-12 w-full animate-pulse rounded-2xl bg-white/[0.04]" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AITutorPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectOption>('Physics');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        const errorCode =
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          typeof (error as { code?: unknown }).code === 'string'
            ? (error as { code: string }).code
            : 'unknown';
        console.warn('Auth check:', errorCode);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isLoading, messages]);

  const sendMessage = async (userMessage: string) => {
    const trimmed = userMessage.trim();
    if (!trimmed || !user || isLoading) return;

    const timestamp = new Date();
    const historyForRequest = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: trimmed,
        timestamp,
      },
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyForRequest,
          subject: selectedSubject,
          userId: user.uid,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reach the AI tutor.');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || data.response || data.content || 'Sorry, I had trouble responding. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('AI tutor request failed', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble responding. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  if (loading) return <LoadingSkeleton />;

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="space-y-6 pb-12">
      <Card className="border-white/10 bg-[#0b101a] py-6">
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">AI Tutor</p>
              <h1 className="text-3xl font-black tracking-tight text-white">Ask questions, get guided explanations, and stay inside your subject context.</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300">
                Your AI Tutor keeps every response anchored to the subject you choose, whether you need theory help, step-by-step solving, or exam-focused clarification.
              </p>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Subject context</span>
              <select
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value as SubjectOption)}
                className="h-12 min-w-[220px] rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white outline-none transition focus:border-violet-400"
              >
                {SUBJECT_OPTIONS.map((subject) => (
                  <option key={subject} value={subject} className="bg-[#0b101a] text-white">
                    {subject}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#0b101a] py-0">
        <CardHeader className="border-b border-white/10 py-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-xl font-semibold text-white">ICONIC ACADEMY AI Tutor</CardTitle>
              <p className="text-sm text-slate-400">Currently focused on {selectedSubject}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex h-[calc(100vh-17rem)] min-h-[540px] flex-col p-0">
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="w-full max-w-3xl space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15 text-violet-300">
                    <BrainCircuit className="h-8 w-8" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-2xl font-black text-white">Hi! I&apos;m your ICONIC ACADEMY AI Tutor.</h2>
                    <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-300">
                      Ask me anything about A/L Physics, Chemistry, Biology or Combined Maths.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {STARTER_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => void sendMessage(question)}
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left text-sm font-medium text-slate-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                      >
                        {question}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-slate-500">
                    Need something else? Type your own question below and the AI Tutor will respond in the selected subject context.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${message.timestamp.getTime()}-${index}`}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                      <div
                        className={[
                          'rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm',
                          message.role === 'user'
                            ? 'rounded-br-lg bg-violet-600 text-white'
                            : 'rounded-bl-lg border border-white/10 bg-white/[0.05] text-slate-100',
                        ].join(' ')}
                      >
                        {message.content}
                      </div>
                      <span className="px-1 text-xs text-slate-500">{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                ))}

                {isLoading ? (
                  <div className="flex justify-start">
                    <div className="flex max-w-[85%] flex-col gap-2">
                      <div className="rounded-3xl rounded-bl-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-100">
                        <div className="flex items-center gap-3">
                          <span>AI is thinking...</span>
                          <div className="flex items-center gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.15s' }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.3s' }} />
                          </div>
                        </div>
                      </div>
                      <span className="px-1 text-xs text-slate-500">{formatTime(new Date())}</span>
                    </div>
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-black/20 p-4 sm:p-5">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask anything about A/L Physics, Chemistry, Biology or Maths..."
                className="h-12 flex-1 border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:border-violet-400"
                disabled={isLoading}
              />

              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-12 min-w-[120px] bg-violet-600 text-white hover:bg-violet-500"
              >
                <span>Send</span>
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>Responses are tailored to {selectedSubject}.</span>
              <Link href="/dashboard/subjects" className="inline-flex items-center gap-1 text-slate-400 transition hover:text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Review your subjects
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
