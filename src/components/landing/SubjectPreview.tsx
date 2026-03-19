'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

export default function SubjectPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="border-t border-cgray-200 bg-white py-16">
      <div className="c-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cblue-500">
            Full Sri Lankan A/L syllabus
          </p>
          <h2 className="mb-2 text-3xl font-bold text-cgray-900">Choose Your Subject</h2>
          <p className="mb-8 text-base text-cgray-600">
            Every unit, topic, and lesson is structured for the A/L exam with AI-powered guidance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUBJECTS.map((subject, index) => {
            const units = SYLLABUS[subject.id as keyof typeof SYLLABUS] || [];

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Link href={`/subjects/${subject.id}`} className="block h-full hover:no-underline">
                  <div className="c-card group flex h-full cursor-pointer flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                    <div className={getSubjectBarClass(subject.id)} />

                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 text-2xl">{subject.icon}</div>

                      <h3 className="mb-1 text-base font-semibold leading-snug text-cgray-900 transition-colors group-hover:text-cblue-500">
                        {subject.name}
                      </h3>

                      <p className="mb-3 flex-1 text-sm leading-relaxed text-cgray-500">
                        {subject.description}
                      </p>

                      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-cgray-500">
                        <div className="flex items-center gap-1">
                          <span>{subject.unitCount} Units</span>
                        </div>
                        <span className="hidden h-1 w-1 rounded-full bg-cgray-300 sm:block" />
                        <div className="flex items-center gap-1">
                          <span>{subject.lessonCount}+ Lessons</span>
                        </div>
                      </div>

                      <div className="mb-3 border-t border-cgray-100 pt-3">
                        {units.slice(0, 4).map((unit, unitIndex) => (
                          <div key={unit.id} className="flex items-center gap-2 py-0.5 text-xs text-cgray-600">
                            <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-cgray-100 text-[10px] font-semibold text-cgray-600">
                              {unitIndex + 1}
                            </div>
                            <span className="truncate">{unit.title}</span>
                            {unitIndex < 2 ? <span className="c-badge-green ml-auto text-[9px]">Free</span> : null}
                          </div>
                        ))}

                        {units.length > 4 ? (
                          <p className="mt-1 text-xs font-semibold text-cblue-500">+{units.length - 4} more units</p>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between border-t border-cgray-100 pt-3">
                        <div className="flex items-center gap-1 text-xs text-cgray-500">
                          <span>Start for free</span>
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
  );
}
