'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: '408', label: 'Lessons & Topics' },
  { value: '4', label: 'Subjects' },
  { value: '24/7', label: 'AI Support' },
  { value: 'Sri Lanka', label: 'Built' },
];

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="border-t border-cgray-200 bg-white py-8">
      <div className="c-wrap">
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="text-4xl font-bold text-cgray-900">{stat.value}</div>
              <div className="max-w-[120px] text-sm leading-snug text-cgray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
