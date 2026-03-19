'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import EarlyAccessBadge from '@/components/conversion/EarlyAccessBadge';
import WhatsAppFloatingButton from '@/components/conversion/WhatsAppFloatingButton';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import { cn } from '@/lib/utils';

function getSubjectBarClass(subjectId: string) {
  return cn(
    'h-2 w-full',
    subjectId === 'physics' && 'bg-cblue-500',
    subjectId === 'chemistry' && 'bg-cgreen-500',
    subjectId === 'biology' && 'bg-cyellow-400',
    subjectId === 'maths' && 'bg-cblue-700'
  );
}

export default function SubjectsPageClient() {
  return (
    <div className="min-h-screen bg-white pt-16 pb-16">
      <section className="border-b border-cgray-200 bg-cgray-50 py-16">
        <div className="c-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-cblue-500">
              <Zap className="h-4 w-4" />
              Full Sri Lankan A/L Curriculum
            </span>
            <h1 className="mb-2 text-3xl font-bold text-cgray-900">Choose Your Subject</h1>
            <p className="text-base text-cgray-600">
              Every unit. Every topic. Every lesson. Built for A/L mastery with AI-powered guidance and
              past papers.
            </p>
            <div className="mt-4">
              <EarlyAccessBadge />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="c-container">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUBJECTS.map((subject, index) => {
              const units = SYLLABUS[subject.id as keyof typeof SYLLABUS] || [];

              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Link href={`/subjects/${subject.id}`} className="group block h-full hover:no-underline">
                    <div className="c-card flex h-full cursor-pointer flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                      <div className={getSubjectBarClass(subject.id)} />

                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2 text-2xl">{subject.icon}</div>

                        <h2 className="mb-1 text-base font-semibold leading-snug text-cgray-900 transition-colors group-hover:text-cblue-500">
                          {subject.name}
                        </h2>

                        <p className="mb-3 flex-1 text-sm leading-relaxed text-cgray-500">
                          {subject.description.slice(0, 60)}...
                        </p>

                        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-cgray-500">
                          <div className="flex items-center gap-1">
                            <span>{subject.unitCount} Units</span>
                          </div>
                          <span className="hidden h-1 w-1 rounded-full bg-cgray-300 sm:block" />
                          <div className="flex items-center gap-1">
                            <span>{subject.lessonCount}+ Lessons</span>
                          </div>
                          <span className="hidden h-1 w-1 rounded-full bg-cgray-300 sm:block" />
                          <div className="flex items-center gap-1">
                            <span>120+ Hours</span>
                          </div>
                        </div>

                        <div className="mb-3 border-t border-cgray-100 pt-3">
                          {units.slice(0, 5).map((unit, unitIndex) => (
                            <div key={unit.id} className="flex items-center gap-2 py-0.5 text-xs text-cgray-600">
                              <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-cgray-100 text-[10px] font-semibold text-cgray-600">
                                {unitIndex + 1}
                              </div>
                              <span className="truncate">{unit.title}</span>
                              {unitIndex < 2 ? <span className="c-badge-green ml-auto text-[9px]">Free</span> : null}
                            </div>
                          ))}

                          {units.length > 5 ? (
                            <p className="mt-1 text-xs font-semibold text-cblue-500">
                              + {units.length - 5} more units included
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-center justify-between border-t border-cgray-100 pt-3">
                          <div className="flex items-center gap-1 text-xs text-cgray-500">
                            <span>First 2 units available free</span>
                          </div>

                          <div className="flex items-center gap-1 text-sm font-semibold text-cblue-500 transition-colors hover:text-cblue-600">
                            Start Learning
                            <ArrowRight className="h-4 w-4" />
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

      <WhatsAppFloatingButton message="Hi, I'd like to know more about Iconic Academy" />
    </div>
  );
}
