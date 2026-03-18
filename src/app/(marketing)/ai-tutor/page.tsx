'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BrainCircuit, Loader2, MessageSquare, Sparkles } from 'lucide-react';

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
    if (!prompt.trim() || loading || limitReached) return;

    setLoading(true);
    setError(null);
    setLastPrompt(prompt);

    const nextMessages = [...messages, { role: 'user' as const, content: prompt }];
    setMessages(nextMessages);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          context: 'Public AI tutor marketing demo',
          level: 'A/L Student',
        }),
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
    } catch (fetchError) {
      setMessages((current) => current.slice(0, -1));
      setError(fetchError instanceof Error ? fetchError.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 pt-32 grid-bg">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-full max-w-5xl -translate-x-1/2 rounded-full bg-purple-500/10 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm font-medium uppercase tracking-widest text-purple-400"
          >
            <BrainCircuit className="h-4 w-4" /> Your 24/7 personal teacher
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            Meet the Most Advanced <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              AI Tutor for A/Ls
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-slate-400"
          >
            Ask a real question, get a real guided answer, and see how the tutor handles Sri Lankan A/L science topics before you create an account.
          </motion.p>
        </div>

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

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b101a] shadow-2xl">
            <div className="border-b border-white/10 bg-white/5 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">Try the AI Tutor - 3 free questions</h2>
                  <p className="text-sm text-slate-400">Powered by the same tutoring system used inside the app.</p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
                  Questions remaining: {questionsRemaining}
                </span>
              </div>
            </div>

            <div className="relative p-5">
              <div className="max-h-[430px] space-y-4 overflow-y-auto pr-1">
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={[
                        'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                        message.role === 'user'
                          ? 'rounded-tr-sm bg-indigo-600 text-white'
                          : 'rounded-tl-sm border border-white/10 bg-white/5 text-slate-200',
                      ].join(' ')}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {loading ? (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-300" />
                      Thinking through your question...
                    </div>
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                    <p>{error}</p>
                    {lastPrompt ? (
                      <button
                        type="button"
                        onClick={() => askQuestion(lastPrompt)}
                        className="mt-3 rounded-lg bg-white/10 px-3 py-2 font-medium text-white hover:bg-white/15"
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
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
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
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type your question here..."
                    disabled={loading || limitReached}
                    className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading || limitReached || !input.trim()}
                    className="h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 font-semibold text-white transition hover:from-purple-600 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Ask
                  </button>
                </form>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <Link href="/auth/signup" className="font-semibold text-indigo-300 hover:text-indigo-200">
                    Sign up for unlimited access
                  </Link>
                  .
                </div>
              </div>

              {limitReached ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#080c14]/85 p-6 backdrop-blur-sm">
                  <div className="max-w-md rounded-3xl border border-white/10 bg-[#0b101a] p-6 text-center shadow-2xl">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Demo limit reached</h3>
                    <p className="mt-3 text-sm text-slate-400">
                      You used all 3 free public questions. Create an account to keep chatting with the full ICONIC tutor.
                    </p>
                    <Link href="/auth/signup">
                      <button className="mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3 font-semibold text-white hover:from-purple-600 hover:to-indigo-700">
                        Sign up for unlimited access
                      </button>
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-white/5 bg-[#0b101a] p-8 transition-colors hover:border-indigo-500/30"
    >
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
        <MessageSquare className="h-5 w-5 text-indigo-300" />
      </div>
      <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </motion.div>
  );
}
