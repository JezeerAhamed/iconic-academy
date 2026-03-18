'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, Clock, FileText, Target, XCircle } from 'lucide-react';

const sampleQuestion = {
  paper: '2022 A/L Physics',
  prompt:
    'A ball is thrown vertically upward with initial velocity 20 ms⁻¹. What is the maximum height reached? (g = 10 ms⁻²)',
  options: [
    { id: 'a', label: 'A', text: '10 m' },
    { id: 'b', label: 'B', text: '20 m' },
    { id: 'c', label: 'C', text: '40 m' },
    { id: 'd', label: 'D', text: '80 m' },
  ],
  correctId: 'b',
  explanation:
    'Use v² = u² + 2as at the top of the motion where v = 0. So 0 = 20² + 2(-10)h, which gives h = 20 m.',
};

const stats = [
  { value: '1995-2023', label: 'Years Covered' },
  { value: '4', label: 'A/L Science Subjects' },
  { value: 'MCQ + Structured + Essay', label: 'Paper Formats' },
  { value: 'AI Solutions', label: 'Step-by-Step Guidance' },
];

export default function PastPapersPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selectedOption === sampleQuestion.correctId;

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 pt-32 grid-bg">
      <div className="pointer-events-none absolute right-0 top-1/4 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 rounded-full bg-emerald-500/10 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium uppercase tracking-widest text-emerald-400"
            >
              <Target className="h-4 w-4" /> Real exam practice
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl"
            >
              Past Papers That Feel Like the Real Exam
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10 text-lg text-slate-400"
            >
              Practice past paper questions with marking logic, AI explanations, and paper-style progress tracking built for Sri Lankan A/L students.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link href="/auth/signup">
                <button className="rounded-xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-700">
                  Start Practicing Free
                </button>
              </Link>
              <Link href="/pricing">
                <button className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10">
                  View Plans
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-2xl" />
            <div className="relative rounded-3xl border border-white/10 bg-[#0b101a] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Paper Preview</h4>
                    <p className="text-xs text-slate-400">MCQ, structured, essay support</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase text-emerald-400">
                  AI review
                </span>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-sm text-slate-300">
                  Filter by year, subject, and topic, then move from question practice to guided solutions without leaving the paper flow.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-xl border border-white/5 bg-black/20 p-3">
                      <div className="font-semibold text-white">{item.value}</div>
                      <div className="mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <section className="mt-24">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-white md:text-4xl">Try a sample question - no login required</h2>
            <p className="mt-3 text-slate-400">
              Answer one real-style question, get instant feedback, then unlock the full paper library with a free account.
            </p>
          </div>

          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#0b101a] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-emerald-300">{sampleQuestion.paper} - MCQ sample</p>
                <h3 className="mt-1 text-2xl font-bold text-white">Live Demo</h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                Instant explanation
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-lg leading-relaxed text-slate-200">{sampleQuestion.prompt}</p>

              <div className="mt-6 space-y-3">
                {sampleQuestion.options.map((option) => {
                  const isSelected = selectedOption === option.id;
                  const isAnswer = submitted && option.id === sampleQuestion.correctId;
                  const isWrongSelection = submitted && isSelected && option.id !== sampleQuestion.correctId;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={submitted}
                      onClick={() => setSelectedOption(option.id)}
                      className={[
                        'flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition',
                        isAnswer
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          : isWrongSelection
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                            : isSelected
                              ? 'border-indigo-500/30 bg-indigo-500/10 text-white'
                              : 'border-white/10 bg-black/20 text-slate-300 hover:bg-white/5',
                      ].join(' ')}
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-current text-xs font-bold">
                        {option.label}
                      </span>
                      <span>{option.text}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  disabled={!selectedOption || submitted}
                  className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit Answer
                </button>
                <Link href="/auth/signup" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
                  See full 2022 Physics paper - requires free account
                </Link>
              </div>

              {submitted ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 text-rose-300" />
                    )}
                    <div>
                      <p className={`font-semibold ${isCorrect ? 'text-emerald-200' : 'text-rose-200'}`}>
                        {isCorrect ? 'Correct.' : 'Not quite.'} The maximum height is 20 m.
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{sampleQuestion.explanation}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-sm text-emerald-100">
                      Want 15,000+ more questions?{' '}
                      <Link href="/auth/signup" className="font-semibold underline underline-offset-4">
                        Create your free account
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-20 grid grid-cols-2 gap-4 border-y border-white/5 py-12 md:grid-cols-4">
          {stats.map((item) => (
            <StatBox key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 text-center">
      <div className="mb-2 text-2xl font-black text-white sm:text-3xl">{value}</div>
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}
