'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { ArrowRight, BookOpen, Flame, GraduationCap, Sparkles, Target, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth, db } from '@/lib/firebase';
import { SUBJECT_MAP, SUBJECTS } from '@/lib/constants';
import { getGeneratedLessons } from '@/lib/dashboard-intelligence';
import { SubjectId } from '@/lib/types';

interface ProgressRecord {
  lessonId: string;
  subjectId: string;
  unitId?: string;
  status?: string;
  accuracy?: number;
  accuracyScore?: number;
}

interface SubjectCardData {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  completionPercent: number;
  completedLessons: number;
  totalLessons: number;
  upNextTitle: string;
  href: string;
}

interface LastVisitedLesson {
  subjectId?: string;
  unitId?: string;
  lessonId?: string;
  lessonTitle?: string;
  href?: string;
}

interface DashboardState {
  displayName: string;
  firstName: string;
  photoURL: string | null;
  greeting: string;
  xpTotal: number;
  level: number;
  levelLabel: string;
  nextThreshold: number | null;
  xpToNext: number;
  currentStreak: number;
  lessonsCompleted: number;
  averageAccuracy: number | null;
  continueHref: string;
  continueTitle: string;
  continueSubtitle: string;
  enrolledSubjectCards: SubjectCardData[];
}

const LEVELS = [
  { level: 1, label: 'Beginner', threshold: 0 },
  { level: 2, label: 'Student', threshold: 500 },
  { level: 3, label: 'Scholar', threshold: 1500 },
  { level: 4, label: 'Advanced', threshold: 3500 },
  { level: 5, label: 'Expert', threshold: 7000 },
  { level: 6, label: 'Master', threshold: 12000 },
  { level: 7, label: 'Champion', threshold: 20000 },
  { level: 8, label: 'Ranker', threshold: 35000 },
  { level: 9, label: 'Island Ranker', threshold: 60000 },
  { level: 10, label: 'Legend', threshold: 100000 },
] as const;

function getGreeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getLevelFromXp(xpTotal: number) {
  const current = [...LEVELS].reverse().find((entry) => xpTotal >= entry.threshold) ?? LEVELS[0];
  const next = LEVELS.find((entry) => entry.level === current.level + 1) ?? null;

  return {
    level: current.level,
    label: current.label,
    nextThreshold: next?.threshold ?? null,
    xpToNext: next ? Math.max(0, next.threshold - xpTotal) : 0,
  };
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function isSubjectId(value: string): value is SubjectId {
  return value in SUBJECT_MAP;
}

function isCompletedStatus(status?: string) {
  return status === 'completed' || status === 'proficient' || status === 'mastered';
}

function getAccuracyValue(progress: ProgressRecord) {
  if (typeof progress.accuracyScore === 'number') return progress.accuracyScore;
  if (typeof progress.accuracy === 'number') return progress.accuracy;
  return null;
}

function getFirstLessonForSubject(subjectId: SubjectId) {
  const firstUnit = SUBJECTS.find((subject) => subject.id === subjectId);
  if (!firstUnit) return null;

  const subjectLessons = Object.values(SUBJECT_MAP)
    .filter((subject) => subject.id === subjectId)
    .flatMap(() => {
      const allUnits = require('@/lib/constants').SYLLABUS[subjectId] as Array<{ id: string }>;
      return allUnits.flatMap((unit) => getGeneratedLessons(subjectId, unit.id));
    });

  return subjectLessons[0] ?? null;
}

function getAllGeneratedLessons(subjectId: SubjectId) {
  const syllabus = require('@/lib/constants').SYLLABUS[subjectId] as Array<{ id: string }>;
  return syllabus.flatMap((unit) => getGeneratedLessons(subjectId, unit.id));
}

function resolveSubjectCard(params: {
  subjectId: SubjectId;
  subjectDoc: Record<string, unknown> | null;
  progressRecords: ProgressRecord[];
  lastVisitedLesson: LastVisitedLesson | null;
}) {
  const { subjectId, subjectDoc, progressRecords, lastVisitedLesson } = params;
  const fallbackSubject = SUBJECT_MAP[subjectId];
  const totalLessons =
    (typeof subjectDoc?.totalLessons === 'number' ? subjectDoc.totalLessons : null) ??
    fallbackSubject.lessonCount;
  const completedLessons = progressRecords.filter((entry) => isCompletedStatus(entry.status)).length;
  const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const generatedLessons = getAllGeneratedLessons(subjectId);
  const nextLesson =
    generatedLessons.find((lesson) => !isCompletedStatus(progressRecords.find((entry) => entry.lessonId === lesson.lessonId)?.status)) ??
    generatedLessons[0] ??
    null;

  const href =
    lastVisitedLesson?.subjectId === subjectId && lastVisitedLesson.href
      ? lastVisitedLesson.href
      : nextLesson?.href ?? `/dashboard/subjects/${subjectId}`;

  const upNextTitle =
    lastVisitedLesson?.subjectId === subjectId && lastVisitedLesson.lessonTitle
      ? lastVisitedLesson.lessonTitle
      : nextLesson?.lessonTitle ?? 'Start your first lesson';

  return {
    id: subjectId,
    name:
      (typeof subjectDoc?.nameEn === 'string' && subjectDoc.nameEn) ||
      (typeof subjectDoc?.name === 'string' && subjectDoc.name) ||
      fallbackSubject.name,
    icon:
      (typeof subjectDoc?.icon === 'string' && subjectDoc.icon) ||
      fallbackSubject.icon,
    color:
      (typeof subjectDoc?.colorHex === 'string' && subjectDoc.colorHex) ||
      (typeof subjectDoc?.color === 'string' && subjectDoc.color) ||
      fallbackSubject.color,
    completionPercent,
    completedLessons,
    totalLessons,
    upNextTitle,
    href,
  } satisfies SubjectCardData;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <Card className="border-white/10 bg-[#0b101a] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-white/10" />
            <div className="space-y-3">
              <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
              <div className="h-10 w-64 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-40 animate-pulse rounded bg-white/5" />
            </div>
          </div>
          <div className="h-12 w-44 animate-pulse rounded-xl bg-white/[0.04]" />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="h-32 animate-pulse border-white/10 bg-[#0b101a]" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="h-56 animate-pulse border-white/10 bg-[#0b101a]" />
        <Card className="h-56 animate-pulse border-white/10 bg-[#0b101a]" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-44 animate-pulse border-white/10 bg-[#0b101a]" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null);

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!isActive) return;

        setLoading(true);

        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        try {
          const [userSnap, gamificationSnap, progressSnap] = await Promise.all([
            getDoc(doc(db, 'users', currentUser.uid)),
            getDoc(doc(db, 'gamification', currentUser.uid)),
            getDocs(collection(db, 'studentProgress', currentUser.uid, 'lessons')),
          ]);

          const userData = userSnap.data() as Record<string, unknown> | undefined;
          const gamificationData = gamificationSnap.data() as Record<string, unknown> | undefined;
          const progressRecords = progressSnap.docs.map((snapshot) => ({
            lessonId: snapshot.id,
            ...(snapshot.data() as Omit<ProgressRecord, 'lessonId'>),
          }));

          const displayName = currentUser.displayName || (typeof userData?.displayName === 'string' ? userData.displayName : '') || 'Student';
          const firstName = displayName.split(' ')[0] || 'Student';
          const xpTotal = typeof gamificationData?.xpTotal === 'number' ? gamificationData.xpTotal : 0;
          const levelInfo = getLevelFromXp(xpTotal);
          const currentStreak = typeof gamificationData?.currentStreak === 'number' ? gamificationData.currentStreak : 0;
          const lessonsCompleted = progressRecords.filter((record) => isCompletedStatus(record.status)).length;
          const accuracyValues = progressRecords
            .map((record) => getAccuracyValue(record))
            .filter((value): value is number => typeof value === 'number');
          const averageAccuracy =
            accuracyValues.length > 0
              ? Math.round(accuracyValues.reduce((sum, value) => sum + value, 0) / accuracyValues.length)
              : null;
          const enrolledSubjects = Array.isArray(userData?.enrolledSubjects)
            ? userData.enrolledSubjects.filter((subject): subject is SubjectId => typeof subject === 'string' && isSubjectId(subject))
            : [];
          const lastVisitedLesson =
            userData?.lastVisitedLesson && typeof userData.lastVisitedLesson === 'object'
              ? (userData.lastVisitedLesson as LastVisitedLesson)
              : null;

          const subjectDocs = await Promise.all(
            enrolledSubjects.map(async (subjectId) => {
              const subjectSnap = await getDoc(doc(db, 'subjects', subjectId));
              return {
                subjectId,
                data: subjectSnap.exists() ? (subjectSnap.data() as Record<string, unknown>) : null,
              };
            })
          );

          if (!isActive) return;

          const enrolledSubjectCards = subjectDocs.map(({ subjectId, data }) =>
            resolveSubjectCard({
              subjectId,
              subjectDoc: data,
              progressRecords: progressRecords.filter((record) => record.subjectId === subjectId),
              lastVisitedLesson,
            })
          );

          const firstSubject = enrolledSubjects[0];
          const firstLesson = firstSubject ? getAllGeneratedLessons(firstSubject)[0] ?? null : null;
          const continueHref =
            (lastVisitedLesson?.href && typeof lastVisitedLesson.href === 'string' ? lastVisitedLesson.href : null) ??
            firstLesson?.href ??
            '/dashboard/subjects';
          const continueTitle =
            (lastVisitedLesson?.lessonTitle && typeof lastVisitedLesson.lessonTitle === 'string' ? lastVisitedLesson.lessonTitle : null) ??
            firstLesson?.lessonTitle ??
            'Start your first lesson';
          const continueSubtitle =
            lastVisitedLesson?.subjectId && isSubjectId(lastVisitedLesson.subjectId)
              ? `Continue ${SUBJECT_MAP[lastVisitedLesson.subjectId].name}`
              : firstSubject
                ? `Start with ${SUBJECT_MAP[firstSubject].name}`
                : 'Your first lesson is ready';

          setDashboardState({
            displayName,
            firstName,
            photoURL: currentUser.photoURL,
            greeting: getGreeting(),
            xpTotal,
            level: levelInfo.level,
            levelLabel: levelInfo.label,
            nextThreshold: levelInfo.nextThreshold,
            xpToNext: levelInfo.xpToNext,
            currentStreak,
            lessonsCompleted,
            averageAccuracy,
            continueHref,
            continueTitle,
            continueSubtitle,
            enrolledSubjectCards,
          });
          setLoading(false);
        } catch (error) {
          console.error('Failed to load dashboard data:', error);
          if (!isActive) return;
          setDashboardState(null);
          setLoading(false);
        }
      },
      () => {
        if (!isActive) return;
        setLoading(false);
      }
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [router]);

  const firstLessonHref = useMemo(() => dashboardState?.continueHref ?? '/dashboard/subjects', [dashboardState]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!dashboardState) {
    return (
      <Card className="border-white/10 bg-[#0b101a] p-6 text-slate-300">
        We could not load your dashboard right now. Please refresh and try again.
      </Card>
    );
  }

  const statCards = [
    {
      label: 'XP',
      value: dashboardState.xpTotal.toLocaleString(),
      detail: dashboardState.nextThreshold
        ? `${dashboardState.xpToNext.toLocaleString()} XP away`
        : 'Max level reached',
      icon: Sparkles,
      accent: 'text-violet-300',
    },
    {
      label: 'Level',
      value: `${dashboardState.level}`,
      detail: dashboardState.levelLabel,
      icon: Trophy,
      accent: 'text-amber-300',
    },
    {
      label: 'Streak',
      value: `${dashboardState.currentStreak}`,
      detail: 'current days',
      icon: Flame,
      accent: 'text-orange-300',
    },
    {
      label: 'Lessons',
      value: `${dashboardState.lessonsCompleted}`,
      detail: 'completed',
      icon: BookOpen,
      accent: 'text-emerald-300',
    },
    {
      label: 'Accuracy',
      value: dashboardState.averageAccuracy !== null ? `${dashboardState.averageAccuracy}%` : 'No data yet',
      detail: dashboardState.averageAccuracy !== null ? 'average accuracy' : 'no lessons attempted',
      icon: Target,
      accent: 'text-cyan-300',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <Card className="overflow-hidden border-white/10 bg-[#0b101a] p-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_60%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {dashboardState.photoURL ? (
              <img
                src={dashboardState.photoURL}
                alt={dashboardState.displayName}
                className="h-16 w-16 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-600 text-lg font-black text-white">
                {getInitials(dashboardState.displayName)}
              </div>
            )}

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                <GraduationCap className="h-3.5 w-3.5" />
                {dashboardState.greeting}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                {dashboardState.greeting}, {dashboardState.firstName}!
              </h1>
              <p className="text-sm text-slate-400">
                Level {dashboardState.level} {dashboardState.levelLabel} with {dashboardState.xpTotal.toLocaleString()} XP.
              </p>
            </div>
          </div>

          <Link href={dashboardState.continueHref}>
            <Button className="h-12 bg-violet-600 text-white hover:bg-violet-500">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-white/10 bg-[#0b101a] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-400">{stat.detail}</p>
              </div>
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.03] ${stat.accent}`}>
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-[#0b101a] p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">Continue where you left off</h2>
              <p className="text-sm text-slate-400">{dashboardState.continueSubtitle}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-2xl font-bold text-white">{dashboardState.continueTitle}</h3>
            <p className="mt-3 text-sm text-slate-300">
              Pick up your latest lesson or jump into the first available lesson if you are just getting started.
            </p>
            <Link href={dashboardState.continueHref}>
              <Button className="mt-5 bg-violet-600 text-white hover:bg-violet-500">
                Continue Lesson
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        {dashboardState.lessonsCompleted === 0 ? (
          <Card className="border-white/10 bg-[#0b101a] p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-white">Welcome</h2>
                <p className="text-sm text-slate-400">A clean start is all you need.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-lg font-semibold text-white">
                Ready to start your A/L journey?
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Your first lesson is waiting - it only takes 15 minutes.
              </p>
              <Link href={firstLessonHref}>
                <Button className="mt-5 bg-emerald-600 text-white hover:bg-emerald-500">
                  Start My First Lesson
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="border-white/10 bg-[#0b101a] p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-white">Momentum</h2>
                <p className="text-sm text-slate-400">Your dashboard is now running on real Firebase progress.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm leading-6 text-slate-300">
                Keep your streak alive, push your XP higher, and move through your enrolled subjects one lesson at a time.
              </p>
              <Link href="/dashboard/subjects">
                <Button className="mt-5 bg-emerald-600 text-white hover:bg-emerald-500">
                  View My Subjects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      <Card className="border-white/10 bg-[#0b101a] p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">My Subjects</h2>
          <p className="text-sm text-slate-400">Only the subjects you enrolled in are shown here, with real completion and the next lesson to tackle.</p>
        </div>

        {dashboardState.enrolledSubjectCards.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <p className="text-lg font-semibold text-white">No enrolled subjects yet</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Choose your A/L subjects to unlock a personalized dashboard and progress tracking.
            </p>
            <Link href="/subjects">
              <Button className="mt-5 bg-white text-black hover:bg-slate-200">
                Browse Subjects
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {dashboardState.enrolledSubjectCards.map((subject) => (
              <div key={subject.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                      style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
                    >
                      {subject.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
                      <p className="text-sm text-slate-400">
                        {subject.completedLessons}/{subject.totalLessons} completed
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 ring-1 ring-white/10">
                    {subject.completionPercent}%
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${subject.completionPercent}%`,
                        background: `linear-gradient(90deg, ${subject.color}, #22c55e)`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-slate-300">
                    Up next: <span className="font-medium text-white">{subject.upNextTitle}</span>
                  </p>
                </div>

                <Link href={subject.href} className="mt-5 inline-flex items-center text-sm font-semibold text-violet-300 hover:text-violet-200">
                  Continue {subject.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
