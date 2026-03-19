'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpenCheck, BrainCircuit, CheckCircle2, Landmark, Star } from 'lucide-react';

const differentiators = [
  {
    title: 'Built for Sri Lankan A/L syllabus',
    description: 'The lesson structure, exam framing, and study flow are designed around the actual local science stream.',
    icon: Landmark,
  },
  {
    title: 'Socratic AI, not just answers',
    description: 'The tutor guides students toward understanding instead of dumping final answers with no thinking process.',
    icon: BrainCircuit,
  },
  {
    title: 'Exam-ready topic coverage',
    description: 'Lessons, practice, and past-paper support all line up with the syllabus students actually sit for.',
    icon: BookOpenCheck,
  },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="bg-white py-16 border-t border-cgray-200">
      <div className="c-container text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-cgray-900 mb-3">
            Honest by Design. Built for Results.
          </h2>
          <p className="text-base text-cgray-600">
            Until we have a larger bank of verified student testimonials, we would rather show exactly what makes the product useful.
          </p>
        </motion.div>
      </div>

      <div className="c-container grid grid-cols-1 md:grid-cols-3 gap-6">
        {differentiators.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
            className="c-card p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <Star key={starIndex} className="text-cyellow-400 text-base h-4 w-4 fill-current" />
              ))}
            </div>

            <p className="text-base text-cgray-700 leading-relaxed flex-1 before:content-[open-quote] after:content-[close-quote]">
              {item.description}
            </p>

            <div className="flex items-center gap-3 pt-3 border-t border-cgray-100">
              <div className="w-10 h-10 rounded-full bg-cblue-100 flex items-center justify-center text-cblue-600 font-semibold text-sm flex-shrink-0">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-cgray-900">{item.title}</div>
                <div className="text-xs text-cgray-500">ICONIC ACADEMY proof point</div>
              </div>
              <span className="ml-auto c-badge-green">Proof</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="c-container mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="c-card p-6 flex items-start gap-5 max-w-2xl mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-cblue-100 flex items-center justify-center text-cblue-600 font-bold text-xl flex-shrink-0">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <div className="text-lg font-semibold text-cgray-900">Start free today</div>
            <div className="text-sm text-cgray-500">No credit card required</div>
            <p className="text-sm text-cgray-700 leading-relaxed italic mt-2">
              Cancel anytime and begin with the tools that actually help you study better.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
