'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDoc, getDocs, orderBy, query, where, doc } from 'firebase/firestore';
import { ChevronDown, Lock, PlayCircle } from 'lucide-react';
import EarlyAccessBadge from '@/components/conversion/EarlyAccessBadge';
import WhatsAppFloatingButton from '@/components/conversion/WhatsAppFloatingButton';
import { SUBJECT_MAP } from '@/lib/constants';
import { getGeneratedLessons } from '@/lib/dashboard-intelligence';
import { auth, db } from '@/lib/firebase';
import { ProgressStatus, SubjectId } from '@/lib/types';
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

function getMasteryIndicator(status: ProgressStatus | 'not_started') {
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

function SubjectLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white pt-16 pb-20">
      <section className="bg-cgray-50 border-b border-cgray-200 py-16">
        <div className="c-container flex flex-col gap-8 md:flex-row md:items-start">
          <div className="flex-1 space-y-4">
            <div className="h-4 w-28 animate-pulse rounded bg-cgray-100" />
            <div className="h-10 w-72 animate-pulse rounded bg-cgray-100" />
            <div className="h-4 w-[32rem] max-w-full animate-pulse rounded bg-cgray-100" />
            <div className="h-4 w-80 animate-pulse rounded bg-cgray-100" />
          </div>
          <div className="h-11 w-40 animate-pulse rounded bg-cgray-100" />
        </div>
      </section>

      <div className="c-container py-16">
        <div className="mb-4 h-6 w-44 animate-pulse rounded bg-cgray-100" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="c-card">
              <div className="space-y-4 p-4">
                <div className="h-5 w-64 animate-pulse rounded bg-cgray-100" />
                <div className="h-1 w-full animate-pulse rounded-full bg-cgray-100" />
              </div>
            </div>
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
      <div className="min-h-screen bg-white pt-16 pb-20">
        <div className="c-container py-16">
          <div className="c-card p-10 text-center">
            <h1 className="text-3xl font-bold text-cgray-900">Subject not found</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-cgray-600">
              We couldn&apos;t find that subject page. Try browsing the available A/L subjects instead.
            </p>
            <Link
              href="/subjects"
              className="btn-primary mt-5 inline-flex hover:no-underline"
            >
              Browse All Subjects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ctaHref = user ? `/dashboard/subjects/${slug}` : '/auth/signup';

  return (
    <>
      <div className="min-h-screen bg-white pt-16 pb-20">
        <nav className="c-container py-4 flex flex-wrap items-center gap-2 text-sm text-cgray-500">
          <Link href="/" className="hover:text-cblue-500 hover:no-underline">Home</Link>
          <span>&gt;</span>
          <Link href="/subjects" className="hover:text-cblue-500 hover:no-underline">Subjects</Link>
          <span>&gt;</span>
          <span className="font-semibold text-cgray-900">{subject.name}</span>
        </nav>

        <section className="bg-cgray-50 border-b border-cgray-200 py-16">
          <div className="c-container flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <p className="text-sm font-semibold text-cblue-500 uppercase tracking-wider mb-2">A/L Subject</p>
              <div className="flex items-start gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-xl text-3xl flex-shrink-0"
                  style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
                >
                  {subject.icon}
                </div>
                <div className="min-w-0">
                  <h1 className="text-3xl md:text-4xl font-bold text-cgray-900 mb-3">{subject.name}</h1>
                  <p className="text-base text-cgray-600 leading-relaxed mb-4 max-w-2xl">{subject.description}</p>
                  <div className="mb-4">
                    <EarlyAccessBadge />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-cgray-600">
                    <span className="flex items-center gap-1.5">
                      <span>{subject.unitCount} Units</span>
                    </span>
                    <span className="w-1 h-1 bg-cgray-300 rounded-full" />
                    <span className="flex items-center gap-1.5">
                      <span>{subject.lessonCount} Lessons</span>
                    </span>
                    <span className="w-1 h-1 bg-cgray-300 rounded-full" />
                    <span className="flex items-center gap-1.5">
                      <span>{formatHours(subject.hours)}</span>
                    </span>
                  </div>

                  {user ? (
                    <div className="mt-4 max-w-xs">
                      <p className="text-sm text-cgray-600 mb-1.5">Overall mastery</p>
                      <div className="bg-cgray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-cblue-500 h-2 rounded-full"
                          style={{ width: `${overallMasteryPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <Link href={ctaHref} className="btn-primary mt-5 inline-flex hover:no-underline">
                    Start Learning Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="c-container py-16">
          <h2 className="text-xl font-semibold text-cgray-900 mb-4">Course Curriculum</h2>

          {units.map((unit, index) => {
            const isExpanded = expandedUnitId === unit.id;
            const isFreeUnit = index < 2;
            const isLocked = !isPremium && !isFreeUnit;
            const masteredLessons = unit.lessons.filter((lesson) => progressByLesson[lesson.id] === 'mastered').length;
            const unitProgressPercent = unit.lessons.length > 0 ? Math.round((masteredLessons / unit.lessons.length) * 100) : 0;

            return (
              <div key={unit.id} className="c-card mb-2 cursor-pointer overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleUnitToggle(unit, index)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between p-4 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-cgray-100 flex items-center justify-center text-xs font-semibold text-cgray-600 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-cgray-900 truncate">{unit.title}</p>
                        <p className="text-sm text-cgray-500 truncate">{unit.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isFreeUnit ? (
                        <span className="c-badge-green mr-2">Free</span>
                      ) : isLocked ? (
                        <span className="c-badge-gray mr-2 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      ) : (
                        <span className="c-badge-gray mr-2">Unlocked</span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-cgray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  <div className="px-4 pb-3">
                    <div className="bg-cgray-100 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-cblue-500 h-1 rounded-full"
                        style={{ width: `${unitProgressPercent}%` }}
                      />
                    </div>
                  </div>
                </button>

                {isExpanded ? (
                  <div className="border-t border-cgray-100 px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {unit.lessons.map((lesson) => {
                        const masteryClass = getMasteryIndicator(progressByLesson[lesson.id] ?? 'not_started');

                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-center gap-3 py-2 rounded px-2 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-cgray-50 cursor-pointer'}`}
                          >
                            <span className={masteryClass} />
                            <span className="text-sm text-cgray-700 flex-1">{lesson.title}</span>
                            <span className="text-xs text-cgray-400">{lesson.durationMinutes} min</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4">
                      <Link
                        href={isLocked ? '#' : user ? `/dashboard/subjects/${slug}/${unit.id}` : '/auth/signup'}
                        className="btn-primary btn-sm inline-flex hover:no-underline"
                        onClick={(event) => {
                          if (isLocked) {
                            event.preventDefault();
                            setShowUpgradeModal(true);
                          }
                        }}
                      >
                        Start Unit
                        <PlayCircle className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      </div>

      {showUpgradeModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cgray-900/20 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md c-card p-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-cgray-900">Unlock all units - upgrade to Basic Rs 990/mo</h2>
              <p className="text-sm leading-6 text-cgray-600">
                Units 1 and 2 are free to explore. Upgrade to unlock the full syllabus, guided lessons, and deeper practice.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUpgradeModal(false)}
                className="btn-secondary h-auto"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/pricing')}
                className="btn-primary h-auto border-0 shadow-none"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <WhatsAppFloatingButton message={`Hi, I'd like to know more about ${subject.name} on Iconic Academy`} />
    </>
  );
}
