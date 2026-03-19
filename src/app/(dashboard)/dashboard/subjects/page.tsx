'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { ArrowRight, BookOpen, Layers3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SUBJECT_MAP, SUBJECTS, SYLLABUS } from '@/lib/constants';
import { getGeneratedLessons } from '@/lib/dashboard-intelligence';
import { auth, db } from '@/lib/firebase';
import { Progress as LessonProgress, ProgressStatus, SubjectId } from '@/lib/types';

interface SubjectCardData {
  id: string;
  name: string;
  icon: string;
  color: string;
  unitCount: number;
  lessonCount: number;
  completedLessons: number;
  progressPercent: number;
  ctaHref: string;
  ctaLabel: 'Continue' | 'Start Learning';
}

interface ProgressEntry extends LessonProgress {
  lessonId: string;
}

interface LastVisitedLesson {
  subjectId?: string;
  unitId?: string;
  lessonId?: string;
  href?: string;
}

function isSubjectId(value: string): value is SubjectId {
  return value in SUBJECT_MAP;
}

function parseNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function isCompletedStatus(status: ProgressStatus) {
  return status === 'proficient' || status === 'mastered';
}

function normalizeSubject(subjectId: string, rawData: Record<string, unknown>) {
  const fallback = isSubjectId(subjectId) ? SUBJECT_MAP[subjectId] : null;

  return {
    id: subjectId,
    name:
      (typeof rawData.name === 'string' && rawData.name.trim()) ||
      (typeof rawData.nameEn === 'string' && rawData.nameEn.trim()) ||
      fallback?.name ||
      'Subject',
    icon:
      (typeof rawData.icon === 'string' && rawData.icon.trim()) ||
      fallback?.icon ||
      '*',
    color:
      (typeof rawData.color === 'string' && rawData.color.trim()) ||
      (typeof rawData.colorHex === 'string' && rawData.colorHex.trim()) ||
      fallback?.color ||
      '#6366f1',
    unitCount:
      parseNumber(rawData.unitCount) ??
      parseNumber(rawData.totalUnits) ??
      fallback?.unitCount ??
      0,
    lessonCount:
      parseNumber(rawData.lessonCount) ??
      parseNumber(rawData.totalLessons) ??
      fallback?.lessonCount ??
      0,
  };
}

function readLastVisitedLesson(value: unknown): LastVisitedLesson | null {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Record<string, unknown>;
  return {
    subjectId: typeof candidate.subjectId === 'string' ? candidate.subjectId : undefined,
    unitId: typeof candidate.unitId === 'string' ? candidate.unitId : undefined,
    lessonId: typeof candidate.lessonId === 'string' ? candidate.lessonId : undefined,
    href: typeof candidate.href === 'string' ? candidate.href : undefined,
  };
}

function resolveContinueHref(subjectId: string, lastVisitedLesson: LastVisitedLesson | null, subjectProgress: ProgressEntry[]) {
  if (lastVisitedLesson?.subjectId === subjectId && lastVisitedLesson.href) {
    return lastVisitedLesson.href;
  }

  if (!isSubjectId(subjectId)) {
    return `/dashboard/subjects/${subjectId}`;
  }

  const progressByLessonId = new Map(subjectProgress.map((entry) => [entry.lessonId, entry]));
  const units = SYLLABUS[subjectId] ?? [];

  for (const unit of units) {
    const generatedLessons = getGeneratedLessons(subjectId, unit.id);

    for (const lesson of generatedLessons) {
      const status = progressByLessonId.get(lesson.lessonId)?.status ?? 'not_started';
      if (status !== 'mastered') {
        return lesson.href;
      }
    }
  }

  return `/dashboard/subjects/${subjectId}`;
}

function getSubjectSortIndex(subjectId: string) {
  return SUBJECTS.findIndex((subject) => subject.id === subjectId);
}

function SubjectsLoadingSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <Card className="border-white/10 bg-[#0b101a] py-6">
        <CardContent className="space-y-4">
          <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
          <div className="h-9 w-72 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-white/5" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-white/10 bg-[#0b101a] py-6">
            <CardContent className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 animate-pulse rounded-2xl bg-white/10" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
                    <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
                  </div>
                </div>
                <div className="h-6 w-16 animate-pulse rounded-full bg-white/5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 animate-pulse rounded-2xl bg-white/[0.04]" />
                <div className="h-20 animate-pulse rounded-2xl bg-white/[0.04]" />
              </div>

              <div className="space-y-3">
                <div className="h-4 w-40 animate-pulse rounded bg-white/5" />
                <div className="h-2.5 w-full animate-pulse rounded-full bg-white/10" />
              </div>

              <div className="h-11 w-full animate-pulse rounded-xl bg-white/10" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DashboardSubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isActive) return;

      setLoading(true);
      setError(null);

      if (!firebaseUser) {
        router.replace('/auth/login');
        return;
      }

      try {
        const [subjectsSnapshot, userSnapshot, progressSnapshot] = await Promise.all([
          getDocs(collection(db, 'subjects')),
          getDoc(doc(db, 'users', firebaseUser.uid)),
          getDocs(collection(db, 'studentProgress', firebaseUser.uid, 'lessons')),
        ]);

        if (!isActive) return;

        const lastVisitedLesson = readLastVisitedLesson(userSnapshot.data()?.lastVisitedLesson);
        const progressEntries = progressSnapshot.docs.map((progressDoc) => ({
          lessonId: progressDoc.id,
          ...(progressDoc.data() as LessonProgress),
        }));

        const progressBySubject = progressEntries.reduce<Record<string, ProgressEntry[]>>((accumulator, entry) => {
          if (!accumulator[entry.subjectId]) {
            accumulator[entry.subjectId] = [];
          }

          accumulator[entry.subjectId].push(entry);
          return accumulator;
        }, {});

        const normalizedSubjects = subjectsSnapshot.docs
          .map((subjectDoc) => {
            const normalized = normalizeSubject(subjectDoc.id, subjectDoc.data() as Record<string, unknown>);
            const subjectProgress = progressBySubject[normalized.id] ?? [];
            const completedLessons = subjectProgress.filter((entry) => isCompletedStatus(entry.status)).length;
            const progressPercent =
              normalized.lessonCount > 0
                ? Math.min(100, Math.round((completedLessons / normalized.lessonCount) * 100))
                : 0;
            const hasProgress =
              subjectProgress.length > 0 ||
              (lastVisitedLesson?.subjectId === normalized.id && Boolean(lastVisitedLesson.href));

            return {
              ...normalized,
              completedLessons,
              progressPercent,
              ctaHref: hasProgress
                ? resolveContinueHref(normalized.id, lastVisitedLesson, subjectProgress)
                : `/dashboard/subjects/${normalized.id}`,
              ctaLabel: hasProgress ? 'Continue' : 'Start Learning',
            } satisfies SubjectCardData;
          })
          .sort((left, right) => {
            const leftIndex = getSubjectSortIndex(left.id);
            const rightIndex = getSubjectSortIndex(right.id);

            if (leftIndex >= 0 && rightIndex >= 0) return leftIndex - rightIndex;
            if (leftIndex >= 0) return -1;
            if (rightIndex >= 0) return 1;
            return left.name.localeCompare(right.name);
          });

        setSubjects(normalizedSubjects);
        setLoading(false);
      } catch (fetchError) {
        console.error('Failed to load dashboard subjects', fetchError);

        if (!isActive) return;

        setError('We could not load your subjects right now. Please try again in a moment.');
        setLoading(false);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [router]);

  const totalLessons = useMemo(
    () => subjects.reduce((sum, subject) => sum + subject.lessonCount, 0),
    [subjects]
  );

  const totalCompletedLessons = useMemo(
    () => subjects.reduce((sum, subject) => sum + subject.completedLessons, 0),
    [subjects]
  );

  if (loading) {
    return <SubjectsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="pb-12">
        <Card className="border-rose-400/20 bg-[#0b101a] py-6">
          <CardContent className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-300">Unable to load subjects</p>
            <h1 className="text-2xl font-black text-white">Something went wrong while loading your dashboard.</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="pb-12">
        <Card className="border-white/10 bg-[#0b101a] py-6">
          <CardContent className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Subjects</p>
            <h1 className="text-2xl font-black text-white">Your learning dashboard is almost ready.</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Your subjects are being set up. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Card className="border-white/10 bg-[#0b101a] py-6">
        <CardContent className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Your subjects</p>
            <h1 className="text-3xl font-black tracking-tight text-white">Pick up your A/L learning where you left off.</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Every card below is connected to your real lesson progress and points you to the next best place to continue.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Completed lessons</p>
              <p className="mt-2 text-2xl font-black text-white">{totalCompletedLessons}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Available lessons</p>
              <p className="mt-2 text-2xl font-black text-white">{totalLessons}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.id} className="border-white/10 bg-[#0b101a] py-6">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-lg"
                    style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                  >
                    {subject.icon}
                  </div>

                  <div>
                    <CardTitle className="text-xl font-bold text-white">{subject.name}</CardTitle>
                    <p className="mt-1 text-sm text-slate-400">{subject.completedLessons} lessons completed</p>
                  </div>
                </div>

                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                >
                  {subject.progressPercent}%
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Layers3 className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">Units</span>
                  </div>
                  <p className="mt-3 text-2xl font-black text-white">{subject.unitCount}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">Lessons</span>
                  </div>
                  <p className="mt-3 text-2xl font-black text-white">{subject.lessonCount}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-300">Progress</span>
                  <span className="font-semibold text-white">
                    {subject.completedLessons} / {subject.lessonCount}
                  </span>
                </div>
                <Progress
                  value={subject.progressPercent}
                  className="gap-0"
                />
              </div>

              <Link
                href={subject.ctaHref}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white transition hover:brightness-110"
                style={{ backgroundColor: subject.color }}
              >
                {subject.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
