'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  Award,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  Check,
  Crown,
  Flame,
  Lock,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';

const SRI_LANKA_TIME_ZONE = 'Asia/Colombo';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const LEVELS = [
  { level: 1, rank: 'Beginner', threshold: 0 },
  { level: 2, rank: 'Student', threshold: 500 },
  { level: 3, rank: 'Scholar', threshold: 1500 },
  { level: 4, rank: 'Advanced', threshold: 3500 },
  { level: 5, rank: 'Expert', threshold: 7000 },
  { level: 6, rank: 'Master', threshold: 12000 },
  { level: 7, rank: 'Champion', threshold: 20000 },
  { level: 8, rank: 'Ranker', threshold: 35000 },
  { level: 9, rank: 'Island Ranker', threshold: 60000 },
  { level: 10, rank: 'Legend', threshold: 100000 },
] as const;

type BadgeIcon =
  | typeof Star
  | typeof Flame
  | typeof Target
  | typeof Zap
  | typeof Award
  | typeof BrainCircuit
  | typeof Shield
  | typeof Crown
  | typeof Users
  | typeof BookOpen
  | typeof Rocket;

interface GamificationSnapshot {
  xpTotal: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  badges: string[];
  streakDays: boolean[] | null;
  studyDates: string[];
}

interface BadgeDefinition {
  id: string;
  title: string;
  requirement: string;
  icon: BadgeIcon;
  accentClass: string;
  aliases: string[];
}

interface WeekDayCell {
  key: string;
  label: string;
  shortDate: string;
  studied: boolean;
  isToday: boolean;
}

const BADGES: BadgeDefinition[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    requirement: 'Complete your first lesson',
    icon: Star,
    accentClass: 'text-cblue-500',
    aliases: ['first_steps', 'first-steps', 'first steps', 'firststeps'],
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    requirement: 'Maintain a 7-day streak',
    icon: Flame,
    accentClass: 'text-orange-500',
    aliases: ['week_warrior', 'week-warrior', 'week warrior', 'weekwarrior'],
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    requirement: 'Get 100% accuracy in a session',
    icon: Target,
    accentClass: 'text-cyellow-500',
    aliases: ['sharpshooter', 'sharp_shooter', 'sharp-shooter'],
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    requirement: 'Complete 3 lessons in one day',
    icon: Zap,
    accentClass: 'text-cblue-500',
    aliases: ['speed_demon', 'speed-demon', 'speed demon', 'speeddemon'],
  },
  {
    id: 'perfect_paper',
    title: 'Perfect Paper',
    requirement: 'Score 90%+ on a past paper',
    icon: Award,
    accentClass: 'text-cgreen-500',
    aliases: ['perfect_paper', 'perfect-paper', 'perfect paper', 'perfectpaper'],
  },
  {
    id: 'einstein',
    title: 'Einstein',
    requirement: 'Complete all Physics units',
    icon: BrainCircuit,
    accentClass: 'text-cblue-500',
    aliases: ['einstein'],
  },
  {
    id: 'organic_master',
    title: 'Organic Master',
    requirement: 'Score 80%+ in Chemistry',
    icon: Shield,
    accentClass: 'text-cgreen-500',
    aliases: ['organic_master', 'organic-master', 'organic master', 'organicmaster'],
  },
  {
    id: 'island_ranker',
    title: 'Island Ranker',
    requirement: 'Reach Level 9',
    icon: Crown,
    accentClass: 'text-cblue-500',
    aliases: ['island_ranker', 'island-ranker', 'island ranker', 'islandranker'],
  },
  {
    id: 'helpful_peer',
    title: 'Helpful Peer',
    requirement: 'Answer a forum question',
    icon: Users,
    accentClass: 'text-cblue-500',
    aliases: ['helpful_peer', 'helpful-peer', 'helpful peer', 'helpfulpeer'],
  },
  {
    id: 'bilingual_scholar',
    title: 'Bilingual Scholar',
    requirement: 'Use Tamil mode for 7 days',
    icon: BookOpen,
    accentClass: 'text-cblue-500',
    aliases: ['bilingual_scholar', 'bilingual-scholar', 'bilingual scholar', 'bilingualscholar'],
  },
  {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    requirement: 'Return after missing a week',
    icon: Rocket,
    accentClass: 'text-cblue-500',
    aliases: ['comeback_kid', 'comeback-kid', 'comeback kid', 'comebackkid'],
  },
];

function parseNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === 'object' && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    const converted = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(converted.getTime()) ? null : converted;
  }

  const converted = new Date(value as string | number | Date);
  return Number.isNaN(converted.getTime()) ? null : converted;
}

function getDateKey(date: Date, timeZone = SRI_LANKA_TIME_ZONE) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function startOfCurrentWeek(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SRI_LANKA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === 'year')?.value ?? '0');
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? '0');
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? '0');
  const weekdayLabel = parts.find((part) => part.type === 'weekday')?.value ?? 'Mon';
  const weekdayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayIndex = Math.max(0, weekdayOrder.indexOf(weekdayLabel));
  const localStamp = Date.UTC(year, month - 1, day);

  return new Date(localStamp - dayIndex * DAY_IN_MS);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: SRI_LANKA_TIME_ZONE,
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function normalizeString(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getUnlockedBadgeIds(badges: string[]) {
  const normalizedBadges = new Set(badges.map((badge) => normalizeString(badge)));

  return new Set(
    BADGES.filter((badge) =>
      badge.aliases.some((alias) => normalizedBadges.has(normalizeString(alias))) ||
      normalizedBadges.has(normalizeString(badge.title))
    ).map((badge) => badge.id)
  );
}

function getLevelProgress(totalXp: number) {
  const current = [...LEVELS].reverse().find((level) => totalXp >= level.threshold) ?? LEVELS[0];
  const currentIndex = LEVELS.findIndex((level) => level.level === current.level);
  const next = LEVELS[currentIndex + 1] ?? null;

  if (!next) {
    return {
      current,
      next: null,
      progressPercent: 100,
      remainingXp: 0,
    };
  }

  const range = next.threshold - current.threshold;
  const progressPercent = Math.min(100, Math.max(0, ((totalXp - current.threshold) / range) * 100));

  return {
    current,
    next,
    progressPercent,
    remainingXp: Math.max(0, next.threshold - totalXp),
  };
}

function extractStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string');
}

function buildWeekStrip(snapshot: GamificationSnapshot, now = new Date()): WeekDayCell[] {
  const weekStart = startOfCurrentWeek(now);
  const todayKey = getDateKey(now);

  if (snapshot.streakDays && snapshot.streakDays.length === 7) {
    return snapshot.streakDays.map((studied, index) => {
      const date = new Date(weekStart.getTime() + index * DAY_IN_MS);
      const key = getDateKey(date);
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      return {
        key,
        label: labels[index],
        shortDate: formatShortDate(date),
        studied,
        isToday: key === todayKey,
      };
    });
  }

  const studiedKeys = new Set(snapshot.studyDates);

  if (studiedKeys.size === 0 && snapshot.currentStreak > 0 && snapshot.lastActivityDate) {
    for (let offset = 0; offset < snapshot.currentStreak; offset += 1) {
      studiedKeys.add(getDateKey(new Date(snapshot.lastActivityDate.getTime() - offset * DAY_IN_MS)));
    }
  }

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return labels.map((label, index) => {
    const date = new Date(weekStart.getTime() + index * DAY_IN_MS);
    const key = getDateKey(date);

    return {
      key,
      label,
      shortDate: formatShortDate(date),
      studied: studiedKeys.has(key),
      isToday: key === todayKey,
    };
  });
}

function readGamificationSnapshot(data: Record<string, unknown> | undefined): GamificationSnapshot {
  const rawStudyDates = [
    ...extractStringArray(data?.studyDates),
    ...extractStringArray(data?.activityDates),
    ...extractStringArray(data?.activeDayKeys),
  ];

  return {
    xpTotal: parseNumber(data?.xpTotal),
    currentStreak: parseNumber(data?.currentStreak ?? data?.streak),
    longestStreak: parseNumber(data?.longestStreak ?? data?.bestStreak),
    lastActivityDate: toDate(data?.lastActivityDate),
    badges: extractStringArray(data?.badges),
    streakDays:
      Array.isArray(data?.streakDays) && data?.streakDays.length === 7
        ? data.streakDays.map((value) => Boolean(value))
        : null,
    studyDates: rawStudyDates,
  };
}

function AchievementsLoadingSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-56 animate-pulse rounded bg-cgray-100" />
        <div className="h-5 w-80 animate-pulse rounded bg-cgray-100" />
      </div>

      <div className="c-card p-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-40 animate-pulse rounded bg-cgray-100" />
            <div className="h-10 w-28 animate-pulse rounded bg-cgray-100" />
          </div>
          <div className="h-3 w-full animate-pulse rounded-full bg-cgray-100" />
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-14 w-10 animate-pulse rounded bg-cgray-50" />
            ))}
          </div>
        </div>
      </div>

      <div className="c-card p-5 mb-6">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 animate-pulse rounded-xl bg-cgray-100" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-36 animate-pulse rounded bg-cgray-100" />
            <div className="h-4 w-48 animate-pulse rounded bg-cgray-100" />
            <div className="flex gap-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="h-8 w-8 animate-pulse rounded bg-cgray-100" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: BADGES.length }).map((_, index) => (
          <div key={index} className="c-card p-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-14 w-14 animate-pulse rounded-xl bg-cgray-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-cgray-100" />
              <div className="h-4 w-full animate-pulse rounded bg-cgray-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-cgray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<GamificationSnapshot>({
    xpTotal: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    badges: [],
    streakDays: null,
    studyDates: [],
  });

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
        const gamificationSnap = await getDoc(doc(db, 'gamification', firebaseUser.uid));

        if (!isActive) return;

        const nextSnapshot = readGamificationSnapshot(
          gamificationSnap.exists() ? (gamificationSnap.data() as Record<string, unknown>) : undefined
        );

        setSnapshot(nextSnapshot);
        setLoading(false);
      } catch (fetchError) {
        console.error('Failed to load achievements data', fetchError);

        if (!isActive) return;

        setError('We could not load your achievements right now. Please try again in a moment.');
        setLoading(false);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [router]);

  if (loading) {
    return <AchievementsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="pb-12">
        <div className="c-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cred-500">Unable to load achievements</p>
          <h1 className="mt-2 text-2xl font-bold text-cgray-900">Something went wrong while loading your rewards.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-cgray-600">{error}</p>
        </div>
      </div>
    );
  }

  const levelProgress = getLevelProgress(snapshot.xpTotal);
  const unlockedBadgeIds = getUnlockedBadgeIds(snapshot.badges);
  const weekStrip = buildWeekStrip(snapshot);

  return (
    <div className="space-y-6 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cgray-900">Achievements & Progress</h1>
        <p className="text-base text-cgray-600 mt-1">
          Track your level, streaks, and unlocked milestones as your A/L journey moves forward.
        </p>
      </div>

      <div className="c-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cblue-50 rounded text-cblue-600 font-semibold text-sm">
            <Trophy className="h-4 w-4" />
            <span>Level {levelProgress.current.level} {levelProgress.current.rank}</span>
          </div>
          <div className="text-2xl font-bold text-cgray-900">{snapshot.xpTotal.toLocaleString()} XP</div>
        </div>

        <div className="flex justify-between text-sm text-cgray-500 mb-2">
          <span>
            {levelProgress.next
              ? `${levelProgress.current.rank} to ${levelProgress.next.rank}`
              : 'Highest level reached'}
          </span>
          <span>
            {levelProgress.next
              ? `${snapshot.xpTotal.toLocaleString()} / ${levelProgress.next.threshold.toLocaleString()} XP`
              : `${snapshot.xpTotal.toLocaleString()} XP`}
          </span>
        </div>

        <div className="w-full bg-cgray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-cblue-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${levelProgress.progressPercent}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-cgray-500">
          {levelProgress.next
            ? `${levelProgress.remainingXp.toLocaleString()} XP until next level`
            : 'You have reached the highest level.'}
        </p>

        <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-2">
          {LEVELS.map((level, index) => {
            const isCompleted = level.level < levelProgress.current.level;
            const isCurrent = level.level === levelProgress.current.level;

            return (
              <div key={level.level} className="flex items-start">
                <div className="flex flex-col items-center gap-1 flex-shrink-0 min-w-[52px]">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-cblue-500 flex items-center justify-center">
                      <Check className="text-white w-3 h-3" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-7 h-7 rounded-full border-2 border-cblue-500 bg-white flex items-center justify-center">
                      <span className="text-cblue-500 text-xs font-bold">{level.level}</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-cgray-100 flex items-center justify-center">
                      <span className="text-cgray-400 text-[10px] font-bold">{level.level}</span>
                    </div>
                  )}
                  <span className="text-[9px] text-cgray-500 whitespace-nowrap">{level.rank}</span>
                </div>

                {index < LEVELS.length - 1 ? (
                  <div
                    className={`w-4 h-0.5 flex-shrink-0 mt-3 ${isCompleted ? 'bg-cblue-500' : 'bg-cgray-200'}`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="c-card p-5 mb-6 flex items-start gap-5">
        <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
          <Flame className="text-orange-500 w-8 h-8" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-3xl font-bold text-cgray-900">{snapshot.currentStreak} days</div>
              <div className="text-sm text-cgray-500">Current streak</div>
              <div className="text-xs text-cgray-400 mt-0.5">Personal best: {snapshot.longestStreak} days</div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cgray-50 text-sm text-cgray-600">
              <BadgeCheck className="w-4 h-4 text-cblue-500" />
              Keep the streak alive today
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto">
            {weekStrip.map((day) => {
              const cellClass = day.isToday
                ? 'w-8 h-8 rounded border-2 border-cblue-500 bg-cblue-25 flex items-center justify-center'
                : day.studied
                  ? 'w-8 h-8 rounded bg-cblue-500 flex items-center justify-center'
                  : 'w-8 h-8 rounded bg-cgray-100 flex items-center justify-center';
              const textClass = day.isToday
                ? 'text-cblue-500 text-xs font-semibold'
                : day.studied
                  ? 'text-white text-xs font-semibold'
                  : 'text-cgray-400 text-xs';

              return (
                <div key={day.key} className="flex flex-col items-center gap-1">
                  <div className={cellClass} title={day.shortDate}>
                    <span className={textClass}>{day.label.slice(0, 1)}</span>
                  </div>
                  <span className="text-[10px] text-cgray-400">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {BADGES.map((badge) => {
          const unlocked = unlockedBadgeIds.has(badge.id);

          return (
            <div
              key={badge.id}
              className={`c-card p-4 flex flex-col items-center text-center gap-2 ${unlocked ? '' : 'opacity-50 grayscale'}`}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-cblue-50 flex items-center justify-center">
                  <badge.icon className={`w-7 h-7 ${unlocked ? badge.accentClass : 'text-cgray-400'}`} />
                </div>
                {!unlocked ? (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-cgray-300 rounded-full flex items-center justify-center">
                    <Lock className="text-white w-2.5 h-2.5" />
                  </span>
                ) : null}
              </div>

              <p className="text-sm font-semibold text-cgray-900">{badge.title}</p>
              <p className="text-xs text-cgray-500 leading-snug">{badge.requirement}</p>
              {unlocked ? (
                <p className="text-xs text-cgreen-500 font-semibold">Unlocked</p>
              ) : (
                <p className="text-xs text-cgray-400">Requirement not met yet</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
