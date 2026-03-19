'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { BrainCircuit, Send, Sparkles } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card className="c-card py-6">
        <CardContent className="space-y-4">
          <div className="h-10 w-56 animate-pulse rounded bg-cgray-100" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-cgray-100" />
          <div className="h-12 w-56 animate-pulse rounded bg-cgray-100" />
        </CardContent>
      </Card>

      <Card className="c-card py-6">
        <CardContent className="space-y-4">
          <div className="ml-auto h-24 w-2/3 animate-pulse rounded bg-cgray-100" />
          <div className="h-24 w-2/3 animate-pulse rounded bg-cgray-100" />
          <div className="h-12 w-full animate-pulse rounded bg-cgray-100" />
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
      <Card className="c-card py-6">
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cblue-500">AI Tutor</p>
              <h1 className="text-3xl font-bold tracking-tight text-cgray-900">
                Ask questions, get guided explanations, and stay inside your subject context.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-cgray-600">
                Your AI Tutor keeps every response anchored to the subject you choose, whether you need
                theory help, step-by-step solving, or exam-focused clarification.
              </p>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cgray-500">Subject context</span>
              <select
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value as SubjectOption)}
                className="c-input h-12 min-w-[220px] bg-white"
              >
                {SUBJECT_OPTIONS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="c-card py-0">
        <CardHeader className="border-b border-cgray-200 py-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-cblue-50 text-cblue-500">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-xl font-semibold text-cgray-900">ICONIC ACADEMY AI Tutor</CardTitle>
              <p className="text-sm text-cgray-500">Currently focused on {selectedSubject}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex h-[calc(100vh-17rem)] min-h-[540px] flex-col p-0">
          <div className="flex-1 overflow-y-auto bg-cgray-50 px-4 py-5 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cgray-100">
                    <BrainCircuit className="text-2xl text-cgray-400" />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-cgray-900">
                    Hi! I&apos;m your ICONIC ACADEMY AI Tutor.
                  </h2>
                  <p className="mb-5 max-w-xl text-base text-cgray-500">
                    Ask me anything about A/L Physics, Chemistry, Biology or Combined Maths.
                  </p>
                  <div className="grid w-full max-w-3xl gap-3 md:grid-cols-2">
                    {STARTER_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => void sendMessage(question)}
                        className="rounded border border-cgray-200 bg-white px-4 py-4 text-left text-sm font-medium text-cgray-700 transition hover:border-cblue-500 hover:bg-cblue-25 hover:text-cblue-600"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                  <p className="mt-5 text-xs text-cgray-500">
                    Need something else? Type your own question below and the AI Tutor will respond in
                    the selected subject context.
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
                    <div className={`flex max-w-[85%] flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={[
                          'rounded-lg px-4 py-3 text-sm leading-6 shadow-sm',
                          message.role === 'user'
                            ? 'bg-cblue-500 text-white'
                            : 'border border-cgray-200 bg-white text-cgray-900',
                        ].join(' ')}
                      >
                        {message.content}
                      </div>
                      <span className="px-1 text-xs text-cgray-500">{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                ))}

                {isLoading ? (
                  <div className="flex justify-start">
                    <div className="flex max-w-[85%] flex-col gap-2">
                      <div className="rounded-lg border border-cgray-200 bg-white px-4 py-3 text-sm text-cgray-700">
                        <div className="flex items-center gap-3">
                          <span>AI is thinking...</span>
                          <div className="flex items-center gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-cgray-400" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-cgray-400" style={{ animationDelay: '0.15s' }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-cgray-400" style={{ animationDelay: '0.3s' }} />
                          </div>
                        </div>
                      </div>
                      <span className="px-1 text-xs text-cgray-500">{formatTime(new Date())}</span>
                    </div>
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-cgray-200 bg-white p-4 sm:p-5">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask anything about A/L Physics, Chemistry, Biology or Maths..."
                className="c-input h-12"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="btn-primary h-12 min-w-[120px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Send</span>
                <Send className="ml-2 h-4 w-4" />
              </button>
            </form>

            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-cgray-500">
              <span>Responses are tailored to {selectedSubject}.</span>
              <Link href="/dashboard/subjects" className="inline-flex items-center gap-1 text-cblue-500 transition hover:text-cblue-600">
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
