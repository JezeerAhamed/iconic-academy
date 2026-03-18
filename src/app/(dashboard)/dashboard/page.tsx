'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Circle,
  Flame,
  PlayCircle,
  Sparkles,
  SunMedium,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ProgressStatus } from '@/lib/types';
import { SubjectAnalytics } from '@/lib/dashboard-intelligence';
import { useDashboardAnalytics } from '@/lib/use-dashboard-analytics';

const STATUS_LABELS: Record<ProgressStatus, string> = {
  not_started: 'Not started',
  practicing: 'Practicing',
  proficient: 'Proficient',
  mastered: 'Mastered',
};

const STATUS_COLORS: Record<ProgressStatus, string> = {
  not_started: 'text-slate-500',
  practicing: 'text-sky-400',
  proficient: 'text-amber-400',
  mastered: 'text-emerald-400',
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <Card className="border-white/10 bg-[#0b101a] p-6">
        <div className="h-7 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-4 w-64 animate-pulse rounded bg-white/5" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="h-44 animate-pulse rounded-2xl bg-white/5" />
          <div className="space-y-3">
            <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
            <div className="h-4 w-56 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-64 animate-pulse border-white/10 bg-[#0b101a]" />
        ))}
      </div>
    </div>
  );
}

function DailyGoalRing({ progress, todayXP, goalXP }: { progress: number; todayXP: number; goalXP: number }) {
  const safeProgress = Math.min(1, Math.max(0, progress));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - safeProgress);
  const ringId = 'dashboard-goal-ring';

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg className="-rotate-90 h-40 w-40" viewBox="0 0 140 140" aria-hidden="true">
        <defs>
          <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={safeProgress >= 1 ? '#22c55e' : `url(#${ringId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700"
        />
      </svg>

      <div className="absolute flex flex-col items-center text-center">
        <span className={`text-3xl font-black ${safeProgress >= 1 ? 'text-emerald-400' : 'text-white'}`}>
          {Math.round(safeProgress * 100)}%
        </span>
        <span className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Daily goal</span>
        <span className="mt-1 text-sm font-medium text-slate-300">
          {todayXP}/{goalXP} XP
        </span>
      </div>
    </div>
  );
}

function ProgressMap({ subject }: { subject: SubjectAnalytics }) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0b101a] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">
              {subject.icon}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
              <p className="text-sm text-slate-400">{subject.masteredUnitCount}/{subject.units.length} units mastered</p>
            </div>
          </div>
        </div>

        <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 ring-1 ring-white/10">
          {subject.unitCompletionPercentage}%
        </span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[360px]">
          <div className="flex items-center gap-0.5">
            {subject.units.map((unit, index) => (
              <div key={unit.unitId} className="flex items-center">
                <span
                  className={[
                    'inline-flex h-6 w-6 items-center justify-center',
                    unit.status === 'mastered'
                      ? 'text-emerald-400'
                      : unit.status === 'proficient'
                        ? 'text-amber-400'
                        : unit.status === 'practicing'
                          ? 'text-sky-400'
                          : 'text-slate-600',
                  ].join(' ')}
                  title={unit.unitTitle}
                >
                  {unit.status === 'mastered' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : unit.status === 'proficient' ? (
                    <Circle className="h-5 w-5 fill-current" strokeWidth={1.5} />
                  ) : unit.status === 'practicing' ? (
                    <PlayCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" strokeWidth={1.5} />
                  )}
                </span>
                {index < subject.units.length - 1 ? <div className="h-px w-4 bg-white/15" /> : null}
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-0.5 text-[11px] font-medium text-slate-500">
            {subject.units.map((unit, index) => (
              <div key={`${unit.unitId}-label`} className="flex items-center">
                <span className="inline-flex w-6 justify-center">{index + 1}</span>
                {index < subject.units.length - 1 ? <div className="w-4" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="text-slate-400">
          {subject.masteredUnitCount}/{subject.units.length} units mastered - {subject.unitCompletionPercentage}%
        </p>
        <Link href={subject.continueHref} className="text-sm font-semibold text-violet-300 hover:text-violet-200">
          Continue {subject.name} <ArrowRight className="ml-1 inline h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const { profile } = useAuth();
  const { analytics, loading } = useDashboardAnalytics(profile);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!analytics) {
    return (
      <Card className="border-white/10 bg-[#0b101a] p-6 text-slate-300">
        Dashboard data is not available yet. Start a lesson to populate your progress insights.
      </Card>
    );
  }

  const goalRemaining = Math.max(0, analytics.dailyGoalXP - analytics.todayXP);
  const weeklyMaxXp = Math.max(...analytics.weeklyActivity.map((day) => day.xp), 0);
  const continueLessonTitle = analytics.continueLesson?.lessonTitle ?? 'Start your first lesson';
  const continueSubject = analytics.continueLesson?.subjectName ?? 'Your syllabus';
  const continueUnit = analytics.continueLesson?.unitTitle ?? 'First unit';

  return (
    <div className="space-y-6 pb-12">
      <Card className="overflow-hidden border-white/10 bg-[#0b101a] p-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_60%)]" />
        <div className="relative space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                <SunMedium className="h-3.5 w-3.5" />
                {analytics.greeting}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              {analytics.greeting}, {analytics.displayName}
            </h1>
            <p className="text-sm text-slate-400">
              {analytics.examCountdownLabel} - {analytics.daysToExam} days to go
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <DailyGoalRing progress={analytics.dailyGoalProgress} todayXP={analytics.todayXP} goalXP={analytics.dailyGoalXP} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Today</p>
                <p className="mt-3 text-3xl font-black text-white">
                  {analytics.todayXP}
                  <span className="ml-2 text-base font-medium text-slate-400">/ {analytics.dailyGoalXP} XP</span>
                </p>
                <p className="mt-3 text-sm text-slate-300">
                  {goalRemaining > 0
                    ? `Keep going. ${goalRemaining} more XP hits your goal.`
                    : 'Goal complete. Any extra XP today is pure bonus.'}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Momentum</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300">
                    <Flame className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-3xl font-black text-white">{analytics.currentStreak}</p>
                    <p className="text-sm text-slate-400">day streak</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Personal best: {analytics.personalBestStreak} days. A quick lesson keeps the streak alive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-[#0b101a] p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">Continue where you left off</h2>
              <p className="text-sm text-slate-400">
                {analytics.hasLastVisitedLesson ? 'Your latest lesson is ready to resume.' : 'Pick a lesson and get moving.'}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-medium text-slate-400">
              {continueSubject} - {continueUnit}
            </p>
            <h3 className="text-2xl font-bold text-white">{continueLessonTitle}</h3>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className={`font-semibold ${STATUS_COLORS[analytics.continueLessonStatus]}`}>
                {STATUS_LABELS[analytics.continueLessonStatus]}
              </span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{analytics.continueLessonRemainingMinutes} min remaining</span>
              {analytics.continueLessonAccuracy !== null ? (
                <>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-400">{analytics.continueLessonAccuracy}% accuracy</span>
                </>
              ) : null}
            </div>

            <Link href={analytics.continueLesson?.href ?? '/dashboard/subjects'}>
              <Button className="mt-3 w-full bg-violet-600 text-white hover:bg-violet-500 md:w-auto">
                {analytics.hasLastVisitedLesson ? 'Continue Lesson' : 'Start your first lesson'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="border-white/10 bg-[#0b101a] p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">Recommended for you</h2>
              <p className="text-sm text-slate-400">Based on lessons still in practice or waiting to be started.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="mb-4 text-sm text-slate-300">
              {analytics.recommendedLessons.length > 0
                ? 'Focus on these next to strengthen your weaker or untouched areas.'
                : 'You have covered every generated lesson in your enrolled subjects. Keep revising and polishing mastery.'}
            </p>

            <div className="flex flex-wrap gap-3">
              {analytics.recommendedLessons.map((lesson) => (
                <Link
                  key={lesson.lessonId}
                  href={lesson.href}
                  className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/15"
                >
                  {lesson.lessonTitle}
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-white/10 bg-[#0b101a] p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Subject progress map</h2>
            <p className="text-sm text-slate-400">A quick mastery read across every enrolled subject.</p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {analytics.subjectAnalytics.map((subject) => (
            <ProgressMap key={subject.subjectId} subject={subject} />
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="border-white/10 bg-[#0b101a] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Weekly activity</h2>
              <p className="text-sm text-slate-400">XP earned from lesson activity over the last 7 days.</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              {analytics.weeklyActivity.reduce((sum, day) => sum + day.xp, 0)} XP
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.weeklyActivity} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="shortLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    color: '#e2e8f0',
                  }}
                  formatter={(value: number) => [`${value} XP`, 'Earned']}
                />
                <Bar dataKey="xp" radius={[10, 10, 0, 0]}>
                  {analytics.weeklyActivity.map((day) => (
                    <Cell
                      key={day.key}
                      fill={
                        day.xp === 0
                          ? 'rgba(148,163,184,0.25)'
                          : day.isToday
                            ? '#22c55e'
                            : day.xp === weeklyMaxXp
                              ? '#8b5cf6'
                              : '#6366f1'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-white/10 bg-[#0b101a] p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">Your A/L {analytics.examYear} timeline</h2>
              <p className="text-sm text-slate-400">Countdown, syllabus pace, and the next important milestones.</p>
            </div>
          </div>

          <div className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-400">Syllabus completion</span>
                <span className="font-semibold text-white">{analytics.syllabusCompletionPercent}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400"
                  style={{ width: `${analytics.syllabusCompletionPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {analytics.timelineMilestones.map((milestone) => (
                <div key={milestone.label} className="flex items-center gap-3 text-sm">
                  <span
                    className={[
                      'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                      milestone.status === 'complete'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : milestone.status === 'in_progress'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-white/10 text-slate-400',
                    ].join(' ')}
                  >
                    {milestone.status === 'complete' ? 'OK' : milestone.status === 'in_progress' ? 'IP' : 'NS'}
                  </span>
                  <span className="text-slate-200">{milestone.label}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
              {analytics.projectedFinishLabel ? (
                <p>
                  At your current pace, you are on track to finish the syllabus by{' '}
                  <span className="font-semibold text-white">{analytics.projectedFinishLabel}</span>.
                </p>
              ) : (
                <p>Complete a few lessons this week and we will project your syllabus finish month here.</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
