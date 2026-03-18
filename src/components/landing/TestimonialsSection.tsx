'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpenCheck, BrainCircuit, CheckCircle2, Landmark } from 'lucide-react';

const differentiators = [
  {
    title: 'Built for Sri Lankan A/L syllabus',
    description: 'The lesson structure, exam framing, and study flow are designed around the actual local science stream.',
    icon: Landmark,
    color: '#3b82f6',
  },
  {
    title: 'Socratic AI, not just answers',
    description: 'The tutor guides students toward understanding instead of dumping final answers with no thinking process.',
    icon: BrainCircuit,
    color: '#8b5cf6',
  },
  {
    title: 'Exam-ready topic coverage',
    description: 'Lessons, practice, and past-paper support all line up with the syllabus students actually sit for.',
    icon: BookOpenCheck,
    color: '#22c55e',
  },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute left-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-indigo-400 backdrop-blur-md">
            Why ICONIC ACADEMY
          </span>
          <h2 className="mb-6 text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
            Honest by Design. <span className="gradient-text">Built for Results.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-light text-slate-400">
            Until we have a larger bank of verified student testimonials, we would rather show exactly what makes the product useful.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {differentiators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
              className="rounded-[2rem] border border-white/10 bg-[#0b101a] p-8"
            >
              <div
                className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}30` }}
              >
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-12 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center"
        >
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <p className="text-sm font-medium text-emerald-100">
              Start free today - no credit card required. Cancel anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
