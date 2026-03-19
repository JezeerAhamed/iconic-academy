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
    <section ref={ref} className="border-y border-cgray-200 bg-cgray-50 py-16">
      <div className="c-container">
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="hidden">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-4xl font-bold text-cgray-900">{stat.value}</div>
              <div className="max-w-[120px] text-sm leading-snug text-cgray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
