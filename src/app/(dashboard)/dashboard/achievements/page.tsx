'use client';

import {
  Award,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
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
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  ACHIEVEMENT_LEVELS,
  DashboardAnalyticsSnapshot,
  StudyCalendarDay,
  formatShortDate,
} from '@/lib/dashboard-intelligence';
import { useDashboardAnalytics } from '@/lib/use-dashboard-analytics';

interface BadgeCardData {
  id: string;
  title: string;
  description: string;
  requirement: string;
  unlocked: boolean;
  unlockedAt?: Date | null;
  progressPercent?: number;
  progressLabel?: string;
  icon: typeof Target;
  accent: string;
}

function CalendarCell({ day }: { day: StudyCalendarDay }) {
  const colors = [
    'bg-slate-800',
    'bg-violet-900/70',
    'bg-violet-700/80',
    'bg-violet-500/85',
    'bg-violet-400',
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={[
          'h-8 w-8 rounded-md border',
          day.didStudy ? colors[day.intensity] : colors[0],
          day.isToday ? 'border-white ring-1 ring-violet-400/70' : 'border-white/5',
        ].join(' ')}
      />
      <span className="text-[10px] text-slate-500">{day.dayOfMonth}</span>
    </div>
  );
}

function buildBadgeData(analytics: DashboardAnalyticsSnapshot): BadgeCardData[] {
  const today = new Date();
  const weekWarriorDate = analytics.currentStreak >= 7 || analytics.personalBestStreak >= 7 ? today : null;
  const speedDemonUnlocked = analytics.highestDailyCompletedLessons >= 3;

  return [
    {
      id: 'first_steps',
      title: 'First Steps',
      description: 'Complete your first lesson.',
      requirement: 'Complete 1 lesson to unlock',
      unlocked: analytics.lessonsCompleted >= 1,
      unlockedAt: analytics.firstLessonUnlockedAt,
      icon: Star,
      accent: 'text-violet-300',
    },
    {
      id: 'week_warrior',
      title: 'Week Warrior',
      description: 'Study 7 days in a row.',
      requirement: 'Study 7 days in a row',
      unlocked: analytics.currentStreak >= 7 || analytics.personalBestStreak >= 7,
      unlockedAt: weekWarriorDate,
      icon: Flame,
      accent: 'text-orange-300',
    },
    {
      id: 'sharpshooter',
      title: 'Sharpshooter',
      description: 'Get all questions right in one session.',
      requirement: 'Get all questions right',
      unlocked: Boolean(analytics.firstPerfectAccuracyAt),
      unlockedAt: analytics.firstPerfectAccuracyAt,
      icon: Target,
      accent: 'text-amber-300',
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Complete 3 lessons in one day.',
      requirement: 'Complete 3 lessons in a day',
      unlocked: speedDemonUnlocked,
      unlockedAt: speedDemonUnlocked ? today : null,
      progressPercent: Math.min(100, Math.round((analytics.highestDailyCompletedLessons / 3) * 100)),
      progressLabel: `${analytics.highestDailyCompletedLessons}/3 lessons`,
      icon: Zap,
      accent: 'text-rose-300',
    },
    {
      id: 'perfect_paper',
      title: 'Perfect Paper',
      description: 'Score 90%+ on a past paper.',
      requirement: 'Score 90%+ on any past paper',
      unlocked: false,
      icon: Award,
      accent: 'text-emerald-300',
    },
    {
      id: 'einstein',
      title: 'Einstein',
      description: 'Complete all Physics units.',
      requirement: 'Complete all Physics units',
      unlocked: analytics.physicsCompletionPercent >= 100,
      unlockedAt: analytics.physicsCompletionPercent >= 100 ? today : null,
      progressPercent: analytics.physicsCompletionPercent,
      progressLabel: `${analytics.physicsCompletionPercent}% complete`,
      icon: BrainCircuit,
      accent: 'text-sky-300',
    },
    {
      id: 'organic_master',
      title: 'Organic Master',
      description: 'Reach 80%+ in Organic Chemistry.',
      requirement: 'Score 80%+ in Organic Chemistry',
      unlocked: analytics.chemistryOrganicProgressPercent >= 100,
      unlockedAt: analytics.chemistryOrganicProgressPercent >= 100 ? today : null,
      progressPercent: analytics.chemistryOrganicProgressPercent,
      progressLabel: `${analytics.chemistryOrganicProgressPercent}% to target`,
      icon: Shield,
      accent: 'text-cyan-300',
    },
    {
      id: 'island_ranker',
      title: 'Island Ranker',
      description: 'Reach Level 9.',
      requirement: 'Reach Level 9',
      unlocked: analytics.levelProgress.current.level >= 9,
      unlockedAt: analytics.levelProgress.current.level >= 9 ? today : null,
      progressPercent: analytics.islandRankerProgressPercent,
      progressLabel: `${analytics.islandRankerProgressPercent}% to Level 9`,
      icon: Crown,
      accent: 'text-fuchsia-300',
    },
    {
      id: 'helpful_peer',
      title: 'Helpful Peer',
      description: 'Answer a forum question.',
      requirement: 'Help another student',
      unlocked: false,
      icon: Users,
      accent: 'text-pink-300',
    },
    {
      id: 'bilingual_scholar',
      title: 'Bilingual Scholar',
      description: 'Use Tamil mode for 7 days.',
      requirement: 'Study in Tamil for a week',
      unlocked: false,
      icon: BookOpen,
      accent: 'text-teal-300',
    },
    {
      id: 'comeback_kid',
      title: 'Comeback Kid',
      description: 'Return after a 7-day break.',
      requirement: 'Come back after missing a week',
      unlocked: analytics.comebackKidUnlocked,
      unlockedAt: analytics.comebackKidUnlocked ? today : null,
      icon: Rocket,
      accent: 'text-lime-300',
    },
  ];
}

export default function AchievementsPage() {
  const { profile } = useAuth();
  const { analytics, loading } = useDashboardAnalytics(profile);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <Card className="h-72 animate-pulse border-white/10 bg-[#0b101a]" />
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="h-80 animate-pulse border-white/10 bg-[#0b101a]" />
          <Card className="h-80 animate-pulse border-white/10 bg-[#0b101a]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-56 animate-pulse border-white/10 bg-[#0b101a]" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="border-white/10 bg-[#0b101a] p-6 text-slate-300">
        Achievements will appear after you complete some study activity.
      </Card>
    );
  }

  const badgeData = buildBadgeData(analytics);
  const levelCurrent = analytics.levelProgress.current;
  const levelNext = analytics.levelProgress.next;

  return (
    <div className="space-y-6 pb-12">
      <Card className="overflow-hidden border-white/10 bg-[#0b101a] p-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.2),transparent_60%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
              <Trophy className="h-8 w-8" />
            </span>
            <p className="mt-4 text-sm uppercase tracking-[0.22em] text-slate-500">Current rank</p>
            <h1 className="mt-2 text-5xl font-black text-white">Level {levelCurrent.level}</h1>
            <p className="mt-2 text-lg font-semibold text-amber-300">{levelCurrent.rank}</p>

            <div className="mt-6 w-full max-w-md">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-400">{analytics.totalXp.toLocaleString()} XP</span>
                <span className="font-semibold text-white">
                  {levelNext ? `${analytics.totalXp.toLocaleString()}/${levelNext.threshold.toLocaleString()} XP` : 'Max level reached'}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-violet-500 to-emerald-400"
                  style={{ width: `${analytics.levelProgress.progressPercent}%` }}
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-300">
              {levelNext
                ? `${analytics.levelProgress.remainingXp.toLocaleString()} XP until Level ${levelNext.level} - ${levelNext.rank}`
                : 'You have reached the top of the ladder.'}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xl font-semibold text-white">Level ladder</h2>
            <p className="mt-2 text-sm text-slate-400">All 10 milestones on the path from first steps to legend status.</p>

            <div className="mt-5 space-y-3">
              {ACHIEVEMENT_LEVELS.map((level) => {
                const isCurrent = level.level === levelCurrent.level;
                const isPast = level.level < levelCurrent.level;
                return (
                  <div
                    key={level.level}
                    className={[
                      'flex items-center justify-between rounded-2xl border p-4',
                      isCurrent
                        ? 'border-amber-400/30 bg-amber-400/10'
                        : isPast
                          ? 'border-emerald-500/20 bg-emerald-500/10'
                          : 'border-white/10 bg-black/20',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          'inline-flex h-9 w-9 items-center justify-center rounded-full',
                          isCurrent
                            ? 'bg-amber-400/20 text-amber-300'
                            : isPast
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-white/10 text-slate-500',
                        ].join(' ')}
                      >
                        {isPast ? <CheckCircle2 className="h-5 w-5" /> : isCurrent ? <BadgeCheck className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                      </span>
                      <div>
                        <p className="font-semibold text-white">
                          Level {level.level}: {level.rank}
                        </p>
                        <p className="text-sm text-slate-400">{level.threshold.toLocaleString()} XP</p>
                      </div>
                    </div>

                    {isCurrent ? <span className="text-sm font-semibold text-amber-300">You are here</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/10 bg-[#0b101a] p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300">
              <Flame className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">Streak</h2>
              <p className="text-sm text-slate-400">Consistency compounds faster than cramming.</p>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Current streak</span>
              <span className="text-2xl font-black text-white">{analytics.currentStreak} days</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Personal best</span>
              <span className="text-lg font-semibold text-orange-300">{analytics.personalBestStreak} days</span>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-[#0b101a] p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">30-day study calendar</h2>
            <p className="text-sm text-slate-400">Darker squares mean more XP earned on that day.</p>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
            {analytics.studyCalendar.map((day) => (
              <CalendarCell key={day.key} day={day} />
            ))}
          </div>
        </Card>
      </div>

      <Card className="border-white/10 bg-[#0b101a] p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
            <Medal className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-white">Badge grid</h2>
            <p className="text-sm text-slate-400">Unlocked badges stay full color. Locked ones show the next requirement or progress.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {badgeData.map((badge) => (
            <div
              key={badge.id}
              className={[
                'rounded-3xl border p-5 transition',
                badge.unlocked
                  ? 'border-white/10 bg-white/[0.03]'
                  : 'border-white/8 bg-black/20 opacity-75 grayscale',
              ].join(' ')}
            >
              <div className="flex items-start gap-4">
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] ${badge.accent}`}>
                  <badge.icon className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{badge.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{badge.description}</p>
                    </div>
                    {badge.unlocked ? <BadgeCheck className="h-5 w-5 text-emerald-300" /> : null}
                  </div>

                  <div className="mt-4 text-sm text-slate-300">
                    {badge.unlocked ? (
                      <p>
                        Unlocked
                        {badge.unlockedAt ? (
                          <span className="text-slate-400"> · {formatShortDate(badge.unlockedAt)}</span>
                        ) : null}
                      </p>
                    ) : (
                      <p>{badge.requirement}</p>
                    )}
                  </div>

                  {typeof badge.progressPercent === 'number' ? (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Progress</span>
                        <span>{badge.progressLabel}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400" style={{ width: `${badge.progressPercent}%` }} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-white/10 bg-[#0b101a] p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
            <Star className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-white">Leaderboard preview</h2>
            <p className="text-sm text-slate-400">A weekly XP snapshot with your current position highlighted.</p>
          </div>
        </div>

        <div className="space-y-3">
          {analytics.leaderboardPreview.map((entry, index) => (
            <div
              key={`${entry.name}-${index}`}
              className={[
                'flex items-center justify-between rounded-2xl border p-4',
                entry.isCurrentUser
                  ? 'border-violet-400/30 bg-violet-500/10'
                  : 'border-white/10 bg-white/[0.03]',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-sm font-semibold text-white">
                  {index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '3' : index + 1}
                </span>
                <div>
                  <p className="font-semibold text-white">{entry.isCurrentUser ? 'You' : entry.name}</p>
                  <p className="text-sm text-slate-400">{entry.weeklyXp} XP this week</p>
                </div>
              </div>

              {index === 0 ? (
                <Trophy className="h-5 w-5 text-amber-300" />
              ) : index === 1 ? (
                <Medal className="h-5 w-5 text-slate-300" />
              ) : index === 2 ? (
                <Award className="h-5 w-5 text-orange-300" />
              ) : entry.isCurrentUser ? (
                <Sparkles className="h-5 w-5 text-violet-300" />
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
