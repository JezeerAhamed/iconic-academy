'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Lock } from 'lucide-react';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function SubjectPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="section-pad">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium text-indigo-400 glass">
            Full Sri Lankan A/L syllabus
          </span>
          <h2 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Choose Your <span className="gradient-text">Subject</span>
          </h2>
          <p className="mx-auto max-w-xl text-slate-400">
            Every unit, topic, and lesson is structured for the A/L exam with AI-powered guidance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {SUBJECTS.map((subject, index) => {
            const units = SYLLABUS[subject.id as keyof typeof SYLLABUS] || [];

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/subjects/${subject.id}`}>
                  <div
                    className={cn(
                      'group relative cursor-pointer overflow-hidden rounded-2xl border p-6 glass card-hover transition-all duration-300 hover:border-opacity-50'
                    )}
                    style={{ borderColor: `${subject.color}20` }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.borderColor = `${subject.color}40`;
                      event.currentTarget.style.boxShadow = `0 0 40px ${subject.color}18`;
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.borderColor = `${subject.color}20`;
                      event.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      className="absolute right-0 top-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
                      style={{ background: subject.color }}
                    />

                    <div className="relative">
                      <div className="mb-5 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                            style={{ background: `${subject.color}15`, border: `1px solid ${subject.color}30` }}
                          >
                            {subject.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold tracking-tight text-white">{subject.name}</h3>
                            <p className="text-xs text-slate-400">
                              {subject.unitCount} Units - {subject.lessonCount}+ Lessons
                            </p>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                          style={{ background: `${subject.color}15`, color: subject.color }}
                        >
                          <BookOpen className="h-3 w-3" />
                          Full syllabus
                        </div>
                      </div>

                      <p className="mb-5 text-sm leading-relaxed text-slate-400">{subject.description}</p>

                      <div className="mb-5 space-y-1.5">
                        {units.slice(0, 4).map((unit, unitIndex) => (
                          <div key={unit.id} className="flex items-center gap-2.5 text-xs text-slate-400">
                            <div
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                              style={{ background: `${subject.color}15`, color: subject.color }}
                            >
                              {unitIndex + 1}
                            </div>
                            <span className="truncate">{unit.title}</span>
                          </div>
                        ))}

                        {units.length > 4 ? (
                          <div className="flex items-center gap-2.5 text-xs text-slate-500">
                            <div className="flex h-5 w-5 items-center justify-center rounded-md">
                              <Lock className="h-3 w-3" />
                            </div>
                            <span>+{units.length - 4} more units</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <div
                          className="flex items-center gap-2 text-sm font-semibold transition-all duration-200 group-hover:gap-3"
                          style={{ color: subject.color }}
                        >
                          Start Learning
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors group-hover:text-white">
                          <span>Start for free</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
