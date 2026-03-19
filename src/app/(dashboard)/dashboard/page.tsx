'use client';

import { useEffect, useMemo, useState } from 'react';
import EmojiIcon from '@/components/accessibility/EmojiIcon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { ArrowRight, BookOpen, Flame, GraduationCap, Sparkles, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth, db } from '@/lib/firebase';
import { SUBJECT_MAP, SYLLABUS } from '@/lib/constants';
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

const QUICK_ACTIONS = [
  {
    title: 'AI Tutor',
    description: 'Ask for step-by-step explanations whenever you get stuck.',
    href: '/dashboard/ai-tutor',
    icon: Sparkles,
  },
  {
    title: 'Past Papers',
    description: 'Jump into timed practice and review past paper solutions.',
    href: '/dashboard/past-papers',
    icon: Target,
  },
  {
    title: 'Achievements',
    description: 'Track your level, streak, and unlocked milestones.',
    href: '/dashboard/achievements',
    icon: Trophy,
  },
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

function getAllGeneratedLessons(subjectId: SubjectId) {
  const syllabus = SYLLABUS[subjectId] ?? [];
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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 animate-pulse rounded-full bg-cgray-100" />
          <div className="space-y-3">
            <div className="h-8 w-56 animate-pulse rounded bg-cgray-100" />
            <div className="h-5 w-64 animate-pulse rounded bg-cgray-100" />
          </div>
        </div>
        <div className="h-10 w-32 animate-pulse rounded bg-cgray-100" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="c-card h-32 p-4">
            <div className="h-full animate-pulse rounded bg-cgray-50" />
          </div>
        ))}
      </div>

      <div className="c-card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="h-16 w-1.5 animate-pulse rounded-full bg-cgray-100" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-28 animate-pulse rounded bg-cgray-100" />
            <div className="h-6 w-72 animate-pulse rounded bg-cgray-100" />
            <div className="h-4 w-48 animate-pulse rounded bg-cgray-100" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded bg-cgray-100" />
        </div>
      </div>

      <div className="c-card p-5">
        <div className="space-y-3">
          <div className="h-6 w-48 animate-pulse rounded bg-cgray-100" />
          <div className="h-4 w-80 animate-pulse rounded bg-cgray-100" />
          <div className="h-10 w-40 animate-pulse rounded bg-cgray-100" />
        </div>
      </div>

      <div>
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-cgray-100" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="c-card h-44 p-4">
              <div className="h-full animate-pulse rounded bg-cgray-50" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 h-6 w-36 animate-pulse rounded bg-cgray-100" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="c-card h-36 p-5">
              <div className="h-full animate-pulse rounded bg-cgray-50" />
            </div>
          ))}
        </div>
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

          const strictCompletedCount = progressRecords.filter((record) => record.status === 'completed').length;
          const masteryCompletedCount = progressRecords.filter((record) => isCompletedStatus(record.status)).length;
          const lessonsCompleted = strictCompletedCount > 0 ? strictCompletedCount : masteryCompletedCount;

          const accuracyScoreValues = progressRecords
            .map((record) => (typeof record.accuracyScore === 'number' ? record.accuracyScore : null))
            .filter((value): value is number => typeof value === 'number');
          const accuracyValues =
            accuracyScoreValues.length > 0
              ? accuracyScoreValues
              : progressRecords
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
      <div className="c-card p-6 text-cgray-700">
        We could not load your dashboard right now. Please refresh and try again.
      </div>
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
    },
    {
      label: 'Level',
      value: `${dashboardState.level}`,
      detail: dashboardState.levelLabel,
      icon: GraduationCap,
    },
    {
      label: 'Streak',
      value: `${dashboardState.currentStreak}`,
      detail: 'current days',
      icon: Flame,
    },
    {
      label: 'Lessons',
      value: `${dashboardState.lessonsCompleted}`,
      detail: 'completed',
      icon: BookOpen,
    },
    {
      label: 'Accuracy',
      value: dashboardState.averageAccuracy !== null ? `${dashboardState.averageAccuracy}%` : 'No data yet',
      detail: dashboardState.averageAccuracy !== null ? 'average accuracy' : 'no lessons attempted',
      icon: Target,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {dashboardState.photoURL ? (
            <img
              src={dashboardState.photoURL}
              alt={dashboardState.displayName}
              className="h-14 w-14 rounded-full border border-cgray-200 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cblue-500 text-sm font-bold text-white">
              {getInitials(dashboardState.displayName)}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-cgray-900">
              {dashboardState.greeting}, {dashboardState.firstName}!
            </h1>
            <p className="mt-1 text-base text-cgray-600">
              Level {dashboardState.level} {dashboardState.levelLabel} with {dashboardState.xpTotal.toLocaleString()} XP.
            </p>
          </div>
        </div>

        <Link href={dashboardState.continueHref}>
          <Button className="btn-primary btn-sm h-auto border-0 shadow-none">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`c-card p-4 ${stat.label === 'Streak' ? 'border-l-4 border-l-orange-400' : ''}`}
          >
            <stat.icon className={`mb-2 h-5 w-5 ${stat.label === 'Streak' ? 'text-orange-500' : 'text-cblue-500'}`} />
            <p className="text-2xl font-bold text-cgray-900">{stat.value}</p>
            <p className="mt-0.5 text-sm text-cgray-600">{stat.label}</p>
            <p className="mt-2 text-xs text-cgray-600">{stat.detail}</p>
          </div>
        ))}
      </div>

      <div className="c-card p-5 mt-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="w-1.5 h-16 bg-cblue-500 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-cblue-500 uppercase tracking-wider">Continue Learning</p>
          <p className="mt-0.5 text-base font-semibold text-cgray-900">{dashboardState.continueTitle}</p>
          <p className="text-sm text-cgray-600">{dashboardState.continueSubtitle}</p>
        </div>
        <Link href={dashboardState.continueHref}>
          <Button className="btn-primary btn-sm h-auto border-0 shadow-none flex-shrink-0">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {dashboardState.lessonsCompleted === 0 ? (
        <div className="c-card p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-cblue-50 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-cblue-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-cgray-900">Welcome</h2>
              <p className="mt-1 text-sm text-cgray-600">
                Ready to start your A/L journey? Your first lesson is waiting and it only takes 15 minutes.
              </p>
              <Link href={firstLessonHref}>
                <Button className="btn-primary btn-sm h-auto border-0 shadow-none mt-5">
                  Start My First Lesson
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="c-card p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-cblue-50 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-5 w-5 text-cblue-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-cgray-900">Momentum</h2>
              <p className="mt-1 text-sm text-cgray-600">
                Keep your streak alive, build your XP, and move through your enrolled subjects one lesson at a time.
              </p>
              <Link href="/dashboard/subjects">
                <Button className="btn-primary btn-sm h-auto border-0 shadow-none mt-5">
                  View My Subjects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-cgray-900 mt-8 mb-4">Subject Progress</h2>

        {dashboardState.enrolledSubjectCards.length === 0 ? (
          <div className="c-card p-6 text-center">
            <p className="text-base font-semibold text-cgray-900">No enrolled subjects yet</p>
            <p className="mt-3 text-sm leading-6 text-cgray-600">
              Choose your A/L subjects to unlock a personalized dashboard and progress tracking.
            </p>
            <Link href="/subjects">
              <Button className="btn-secondary h-auto mt-5 border-cgray-800 text-cgray-900 hover:bg-cgray-50">
                Browse Subjects
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {dashboardState.enrolledSubjectCards.map((subject) => (
              <Link
                key={subject.id}
                href={subject.href}
                className="c-card p-4 cursor-pointer hover:-translate-y-0.5 transition-all duration-200 hover:no-underline"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-2xl"
                    style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
                  >
                    <EmojiIcon emoji={subject.icon} label={subject.name} decorative className="text-2xl" />
                  </div>
                  <h3 className="text-base font-semibold text-cgray-900">{subject.name}</h3>
                </div>

                <div className="w-full bg-cgray-100 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-cblue-500 h-2 rounded-full"
                    style={{ width: `${subject.completionPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-cgray-600">
                  <span>{subject.completedLessons}/{subject.totalLessons} lessons</span>
                  <span>{subject.completionPercent}%</span>
                </div>

                <p className="text-sm text-cgray-700 mt-2 truncate">Up next: {subject.upNextTitle}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-cgray-900 mt-8 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="c-card p-5 cursor-pointer hover:shadow-card-hover transition-shadow hover:no-underline"
            >
              <div className="w-10 h-10 rounded-lg bg-cblue-50 flex items-center justify-center mb-3">
                <action.icon className="h-5 w-5 text-cblue-500" />
              </div>
              <h3 className="text-base font-semibold text-cgray-900">{action.title}</h3>
              <p className="text-sm text-cgray-600 mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
