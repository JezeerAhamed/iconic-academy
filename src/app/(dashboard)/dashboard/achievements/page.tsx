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
  Circle,
  Crown,
  Flame,
  Medal,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
    accentClass: 'text-violet-300',
    aliases: ['first_steps', 'first-steps', 'first steps', 'firststeps'],
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    requirement: 'Maintain a 7-day streak',
    icon: Flame,
    accentClass: 'text-orange-300',
    aliases: ['week_warrior', 'week-warrior', 'week warrior', 'weekwarrior'],
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    requirement: 'Get 100% accuracy in a session',
    icon: Target,
    accentClass: 'text-amber-300',
    aliases: ['sharpshooter', 'sharp_shooter', 'sharp-shooter'],
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    requirement: 'Complete 3 lessons in one day',
    icon: Zap,
    accentClass: 'text-rose-300',
    aliases: ['speed_demon', 'speed-demon', 'speed demon', 'speeddemon'],
  },
  {
    id: 'perfect_paper',
    title: 'Perfect Paper',
    requirement: 'Score 90%+ on a past paper',
    icon: Award,
    accentClass: 'text-emerald-300',
    aliases: ['perfect_paper', 'perfect-paper', 'perfect paper', 'perfectpaper'],
  },
  {
    id: 'einstein',
    title: 'Einstein',
    requirement: 'Complete all Physics units',
    icon: BrainCircuit,
    accentClass: 'text-sky-300',
    aliases: ['einstein'],
  },
  {
    id: 'organic_master',
    title: 'Organic Master',
    requirement: 'Score 80%+ in Chemistry',
    icon: Shield,
    accentClass: 'text-cyan-300',
    aliases: ['organic_master', 'organic-master', 'organic master', 'organicmaster'],
  },
  {
    id: 'island_ranker',
    title: 'Island Ranker',
    requirement: 'Reach Level 9',
    icon: Crown,
    accentClass: 'text-fuchsia-300',
    aliases: ['island_ranker', 'island-ranker', 'island ranker', 'islandranker'],
  },
  {
    id: 'helpful_peer',
    title: 'Helpful Peer',
    requirement: 'Answer a forum question',
    icon: Users,
    accentClass: 'text-pink-300',
    aliases: ['helpful_peer', 'helpful-peer', 'helpful peer', 'helpfulpeer'],
  },
  {
    id: 'bilingual_scholar',
    title: 'Bilingual Scholar',
    requirement: 'Use Tamil mode for 7 days',
    icon: BookOpen,
    accentClass: 'text-teal-300',
    aliases: ['bilingual_scholar', 'bilingual-scholar', 'bilingual scholar', 'bilingualscholar'],
  },
  {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    requirement: 'Return after missing a week',
    icon: Rocket,
    accentClass: 'text-lime-300',
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
      <Card className="border-white/10 bg-[#0b101a] py-6">
        <CardContent className="space-y-6">
          <div className="mx-auto h-4 w-28 animate-pulse rounded bg-white/10" />
          <div className="mx-auto h-14 w-56 animate-pulse rounded bg-white/10" />
          <div className="mx-auto h-4 w-72 animate-pulse rounded bg-white/5" />
          <div className="mx-auto h-3 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-[#0b101a] py-6">
          <CardContent className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
            <div className="h-12 w-48 animate-pulse rounded bg-white/5" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-white/[0.04]" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b101a] py-6">
          <CardContent className="space-y-4">
            <div className="h-6 w-36 animate-pulse rounded bg-white/10" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-white/[0.04]" />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: BADGES.length }).map((_, index) => (
          <Card key={index} className="border-white/10 bg-[#0b101a] py-6">
            <CardContent className="space-y-4">
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
            </CardContent>
          </Card>
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
        <Card className="border-rose-400/20 bg-[#0b101a] py-6">
          <CardContent className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-300">Unable to load achievements</p>
            <h1 className="text-2xl font-black text-white">Something went wrong while loading your rewards.</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const levelProgress = getLevelProgress(snapshot.xpTotal);
  const unlockedBadgeIds = getUnlockedBadgeIds(snapshot.badges);
  const weekStrip = buildWeekStrip(snapshot);

  return (
    <div className="space-y-6 pb-12">
      <Card className="overflow-hidden border-white/10 bg-[#0b101a] py-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.18),transparent_60%)]" />
        <CardContent className="relative space-y-6">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
              <Trophy className="h-8 w-8" />
            </span>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Current level</p>
            <h1 className="mt-3 text-5xl font-black text-white">Level {levelProgress.current.level}</h1>
            <p className="mt-2 text-xl font-semibold text-amber-300">{levelProgress.current.rank}</p>
          </div>

          <div className="mx-auto max-w-2xl space-y-3">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-400">
                {snapshot.xpTotal.toLocaleString()} XP
              </span>
              <span className="font-semibold text-white">
                {levelProgress.next
                  ? `${snapshot.xpTotal.toLocaleString()} / ${levelProgress.next.threshold.toLocaleString()} XP`
                  : `${snapshot.xpTotal.toLocaleString()} XP`}
              </span>
            </div>

            <Progress value={levelProgress.progressPercent} className="gap-0" />

            <p className="text-center text-sm text-slate-300">
              {levelProgress.next
                ? `${levelProgress.remainingXp.toLocaleString()} XP until next level`
                : 'You have reached the highest level.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-[#0b101a] py-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300">
                <Flame className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Streak</CardTitle>
                <p className="text-sm text-slate-400">Your weekly consistency at a glance.</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current streak</p>
                <p className="mt-3 text-3xl font-black text-white">{snapshot.currentStreak}</p>
                <p className="mt-1 text-sm text-slate-400">days</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Longest streak</p>
                <p className="mt-3 text-3xl font-black text-white">{snapshot.longestStreak}</p>
                <p className="mt-1 text-sm text-slate-400">days</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="grid grid-cols-7 gap-2">
                {weekStrip.map((day) => (
                  <div key={day.key} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{day.label}</span>
                    <div
                      className={[
                        'flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold transition',
                        day.studied
                          ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/10 bg-white/[0.03] text-slate-500',
                        day.isToday ? 'ring-2 ring-violet-400/30' : '',
                      ].join(' ')}
                      title={day.shortDate}
                    >
                      {day.studied ? <BadgeCheck className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </div>
                    <span className="text-[11px] text-slate-500">{day.shortDate}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b101a] py-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                <Medal className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Level ladder</CardTitle>
                <p className="text-sm text-slate-400">All ten milestones from Beginner to Legend.</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {LEVELS.map((level) => {
              const isCurrent = level.level === levelProgress.current.level;
              const isPassed = level.level < levelProgress.current.level;

              return (
                <div
                  key={level.level}
                  className={[
                    'flex items-center justify-between rounded-2xl border p-4',
                    isCurrent
                      ? 'border-amber-400/30 bg-amber-400/10'
                      : isPassed
                        ? 'border-emerald-500/20 bg-emerald-500/10'
                        : 'border-white/10 bg-white/[0.03]',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        'inline-flex h-10 w-10 items-center justify-center rounded-full',
                        isCurrent
                          ? 'bg-amber-400/20 text-amber-300'
                          : isPassed
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-white/10 text-slate-500',
                      ].join(' ')}
                    >
                      {isPassed ? <BadgeCheck className="h-5 w-5" /> : isCurrent ? <Trophy className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                    </span>

                    <div>
                      <p className="font-semibold text-white">
                        Level {level.level}: {level.rank}
                      </p>
                      <p className="text-sm text-slate-400">{level.threshold.toLocaleString()} XP</p>
                    </div>
                  </div>

                  {isCurrent ? <span className="text-sm font-semibold text-amber-300">Current</span> : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-[#0b101a] py-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-xl font-semibold text-white">Badges</CardTitle>
              <p className="text-sm text-slate-400">Unlocked badges stay full color. Locked badges show the exact requirement.</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {BADGES.map((badge) => {
              const unlocked = unlockedBadgeIds.has(badge.id);

              return (
                <div
                  key={badge.id}
                  className={[
                    'rounded-3xl border p-5 transition',
                    unlocked
                      ? 'border-white/10 bg-white/[0.03]'
                      : 'border-white/10 bg-black/20 grayscale',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={[
                        'inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06]',
                        unlocked ? badge.accentClass : 'text-slate-500',
                      ].join(' ')}
                    >
                      <badge.icon className="h-6 w-6" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{badge.title}</h3>
                          <p className="mt-2 text-sm text-slate-400">
                            {unlocked ? 'Unlocked' : badge.requirement}
                          </p>
                        </div>

                        {unlocked ? <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-300" /> : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
