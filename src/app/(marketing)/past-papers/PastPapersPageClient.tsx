'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, Clock, FileText, Target, XCircle } from 'lucide-react';

const sampleQuestion = {
  paper: '2022 A/L Physics',
  prompt:
    'A ball is thrown vertically upward with initial velocity 20 m s^-1. What is the maximum height reached? (g = 10 m s^-2)',
  options: [
    { id: 'a', label: 'A', text: '10 m' },
    { id: 'b', label: 'B', text: '20 m' },
    { id: 'c', label: 'C', text: '40 m' },
    { id: 'd', label: 'D', text: '80 m' },
  ],
  correctId: 'b',
  explanation:
    'Use v^2 = u^2 + 2as at the top of the motion where v = 0. So 0 = 20^2 + 2(-10)h, which gives h = 20 m.',
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
    <div className="min-h-screen bg-white pt-16">
      <section className="border-b border-cgray-200 bg-cgray-50 py-16">
        <div className="c-container">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full bg-cblue-50 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-cblue-500"
              >
                <Target className="h-4 w-4" /> Real exam practice
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 text-4xl font-bold leading-tight text-cgray-900 md:text-5xl"
              >
                Past Papers That Feel Like the Real Exam
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-10 text-lg leading-relaxed text-cgray-600"
              >
                Practice past paper questions with marking logic, AI explanations, and paper-style
                progress tracking built for Sri Lankan A/L students.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Link href="/auth/signup" className="btn-primary">
                  Start Practicing Free
                </Link>
                <Link href="/pricing" className="btn-secondary">
                  View Plans
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="c-card p-6"
            >
              <div className="mb-6 flex items-center justify-between border-b border-cgray-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cblue-50 text-cblue-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-cgray-900">Paper Preview</h4>
                    <p className="text-xs text-cgray-500">MCQ, structured, essay support</p>
                  </div>
                </div>
                <span className="c-badge-blue normal-case tracking-normal">AI review</span>
              </div>

              <div className="space-y-4 rounded border border-cgray-200 bg-cgray-50 p-4">
                <p className="text-sm text-cgray-700">
                  Filter by year, subject, and topic, then move from question practice to guided
                  solutions without leaving the paper flow.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs text-cgray-500">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded border border-cgray-200 bg-white p-3">
                      <div className="font-semibold text-cgray-900">{item.value}</div>
                      <div className="mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b border-cgray-200 bg-white py-16">
        <div className="c-container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-cgray-900 md:text-4xl">
              Try a sample question. No login required.
            </h2>
            <p className="mt-3 text-base text-cgray-600">
              Answer one real-style question, get instant feedback, then unlock the full paper library
              with a free account.
            </p>
          </div>

          <div className="c-card mx-auto max-w-3xl p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-cblue-500">{sampleQuestion.paper} - MCQ sample</p>
                <h3 className="mt-1 text-2xl font-bold text-cgray-900">Live Demo</h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-cgray-50 px-3 py-1 text-xs text-cgray-500">
                <Clock className="h-3.5 w-3.5" />
                Instant explanation
              </span>
            </div>

            <div className="rounded border border-cgray-200 bg-cgray-50 p-5">
              <p className="text-lg leading-relaxed text-cgray-900">{sampleQuestion.prompt}</p>

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
                        'flex w-full items-center gap-3 rounded border px-4 py-4 text-left transition',
                        isAnswer
                          ? 'border-cgreen-500/20 bg-cgreen-50 text-cgreen-600'
                          : isWrongSelection
                            ? 'border-cred-500/20 bg-cred-50 text-cred-600'
                            : isSelected
                              ? 'border-cblue-500 bg-cblue-25 text-cblue-600'
                              : 'border-cgray-200 bg-white text-cgray-700 hover:bg-cgray-50',
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
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit Answer
                </button>
                <Link href="/auth/signup" className="text-sm font-semibold text-cblue-500 hover:text-cblue-600">
                  See full 2022 Physics paper. Requires free account
                </Link>
              </div>

              {submitted ? (
                <div className="mt-6 rounded border border-cgray-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-cgreen-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 text-cred-500" />
                    )}
                    <div>
                      <p className={`font-semibold ${isCorrect ? 'text-cgreen-600' : 'text-cred-600'}`}>
                        {isCorrect ? 'Correct.' : 'Not quite.'} The maximum height is 20 m.
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-cgray-600">{sampleQuestion.explanation}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded border border-cgreen-500/20 bg-cgreen-50 p-4">
                    <p className="text-sm text-cgreen-600">
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
        </div>
      </section>

      <section className="border-y border-cgray-200 bg-cgray-50 py-16">
        <div className="c-container">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((item) => (
              <StatBox key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-4xl font-bold text-cgray-900">{value}</div>
      <p className="max-w-[150px] text-sm leading-snug text-cgray-500">{label}</p>
    </div>
  );
}
