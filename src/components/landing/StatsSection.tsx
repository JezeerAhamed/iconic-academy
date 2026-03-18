'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpen, BrainCircuit, Flag, Target } from 'lucide-react';

const stats = [
  { value: '408', label: 'Lessons & Topics', icon: BookOpen },
  { value: '4', label: 'Subjects Covered', icon: Target },
  { value: '24/7', label: 'AI-Powered Support', icon: BrainCircuit },
  { value: 'Sri Lanka', label: 'Built for the Local Syllabus', icon: Flag },
];

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="border-y border-white/5 py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-indigo-300 ring-1 ring-white/10">
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="text-3xl font-black tracking-tight text-white sm:text-4xl">{stat.value}</div>
            <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
