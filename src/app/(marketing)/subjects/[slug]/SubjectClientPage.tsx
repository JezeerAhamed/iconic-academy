'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDoc, getDocs, orderBy, query, where, doc } from 'firebase/firestore';
import { ChevronDown, Lock, PlayCircle } from 'lucide-react';
import { SUBJECT_MAP } from '@/lib/constants';
import { getGeneratedLessons } from '@/lib/dashboard-intelligence';
import { auth, db } from '@/lib/firebase';
import { ProgressStatus, SubjectId } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SubjectClientPageProps {
  slug: string;
  validSlugs: string[];
}

interface LessonItem {
  id: string;
  title: string;
  durationMinutes: number;
}

interface UnitItem {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons: LessonItem[];
}

interface SubjectViewModel {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unitCount: number;
  lessonCount: number;
  hours: number;
}

function formatHours(totalHours: number) {
  if (totalHours <= 0) return '0 Hours';
  if (Number.isInteger(totalHours)) return `${totalHours} ${totalHours === 1 ? 'Hour' : 'Hours'}`;
  return `${totalHours.toFixed(1)} Hours`;
}

function toSubjectId(value: string): SubjectId | null {
  return value in SUBJECT_MAP ? (value as SubjectId) : null;
}

function normalizeSubject(docId: string, slug: string, rawData: Record<string, unknown>, units: UnitItem[]): SubjectViewModel {
  const subjectId = toSubjectId(slug);
  const fallback = subjectId ? SUBJECT_MAP[subjectId] : null;
  const totalDurationMinutes = units.reduce(
    (sum, unit) => sum + unit.lessons.reduce((unitSum, lesson) => unitSum + lesson.durationMinutes, 0),
    0
  );
  const fallbackLessonCount = fallback?.lessonCount ?? 0;
  const lessonCountFromUnits = units.reduce((sum, unit) => sum + unit.lessons.length, 0);
  const lessonCount =
    lessonCountFromUnits ||
    (typeof rawData.totalLessons === 'number' ? rawData.totalLessons : 0) ||
    fallbackLessonCount;
  const totalHours =
    totalDurationMinutes > 0
      ? Math.round((totalDurationMinutes / 60) * 10) / 10
      : Math.round((lessonCount / 4) * 10) / 10;

  return {
    id: docId,
    slug,
    name:
      (typeof rawData.name === 'string' && rawData.name.trim()) ||
      (typeof rawData.nameEn === 'string' && rawData.nameEn.trim()) ||
      fallback?.name ||
      'Subject',
    description:
      (typeof rawData.description === 'string' && rawData.description.trim()) ||
      (typeof rawData.descriptionEn === 'string' && rawData.descriptionEn.trim()) ||
      fallback?.description ||
      'Structured A/L lessons and guided mastery practice.',
    icon:
      (typeof rawData.icon === 'string' && rawData.icon.trim()) ||
      fallback?.icon ||
      '*',
    color:
      (typeof rawData.color === 'string' && rawData.color.trim()) ||
      (typeof rawData.colorHex === 'string' && rawData.colorHex.trim()) ||
      fallback?.color ||
      '#6366f1',
    unitCount: units.length || (typeof rawData.totalUnits === 'number' ? rawData.totalUnits : fallback?.unitCount ?? 0),
    lessonCount,
    hours: totalHours,
  };
}

function getMasterySymbol(status: ProgressStatus | 'not_started') {
  switch (status) {
    case 'mastered':
      return {
        symbol: '●',
        className: 'text-green-400',
      };
    case 'proficient':
      return {
        symbol: '◑',
        className: 'text-amber-400',
      };
    case 'practicing':
      return {
        symbol: '◔',
        className: 'text-sky-400',
      };
    default:
      return {
        symbol: '○',
        className: 'text-slate-500',
      };
  }
}

function SubjectLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#080c14] pb-20 pt-28">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
        <Card className="border-white/10 bg-[#0b101a] py-8">
          <CardContent className="space-y-5">
            <div className="h-16 w-16 animate-pulse rounded-2xl bg-white/[0.04]" />
            <div className="h-12 w-72 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-[32rem] max-w-full animate-pulse rounded bg-white/5" />
            <div className="h-4 w-80 animate-pulse rounded bg-white/5" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-white/10 bg-[#0b101a] py-6">
              <CardContent className="space-y-4">
                <div className="h-6 w-56 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.04]" />
                <div className="h-4 w-48 animate-pulse rounded bg-white/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SubjectClientPage({ slug, validSlugs }: SubjectClientPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<SubjectViewModel | null>(null);
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [progressByLesson, setProgressByLesson] = useState<Record<string, ProgressStatus>>({});
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const subjectId = toSubjectId(slug);
  const isValidSlug = validSlugs.includes(slug);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setIsPremium(false);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        const plan = userSnap.data()?.plan;
        setIsPremium(plan === 'pro' || plan === 'elite' || plan === 'basic' || plan === 'premium');
      } catch (error) {
        console.error('Failed to load user plan', error);
        setIsPremium(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadSubjectPage() {
      if (!isValidSlug || !subjectId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const subjectQuery = query(collection(db, 'subjects'), where('slug', '==', slug));
        const subjectSnapshot = await getDocs(subjectQuery);

        let subjectDoc = subjectSnapshot.docs[0] ?? null;
        if (!subjectDoc) {
          const fallbackSubjectDoc = await getDoc(doc(db, 'subjects', slug));
          if (fallbackSubjectDoc.exists()) {
            subjectDoc = fallbackSubjectDoc;
          }
        }

        if (!subjectDoc) {
          if (isActive) {
            setSubject(null);
            setUnits([]);
            setLoading(false);
          }
          return;
        }

        const unitsSnapshot = await getDocs(
          query(collection(db, 'subjects', subjectDoc.id, 'units'), orderBy('orderIndex', 'asc'))
        );

        const nextUnits = await Promise.all(
          unitsSnapshot.docs.map(async (unitDoc) => {
            const unitData = unitDoc.data();
            const lessonsSnapshot = await getDocs(
              query(collection(db, 'subjects', subjectDoc.id, 'units', unitDoc.id, 'lessons'), orderBy('orderIndex', 'asc'))
            );

            const firestoreLessons = lessonsSnapshot.docs.map((lessonDoc) => {
              const lessonData = lessonDoc.data();
              return {
                id: lessonDoc.id,
                title:
                  (typeof lessonData.titleEn === 'string' && lessonData.titleEn.trim()) ||
                  'Lesson',
                durationMinutes:
                  typeof lessonData.durationMinutes === 'number' ? lessonData.durationMinutes : 15,
              } satisfies LessonItem;
            });

            const generatedFallbackLessons =
              firestoreLessons.length === 0 && subjectId
                ? getGeneratedLessons(subjectId, unitDoc.id).map((lesson) => ({
                    id: lesson.lessonId,
                    title: lesson.lessonTitle,
                    durationMinutes: lesson.durationMinutes,
                  }))
                : [];

            return {
              id: unitDoc.id,
              title:
                (typeof unitData.titleEn === 'string' && unitData.titleEn.trim()) ||
                (typeof unitData.title === 'string' && unitData.title.trim()) ||
                'Untitled Unit',
              description:
                (typeof unitData.descriptionEn === 'string' && unitData.descriptionEn.trim()) ||
                (typeof unitData.description === 'string' && unitData.description.trim()) ||
                'This unit covers essential exam-focused concepts.',
              orderIndex: typeof unitData.orderIndex === 'number' ? unitData.orderIndex : 0,
              lessons: firestoreLessons.length > 0 ? firestoreLessons : generatedFallbackLessons,
            } satisfies UnitItem;
          })
        );

        if (!isActive) return;

        setUnits(nextUnits);
        setExpandedUnitId(nextUnits[0]?.id ?? null);
        setSubject(normalizeSubject(subjectDoc.id, slug, subjectDoc.data() as Record<string, unknown>, nextUnits));
      } catch (error) {
        console.error('Failed to load subject page', error);
        if (isActive) {
          setSubject(null);
          setUnits([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadSubjectPage();

    return () => {
      isActive = false;
    };
  }, [isValidSlug, slug, subjectId]);

  useEffect(() => {
    let isActive = true;

    async function loadProgress() {
      if (!user || !subjectId) {
        setProgressByLesson({});
        return;
      }

      try {
        const progressSnapshot = await getDocs(collection(db, 'studentProgress', user.uid, 'lessons'));
        if (!isActive) return;

        const nextProgress = progressSnapshot.docs.reduce<Record<string, ProgressStatus>>((accumulator, progressDoc) => {
          const progressData = progressDoc.data();
          if (progressData.subjectId === subjectId && typeof progressData.status === 'string') {
            accumulator[progressDoc.id] = progressData.status as ProgressStatus;
          }
          return accumulator;
        }, {});

        setProgressByLesson(nextProgress);
      } catch (error) {
        console.error('Failed to load subject progress', error);
        if (isActive) {
          setProgressByLesson({});
        }
      }
    }

    loadProgress();

    return () => {
      isActive = false;
    };
  }, [subjectId, user]);

  const totalMasteredLessons = useMemo(
    () => units.reduce(
      (sum, unit) => sum + unit.lessons.filter((lesson) => progressByLesson[lesson.id] === 'mastered').length,
      0
    ),
    [progressByLesson, units]
  );

  const totalLessons = useMemo(
    () => units.reduce((sum, unit) => sum + unit.lessons.length, 0),
    [units]
  );

  const overallMasteryPercent = totalLessons > 0 ? Math.round((totalMasteredLessons / totalLessons) * 100) : 0;

  const handleUnitToggle = (unit: UnitItem, index: number) => {
    const isFreeUnit = index < 2;
    const isLocked = !isPremium && !isFreeUnit;

    if (isLocked) {
      setShowUpgradeModal(true);
      return;
    }

    setExpandedUnitId((current) => (current === unit.id ? null : unit.id));
  };

  if (loading) {
    return <SubjectLoadingSkeleton />;
  }

  if (!isValidSlug || !subject) {
    return (
      <div className="min-h-screen bg-[#080c14] pb-20 pt-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Card className="border-white/10 bg-[#0b101a] py-10">
            <CardContent className="space-y-4">
              <h1 className="text-3xl font-black text-white">Subject not found</h1>
              <p className="mx-auto max-w-xl text-sm leading-6 text-slate-300">
                We couldn&apos;t find that subject page. Try browsing the available A/L subjects instead.
              </p>
              <Link
                href="/subjects"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 font-semibold text-black transition hover:bg-slate-200"
              >
                Browse All Subjects
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const ctaHref = user ? `/dashboard/subjects/${slug}` : '/auth/signup';

  return (
    <>
      <div className="min-h-screen bg-[#080c14] pb-20 pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span>&gt;</span>
            <Link href="/subjects" className="transition hover:text-white">Subjects</Link>
            <span>&gt;</span>
            <Link href={`/subjects/${slug}`} className="font-medium text-white transition hover:text-slate-200">
              {subject.name}
            </Link>
          </nav>

          <Card className="overflow-hidden border-white/10 bg-[#0b101a] py-8">
            <CardContent className="space-y-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-5">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg"
                    style={{ backgroundColor: `${subject.color}20`, border: `1px solid ${subject.color}35`, color: subject.color }}
                  >
                    {subject.icon}
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-4xl font-black tracking-tight text-white">{subject.name}</h1>
                    <p className="text-base leading-7 text-slate-300">{subject.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                    <span>{subject.unitCount} Units</span>
                    <span className="text-slate-600">·</span>
                    <span>{subject.lessonCount} Lessons</span>
                    <span className="text-slate-600">·</span>
                    <span>{formatHours(subject.hours)}</span>
                  </div>

                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-slate-300">Overall mastery</span>
                        <span className="font-semibold text-white">{overallMasteryPercent}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${overallMasteryPercent}%`,
                            background: `linear-gradient(90deg, ${subject.color}, #22c55e)`,
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <Link
                  href={ctaHref}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-slate-200"
                >
                  Start Learning Free
                </Link>
              </div>
            </CardContent>
          </Card>

          <section className="mt-10 space-y-4">
            {units.map((unit, index) => {
              const isExpanded = expandedUnitId === unit.id;
              const isFreeUnit = index < 2;
              const isLocked = !isPremium && !isFreeUnit;
              const masteredLessons = unit.lessons.filter((lesson) => progressByLesson[lesson.id] === 'mastered').length;
              const unitProgressPercent = unit.lessons.length > 0 ? Math.round((masteredLessons / unit.lessons.length) * 100) : 0;

              return (
                <Card key={unit.id} className="border-white/10 bg-[#0b101a] py-0">
                  <button
                    type="button"
                    onClick={() => handleUnitToggle(unit, index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                  >
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold text-white">
                          Unit {index + 1}: {unit.title}
                        </h2>
                        <span
                          className={[
                            'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                            isFreeUnit
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : isLocked
                                ? 'bg-white/[0.06] text-slate-400'
                                : 'bg-violet-500/15 text-violet-300',
                          ].join(' ')}
                        >
                          {isFreeUnit ? 'Free' : isLocked ? 'Locked' : 'Unlocked'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${unitProgressPercent}%`,
                              background: `linear-gradient(90deg, ${subject.color}, #22c55e)`,
                            }}
                          />
                        </div>
                        <p className="text-sm text-slate-400">
                          {masteredLessons}/{unit.lessons.length} lessons mastered
                        </p>
                      </div>
                    </div>

                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isExpanded ? (
                    <div className="border-t border-white/10 px-5 py-5">
                      <div className="space-y-3">
                        {unit.lessons.map((lesson) => {
                          const mastery = getMasterySymbol(progressByLesson[lesson.id] ?? 'not_started');

                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`text-lg ${mastery.className}`}>{mastery.symbol}</span>
                                <div>
                                  <p className="font-medium text-white">{lesson.title}</p>
                                  <p className="text-sm text-slate-500">{lesson.durationMinutes} min</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4">
                        <Link
                          href={user ? `/dashboard/subjects/${slug}/${unit.id}` : '/auth/signup'}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-slate-200"
                        >
                          Start Unit
                          <PlayCircle className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </section>
        </div>
      </div>

      {showUpgradeModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b101a] p-6 shadow-2xl">
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-white">Unlock all units — upgrade to Basic Rs 990/mo</h2>
              <p className="text-sm leading-6 text-slate-300">
                Units 1 and 2 are free to explore. Upgrade to unlock the full syllabus, guided lessons, and deeper practice.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUpgradeModal(false)}
                className="border-white/10 bg-white/[0.03] text-white hover:bg-white/10"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/pricing')}
                className="bg-white text-black hover:bg-slate-200"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
