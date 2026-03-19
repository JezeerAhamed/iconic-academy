'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  MapPinned,
  Play,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative w-full bg-cblue-25">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-0" />

        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="hidden"
        />
      </div>

      <div className="c-container relative z-10 grid grid-cols-1 items-center gap-12 py-16 md:grid-cols-2 md:py-20">
        <div className="flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex cursor-default items-center gap-3 rounded-full border border-cgray-200 bg-white px-4 py-2 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cblue-25">
              <MapPinned className="h-3.5 w-3.5 text-cblue-500" />
            </div>
            <div className="pr-2 text-sm font-semibold text-cgray-700">
              Built specifically for the Sri Lankan A/L syllabus
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl md:text-5xl font-bold text-cgray-900 leading-tight max-w-xl"
          >
            <span className="text-cgray-900">From Confused to </span>
            <span className="block text-cgray-900 sm:inline">
              A Grade
            </span>
            <br className="hidden sm:block" />
            <span className="mt-2 block text-4xl font-bold text-cgray-900 sm:text-5xl">
              With AI-Powered Learning
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-cgray-700 mt-4 max-w-lg leading-relaxed"
          >
            Physics. Chemistry. Biology. Combined Maths.
            <br className="hidden sm:block" />
            Structured lessons, a <strong className="font-semibold text-cgray-900">personal 24/7 AI tutor</strong>, and
            past-paper engines designed exclusively for Sri Lankan students.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-3 mt-8 flex-col sm:flex-row"
          >
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="btn-primary w-full sm:w-auto"
              >
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/subjects" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="btn-secondary w-full sm:w-auto"
              >
                Explore Subjects
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="relative w-full max-w-sm md:ml-auto"
        >
          <div className="c-card p-4 max-w-sm">
            <div className="relative flex min-h-[360px] overflow-hidden rounded-lg border border-cgray-200 bg-white">
              <div className="hidden w-52 flex-col gap-6 border-r border-cgray-200 bg-cgray-50 p-5 lg:flex">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-cblue-25">
                    <Sparkles className="h-4 w-4 text-cblue-500" />
                  </div>
                  <div className="h-4 w-24 rounded bg-cgray-200" />
                </div>
                <div className="mt-2 space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className={`flex h-10 items-center gap-3 rounded px-3 ${
                        item === 2 ? 'border border-cblue-100 bg-cblue-25' : 'bg-white'
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-sm ${item === 2 ? 'bg-cblue-500' : 'bg-cgray-200'}`} />
                      <div className={`h-2 rounded-full ${item === 2 ? 'w-20 bg-cblue-300' : 'w-24 bg-cgray-200'}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex flex-1 flex-col bg-white p-5">
                <div className="mb-6 flex items-center justify-between border-b border-cgray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="h-5 w-5 text-cblue-500" />
                    <div className="h-4 w-28 rounded bg-cgray-200" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-cgray-100" />
                    <div className="h-8 w-8 rounded-full bg-cblue-25 border border-cblue-100" />
                  </div>
                </div>

                <div className="flex-1 space-y-5">
                  <div className="flex flex-row-reverse gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-cgray-200" />
                    <div className="max-w-[78%] rounded-2xl rounded-tr-md bg-cblue-500 p-4 text-white shadow-none">
                      <p className="text-sm leading-6">
                        I&apos;m stuck on this past paper question. How do I resolve the tension components in equilibrium?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cblue-25 border border-cblue-100">
                      <BrainCircuit className="h-4 w-4 text-cblue-500" />
                    </div>
                    <div className="w-[82%] rounded-2xl rounded-tl-md border border-cgray-200 bg-cgray-50 p-4 text-cgray-700 shadow-none">
                      <p className="mb-3 text-sm font-semibold text-cgray-900">Great question! Let&apos;s break it down step by step:</p>

                      <div className="mb-4 space-y-2">
                        <div className="h-2 w-[90%] rounded-full bg-cgray-200" />
                        <div className="h-2 w-[75%] rounded-full bg-cgray-200" />
                        <div className="h-2 w-[85%] rounded-full bg-cgray-200" />
                      </div>

                      <div className="flex items-center gap-3 rounded border border-cgray-200 bg-white p-3">
                        <Play className="h-5 w-5 text-cblue-500" />
                        <div className="flex-1">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cgray-200">
                            <div className="h-full w-1/3 rounded-full bg-cblue-500" />
                          </div>
                        </div>
                        <span className="font-mono text-xs text-cgray-500">0:45</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-5 right-5 flex items-center gap-3 rounded border border-cgray-200 bg-white px-3 py-2 shadow-card">
                  <CheckCircle2 className="h-5 w-5 text-cgreen-500" />
                  <div>
                    <div className="text-sm font-bold text-cgray-900">+50 XP earned</div>
                    <div className="text-xs text-cgray-500">Concept mastered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
