'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Lock, PlayCircle } from 'lucide-react';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getSubjectProgress } from '@/lib/progress';
import { Lesson, Progress, ProgressStatus } from '@/lib/types';

function getLessonsForUnit(unitId: string, subjectId: string): Partial<Lesson>[] {
  return [
    { id: `${unitId}-l1`, title: 'Introduction and Core Concepts', duration: 12, order: 1 },
    { id: `${unitId}-l2`, title: 'Deep Dive: Key Principles', duration: 18, order: 2 },
    { id: `${unitId}-l3`, title: 'Practice & Application', duration: 24, order: 3 },
  ];
}

function getMasteryIndicator(status?: ProgressStatus) {
  switch (status) {
    case 'mastered':
      return 'w-4 h-4 rounded-full bg-cgreen-500 flex-shrink-0';
    case 'proficient':
      return 'w-4 h-4 rounded-full bg-cyellow-400 flex-shrink-0';
    case 'practicing':
      return 'w-4 h-4 rounded-full bg-cblue-500 flex-shrink-0';
    default:
      return 'w-4 h-4 rounded-full border-2 border-cgray-300 flex-shrink-0';
  }
}

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const { user } = useAuth();

  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);

  const subject = SUBJECTS.find((entry) => entry.id === subjectId);
  const units = (SYLLABUS as Record<string, Array<{ id: string; title: string; description?: string }>>)[subjectId] || [];

  useEffect(() => {
    if (user && subject) {
      getSubjectProgress(user.uid, subject.id)
        .then((data) => {
          setProgressMap(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load progress', error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [subject, user]);

  useEffect(() => {
    setExpandedUnitId(units[0]?.id ?? null);
  }, [subjectId, units]);

  const unitsWithLessons = useMemo(() => {
    return units.map((unit) => {
      const lessons = getLessonsForUnit(unit.id, subjectId);
      let unitMastered = 0;

      lessons.forEach((lesson) => {
        const progress = progressMap[lesson.id!];
        if (progress?.status === 'mastered') {
          unitMastered += 1;
        }
      });

      return {
        ...unit,
        lessons,
        unitMastered,
        unitProgress: lessons.length > 0 ? Math.round((unitMastered / lessons.length) * 100) : 0,
      };
    });
  }, [progressMap, subjectId, units]);

  const totalLessons = useMemo(
    () => unitsWithLessons.reduce((sum, unit) => sum + unit.lessons.length, 0),
    [unitsWithLessons]
  );

  const masteredLessons = useMemo(
    () => unitsWithLessons.reduce((sum, unit) => sum + unit.unitMastered, 0),
    [unitsWithLessons]
  );

  const overallProgress = totalLessons > 0 ? Math.round((masteredLessons / totalLessons) * 100) : 0;

  if (!subject) {
    return <div className="c-card p-8 text-cgray-700">Subject not found</div>;
  }

  return (
    <div className="pb-20">
      <div className="mb-6 flex items-center gap-2 text-sm text-cgray-500 flex-wrap">
        <Link href="/dashboard" className="hover:text-cblue-500 hover:no-underline">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/dashboard/subjects" className="hover:text-cblue-500 hover:no-underline">Subjects</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-semibold text-cgray-900">{subject.name}</span>
      </div>

      <div className="rounded-lg border border-cgray-200 bg-cgray-50 p-6 mb-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5 flex-1">
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl shrink-0"
              style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
            >
              {subject.icon}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-cblue-500 uppercase tracking-wider mb-2">My Subject</p>
              <h1 className="text-3xl md:text-4xl font-bold text-cgray-900 mb-3">{subject.name}</h1>
              <p className="text-base text-cgray-600 leading-relaxed mb-4 max-w-2xl">{subject.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-cgray-600">
                <span className="flex items-center gap-1.5">{subject.unitCount} Units</span>
                <span className="w-1 h-1 bg-cgray-300 rounded-full" />
                <span className="flex items-center gap-1.5">{totalLessons} Lessons</span>
                <span className="w-1 h-1 bg-cgray-300 rounded-full" />
                <span className="flex items-center gap-1.5">~{Math.round((totalLessons * 18) / 60)} Hours</span>
              </div>

              {!isLoading && user ? (
                <div className="mt-4 max-w-xs">
                  <p className="text-sm text-cgray-600 mb-1.5">Overall mastery</p>
                  <div className="bg-cgray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="bg-cblue-500 h-2 rounded-full"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0">
            <button
              onClick={() => router.push(`/dashboard/subjects/${subject.id}/${units[0]?.id}`)}
              className="btn-primary mt-5 md:mt-0"
            >
              Start Learning
            </button>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-cgray-900 mb-4">Course Curriculum</h2>

        {unitsWithLessons.map((unit, index) => {
          const isLocked = index > 1;
          const isExpanded = expandedUnitId === unit.id;

          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="c-card mb-2 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedUnitId((current) => (current === unit.id ? null : unit.id))}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-cgray-100 flex items-center justify-center text-xs font-semibold text-cgray-600 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-cgray-900">Unit {index + 1}: {unit.title}</p>
                      <p className="text-sm text-cgray-500 truncate">{unit.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isLocked ? (
                      <span className="c-badge-gray mr-2 flex items-center gap-1">
                        <Lock className="text-cgray-400 w-3 h-3" />
                        Locked
                      </span>
                    ) : (
                      <span className="c-badge-green mr-2">Free</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-cgray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                <div className="px-4 pb-3">
                  <div className="bg-cgray-100 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-cblue-500 h-1 rounded-full"
                      style={{ width: `${unit.unitProgress}%` }}
                    />
                  </div>
                </div>
              </button>

              {isExpanded ? (
                <div className="border-t border-cgray-100 px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {unit.lessons.map((lesson) => {
                      const progress = progressMap[lesson.id!];
                      const status = progress?.status;

                      return (
                        <Link
                          href={isLocked ? '#' : `/dashboard/subjects/${subject.id}/${unit.id}?lesson=${lesson.id}`}
                          key={lesson.id}
                          className={`flex items-center gap-3 py-2 rounded px-2 ${
                            isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-cgray-50 cursor-pointer hover:no-underline'
                          }`}
                          onClick={(event) => {
                            if (isLocked) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <span className={getMasteryIndicator(status)} />
                          <span className="text-sm text-cgray-700 flex-1">{lesson.title}</span>
                          <span className="text-xs text-cgray-400">{lesson.duration} min</span>
                        </Link>
                      );
                    })}
                  </div>

                  <Link
                    href={isLocked ? '#' : `/dashboard/subjects/${subject.id}/${unit.id}/quiz`}
                    className={`mt-4 inline-flex items-center gap-2 rounded px-2 py-2 text-sm font-semibold ${
                      isLocked ? 'text-cgray-400 cursor-not-allowed hover:no-underline' : 'text-cblue-500 hover:text-cblue-600 hover:no-underline'
                    }`}
                    onClick={(event) => {
                      if (isLocked) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <PlayCircle className="w-4 h-4" />
                    Unit Quiz: {unit.title}
                  </Link>
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
