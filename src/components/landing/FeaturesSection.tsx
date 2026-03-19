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
    <section ref={ref} className="bg-white border-t border-cgray-200 py-16">
      <div className="c-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-cblue-500 uppercase tracking-wider mb-3 inline-block">
            Built Different
          </span>
          <h2 className="text-3xl font-bold text-cgray-900 mb-3">
            Everything You Need to Score an A
          </h2>
          <p className="text-base text-cgray-600 max-w-2xl mx-auto">
            Not just video lessons - a complete AI-powered learning system that adapts to your needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              className="flex flex-col gap-3 p-4"
            >
              <div
                className="w-10 h-10 rounded-lg bg-cblue-50 flex items-center justify-center flex-shrink-0 text-cblue-500"
              >
                {feature.icon}
              </div>

              <span className="text-xs font-semibold text-cblue-600 uppercase tracking-wider">
                {feature.tag}
              </span>

              <h3 className="text-base font-semibold text-cgray-900 leading-snug">{feature.title}</h3>
              <p className="text-sm text-cgray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
