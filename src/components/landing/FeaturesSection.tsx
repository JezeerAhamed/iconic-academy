'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Brain,
  BookOpen,
  Globe,
  Mic,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: 'AI Tutor',
    description:
      'Context-aware AI that understands the Sri Lankan A/L syllabus and explains concepts step by step in English or Tamil.',
    color: '#6366f1',
    tag: 'Core Feature',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Full Syllabus Coverage',
    description:
      'Every unit, topic and lesson in Physics, Chemistry, Biology, and Combined Maths, mapped to the Sri Lankan A/L curriculum.',
    color: '#3b82f6',
    tag: '408 Lessons',
  },
  {
    icon: <Trophy className="h-6 w-6" />,
    title: 'Past Paper Engine',
    description:
      'Filter by subject, unit and year, then review step-by-step solutions, marking logic, and AI-guided explanations.',
    color: '#f59e0b',
    tag: 'Exam Ready',
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: 'Smart Practice',
    description:
      'Train with MCQ, structured, and essay-style questions while tracking accuracy, speed, and mastery in real time.',
    color: '#22c55e',
    tag: 'Adaptive',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Weak Area Detection',
    description:
      'Performance signals are grouped into clear weak areas so you know exactly what to revise next.',
    color: '#f97316',
    tag: 'AI-Powered',
  },
  {
    icon: <Mic className="h-6 w-6" />,
    title: 'Voice AI Tutoring',
    description:
      'Speak your question, hear the explanation, and keep studying hands-free when reading or typing slows you down.',
    color: '#a855f7',
    tag: 'Voice',
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: 'Bilingual Support',
    description:
      'The tutor responds in Tamil when you write in Tamil and defaults to English when you do not.',
    color: '#ec4899',
    tag: 'Tamil + English',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Gamified Learning',
    description:
      'Earn XP, keep streaks alive, unlock badges, and build daily momentum without turning study into a chore.',
    color: '#eab308',
    tag: 'Motivation',
  },
];

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="section-pad bg-[#060a11]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium text-indigo-400 glass">
            Built Different
          </span>
          <h2 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Everything You Need to <span className="gradient-text">Score an A</span>
          </h2>
          <p className="mx-auto max-w-xl text-slate-400">
            Not just video lessons - a complete AI-powered learning system that adapts to your needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group cursor-default rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/10"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${feature.color}15`, color: feature.color, border: `1px solid ${feature.color}25` }}
              >
                {feature.icon}
              </div>

              {feature.title !== 'Voice AI Tutoring' ? (
                <span
                  className="mb-3 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: `${feature.color}15`, color: feature.color }}
                >
                  {feature.tag}
                </span>
              ) : null}

              <h3 className="mb-2 text-base font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
