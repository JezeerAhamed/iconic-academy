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
    <section className="relative flex min-h-[100svh] flex-col items-center justify-start overflow-hidden pb-16 pt-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 top-[-10rem] h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex cursor-default items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md transition-colors hover:bg-white/10 sm:px-4"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#1a1f2e]">
            <MapPinned className="h-3.5 w-3.5 text-indigo-300" />
          </div>
          <div className="pr-2 text-xs font-medium text-slate-300 sm:text-sm">
            Built specifically for the Sri Lankan A/L syllabus
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mb-6 max-w-5xl text-[2.5rem] font-black leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-[80px]"
        >
          <span className="text-white">From Confused to </span>
          <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent sm:inline">
            A Grade
          </span>
          <br className="hidden sm:block" />
          <span className="mt-2 block text-4xl font-extrabold text-slate-300 opacity-90 sm:text-5xl md:text-6xl lg:text-[72px]">
            With AI-Powered Learning
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg font-light leading-relaxed text-slate-400 sm:text-xl"
        >
          Physics. Chemistry. Biology. Combined Maths.
          <br className="hidden sm:block" />
          Structured lessons, a <strong className="font-medium text-white">personal 24/7 AI tutor</strong>, and
          past-paper engines designed exclusively for Sri Lankan students.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row lg:mb-24"
        >
          <Link href="/auth/signup" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="h-14 w-full rounded-full border-0 bg-white px-8 text-base font-bold text-black shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-transform hover:scale-105 hover:bg-slate-100 sm:h-16 sm:w-auto sm:px-10 sm:text-lg"
            >
              Start Learning Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/subjects" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full rounded-full border-white/20 bg-transparent px-8 text-base font-medium text-white transition-colors hover:bg-white/5 sm:h-16 sm:w-auto sm:px-10 sm:text-lg"
            >
              Explore Subjects
              <ChevronRight className="ml-1 h-5 w-5 text-slate-400" />
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.4, type: 'spring', bounce: 0.3 }}
          style={{ perspective: 1200 }}
          className="relative mx-auto hidden w-full max-w-5xl md:block"
        >
          <div className="relative mx-4 flex h-[450px] transform-gpu overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#060913]/90 shadow-2xl ring-1 ring-white/5 backdrop-blur-2xl lg:mx-0">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex w-64 flex-col gap-6 border-r border-white/5 bg-black/40 p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="h-4 w-24 rounded-md bg-white/10" />
              </div>
              <div className="mt-4 space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className={`flex h-10 items-center gap-3 rounded-xl px-3 ${
                      item === 2 ? 'border border-indigo-500/20 bg-indigo-500/10' : 'bg-transparent'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded ${item === 2 ? 'bg-indigo-400' : 'bg-white/10'}`} />
                    <div className={`h-2 rounded-full ${item === 2 ? 'w-20 bg-indigo-400' : 'w-24 bg-white/10'}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex flex-1 flex-col bg-[url('/noise.svg')] bg-repeat p-8 opacity-[0.99]">
              <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="h-6 w-6 text-indigo-400" />
                  <div className="h-4 w-32 rounded-md bg-white/10" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/10" />
                  <div className="h-8 w-8 rounded-full border border-indigo-500/30 bg-indigo-500/20" />
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex flex-row-reverse gap-4">
                  <div className="h-8 w-8 shrink-0 rounded-full border border-white/10 bg-[#1a1f2e]" />
                  <div className="max-w-[70%] rounded-2xl rounded-tr-none bg-indigo-600 p-4 text-white shadow-lg">
                    <p className="text-sm">
                      I&apos;m stuck on this past paper question. How do I resolve the tension components in equilibrium?
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/20">
                    <BrainCircuit className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="w-[80%] rounded-2xl rounded-tl-none border border-white/10 bg-white/5 p-4 text-slate-300 shadow-lg">
                    <p className="mb-3 text-sm font-medium text-white">Great question! Let&apos;s break it down step by step:</p>

                    <div className="mb-4 space-y-2">
                      <div className="h-2 w-[90%] rounded-full bg-white/10" />
                      <div className="h-2 w-[75%] rounded-full bg-white/10" />
                      <div className="h-2 w-[85%] rounded-full bg-white/10" />
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/40 p-3">
                      <Play className="h-5 w-5 text-indigo-400" />
                      <div className="flex-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div className="h-full w-1/3 rounded-full bg-indigo-500" />
                        </div>
                      </div>
                      <span className="font-mono text-xs text-slate-500">0:45</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 right-8 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)] backdrop-blur-md">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <div>
                  <div className="text-sm font-bold text-white">+50 XP earned</div>
                  <div className="text-xs text-emerald-400/80">Concept mastered</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-[-2px] h-32 bg-gradient-to-t from-[#080c14] to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
