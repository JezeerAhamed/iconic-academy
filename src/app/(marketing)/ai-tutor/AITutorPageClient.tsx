'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BrainCircuit, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { getSecureJsonHeaders } from '@/lib/client-security';
import { sanitiseInput } from '@/lib/sanitise';

type DemoMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const STORAGE_KEY = 'iconic-public-ai-demo-used';
const MAX_PUBLIC_QUESTIONS = 3;
const starterMessage =
  'Hi! Ask me anything about A/L Physics, Chemistry, Biology, or Combined Maths. I will explain it step by step.';

export default function AITutorPage() {
  const [messages, setMessages] = useState<DemoMessage[]>([{ role: 'assistant', content: starterMessage }]);
  const [input, setInput] = useState('');
  const [usedQuestions, setUsedQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? Number(stored) : 0;
    setUsedQuestions(Number.isFinite(parsed) ? parsed : 0);
  }, []);

  const questionsRemaining = Math.max(0, MAX_PUBLIC_QUESTIONS - usedQuestions);
  const limitReached = questionsRemaining === 0;

  const quickPrompts = useMemo(
    () => [
      'Explain Bernoulli principle with a real-life example.',
      'How do I balance a redox equation step by step?',
      'What is the derivative of sin x and why?',
    ],
    []
  );

  async function askQuestion(prompt: string) {
    const safePrompt = sanitiseInput(prompt, { maxLength: 1200 });
    if (!safePrompt || loading || limitReached) return;

    setLoading(true);
    setError(null);
    setLastPrompt(safePrompt);

    const nextMessages = [...messages, { role: 'user' as const, content: safePrompt }];
    setMessages(nextMessages);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: getSecureJsonHeaders(),
        body: JSON.stringify({
          messages: nextMessages,
          context: 'Public AI tutor marketing demo',
          level: 'A/L Student',
        }),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Something went wrong while contacting the AI tutor.');
      }

      const data = (await response.json()) as { content?: string; error?: string };

      if (!data.content) {
        throw new Error(data.error || 'The AI tutor could not respond right now.');
      }

      const newUsedCount = usedQuestions + 1;
      setUsedQuestions(newUsedCount);
      window.localStorage.setItem(STORAGE_KEY, String(newUsedCount));
      setMessages((current) => [...current, { role: 'assistant', content: data.content! }]);
      setLiveAnnouncement(`AI tutor replied: ${data.content!.slice(0, 160)}`);
    } catch (fetchError) {
      setMessages((current) => current.slice(0, -1));
      setError(fetchError instanceof Error ? fetchError.message : 'Something went wrong.');
      setLiveAnnouncement('The AI tutor could not answer right now.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="border-b border-cgray-200 bg-cgray-50 py-16">
        <div className="c-container">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-cblue-50 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-cblue-500"
            >
              <BrainCircuit className="h-4 w-4" /> Your 24/7 personal teacher
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 text-4xl font-bold leading-tight text-cgray-900 md:text-5xl"
            >
              Meet the Most Advanced AI Tutor for A/Ls
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto max-w-2xl text-lg leading-relaxed text-cgray-600"
            >
              Ask a real question, get a real guided answer, and see how the tutor handles Sri Lankan
              A/L science topics before you create an account.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="border-b border-cgray-200 bg-white py-16">
        <div className="c-container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <FeatureCard
                title="Socratic method"
                description="The tutor pushes toward understanding with guided reasoning instead of shortcut answers."
              />
              <FeatureCard
                title="Tamil and English support"
                description="Write in Tamil to get a Tamil response. Stay in English when that is your preferred study language."
              />
              <FeatureCard
                title="Exam-focused explanations"
                description="Physics, Chemistry, Biology, and Combined Maths are explained with formulas, working, and exam tips."
              />
            </div>

            <div className="c-card relative overflow-hidden">
              <div className="border-b border-cgray-200 bg-white px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-cgray-900">Try the AI Tutor</h2>
                    <p className="text-sm text-cgray-600">Powered by the same tutoring system used inside the app.</p>
                  </div>
                  <span className="c-badge-blue normal-case tracking-normal">
                    Questions remaining: {questionsRemaining}
                  </span>
                </div>
              </div>

              <div className="relative p-5">
                <div className="sr-only" aria-live="polite" aria-atomic="false">
                  {liveAnnouncement}
                </div>

                <div
                  role="log"
                  aria-live="polite"
                  aria-relevant="additions text"
                  aria-atomic="false"
                  className="max-h-[430px] space-y-4 overflow-y-auto rounded bg-cgray-50 p-4"
                >
                  {messages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={[
                          'max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed',
                          message.role === 'user'
                            ? 'bg-cblue-500 text-white'
                            : 'border border-cgray-200 bg-white text-cgray-900',
                        ].join(' ')}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {loading ? (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-lg border border-cgray-200 bg-white px-4 py-3 text-sm text-cgray-600">
                        <Loader2 className="h-4 w-4 animate-spin text-cblue-500" />
                        Thinking through your question...
                      </div>
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded border border-cred-500/20 bg-cred-50 p-4 text-sm text-cred-600">
                      <p>{error}</p>
                      {lastPrompt ? (
                        <button
                          type="button"
                          onClick={() => askQuestion(lastPrompt)}
                          className="btn-secondary btn-sm mt-3"
                        >
                          Try again
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => askQuestion(prompt)}
                        disabled={loading || limitReached}
                        className="rounded-full border border-cgray-200 bg-white px-3 py-2 text-xs font-semibold text-cgray-700 transition hover:bg-cgray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      askQuestion(input);
                    }}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(event) => setInput(sanitiseInput(event.target.value, { maxLength: 1200 }))}
                      placeholder="Type your question here..."
                      disabled={loading || limitReached}
                      className="c-input h-12 flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading || limitReached || !input.trim()}
                      className="btn-primary h-12 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Ask
                    </button>
                  </form>

                  <div className="rounded border border-cgray-200 bg-cgray-50 p-4 text-sm text-cgray-600">
                    <Link href="/auth/signup" className="font-semibold text-cblue-500 hover:text-cblue-600">
                      Sign up for unlimited access
                    </Link>
                    .
                  </div>
                </div>

                {limitReached ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/85 p-6 backdrop-blur-sm">
                    <div className="c-card max-w-md p-6 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-cblue-50 text-cblue-500">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-cgray-900">Demo limit reached</h3>
                      <p className="mt-3 text-sm text-cgray-600">
                        You used all 3 free public questions. Create an account to keep chatting with the
                        full ICONIC tutor.
                      </p>
                      <Link href="/auth/signup" className="btn-primary mt-5 w-full justify-center">
                        Sign up for unlimited access
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col gap-3 p-4"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cblue-50 text-cblue-500">
        <MessageSquare className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold leading-snug text-cgray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-cgray-600">{description}</p>
    </motion.div>
  );
}
