'use client';

import { useEffect, useMemo, useState } from 'react';
import EmojiIcon from '@/components/accessibility/EmojiIcon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { ArrowRight, BookOpen, Layers3 } from 'lucide-react';
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
      '#0056D2',
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
    <div className="space-y-8 pb-12">
      <div className="rounded-lg border border-cgray-200 bg-cgray-50 p-6">
        <div className="space-y-4">
          <div className="h-4 w-28 animate-pulse rounded bg-cgray-100" />
          <div className="h-9 w-72 animate-pulse rounded bg-cgray-100" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-cgray-100" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="c-card p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-cgray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded bg-cgray-100" />
                  <div className="h-4 w-24 animate-pulse rounded bg-cgray-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 animate-pulse rounded bg-cgray-50" />
                <div className="h-20 animate-pulse rounded bg-cgray-50" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full animate-pulse rounded-full bg-cgray-100" />
                <div className="h-4 w-40 animate-pulse rounded bg-cgray-100" />
              </div>
              <div className="h-10 w-full animate-pulse rounded bg-cgray-100" />
            </div>
          </div>
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
        <div className="c-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cred-500">Unable to load subjects</p>
          <h1 className="mt-2 text-2xl font-bold text-cgray-900">Something went wrong while loading your dashboard.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-cgray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="pb-12">
        <div className="c-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cgray-600">Subjects</p>
          <h1 className="mt-2 text-2xl font-bold text-cgray-900">Your learning dashboard is almost ready.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-cgray-600">
            Your subjects are being set up. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="rounded-lg border border-cgray-200 bg-cgray-50 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-cblue-500 uppercase tracking-wider">Your Subjects</p>
            <h1 className="text-3xl font-bold text-cgray-900">Pick up your A/L learning where you left off.</h1>
            <p className="max-w-2xl text-base leading-relaxed text-cgray-600">
              Every card below is connected to your real lesson progress and points you to the next best place to continue.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="c-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-cgray-600">Completed lessons</p>
              <p className="mt-2 text-2xl font-bold text-cgray-900">{totalCompletedLessons}</p>
            </div>
            <div className="c-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-cgray-600">Available lessons</p>
              <p className="mt-2 text-2xl font-bold text-cgray-900">{totalLessons}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="c-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                  style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
                >
                  <EmojiIcon emoji={subject.icon} label={subject.name} decorative className="text-2xl" />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-cgray-900">{subject.name}</h2>
                  <p className="mt-1 text-sm text-cgray-600">{subject.completedLessons} lessons completed</p>
                </div>
              </div>

              <span className="c-badge-blue">{subject.progressPercent}%</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded bg-cgray-50 p-4">
                <div className="flex items-center gap-2 text-cgray-500">
                  <Layers3 className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Units</span>
                </div>
                <p className="mt-3 text-2xl font-bold text-cgray-900">{subject.unitCount}</p>
              </div>

              <div className="rounded bg-cgray-50 p-4">
                <div className="flex items-center gap-2 text-cgray-500">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Lessons</span>
                </div>
                <p className="mt-3 text-2xl font-bold text-cgray-900">{subject.lessonCount}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-cgray-600">Progress</span>
                <span className="font-semibold text-cgray-900">
                  {subject.completedLessons} / {subject.lessonCount}
                </span>
              </div>
              <div className="w-full bg-cgray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cblue-500 h-2 rounded-full"
                  style={{ width: `${subject.progressPercent}%` }}
                />
              </div>
            </div>

            <Link
              href={subject.ctaHref}
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 hover:no-underline ${
                subject.ctaLabel === 'Continue'
                  ? 'btn-primary btn-sm'
                  : 'btn-secondary btn-sm border-cgray-800 text-cgray-900 hover:bg-cgray-50'
              }`}
            >
              {subject.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
