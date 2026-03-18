'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  BarChart3,
  BookCheck,
  Crosshair,
  Gauge,
  Timer,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { formatDuration } from '@/lib/dashboard-intelligence';
import { useDashboardAnalytics } from '@/lib/use-dashboard-analytics';

function CalendarCell({ intensity, isToday, didStudy }: { intensity: number; isToday: boolean; didStudy: boolean }) {
  const colors = [
    'bg-slate-800',
    'bg-violet-900/70',
    'bg-violet-700/80',
    'bg-violet-500/85',
    'bg-violet-400',
  ];

  return (
    <div
      className={[
        'h-8 w-8 rounded-md border transition',
        didStudy ? colors[intensity] : colors[0],
        isToday ? 'border-white ring-1 ring-violet-400/70' : 'border-white/5',
      ].join(' ')}
    />
  );
}

export default function ProgressAnalyticsPage() {
  const { profile } = useAuth();
  const { analytics, loading } = useDashboardAnalytics(profile);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-32 animate-pulse border-white/10 bg-[#0b101a]" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-80 animate-pulse border-white/10 bg-[#0b101a]" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="border-white/10 bg-[#0b101a] p-6 text-slate-300">
        Progress analytics will appear after you complete some lessons.
      </Card>
    );
  }

  const stats = [
    { label: 'Total XP earned', value: analytics.totalXp.toLocaleString(), icon: Gauge, color: 'text-violet-300' },
    { label: 'Lessons completed', value: analytics.lessonsCompleted.toLocaleString(), icon: BookCheck, color: 'text-emerald-300' },
    { label: 'Average accuracy', value: `${analytics.averageAccuracy}%`, icon: Crosshair, color: 'text-amber-300' },
    { label: 'Total study time', value: formatDuration(analytics.totalStudyTimeSeconds), icon: Timer, color: 'text-cyan-300' },
  ];

  const accuracyData = analytics.subjectAnalytics.map((subject) => ({
    name: subject.name,
    accuracy: subject.averageAccuracy,
    fill: subject.color,
  }));

  const masteryData = analytics.subjectAnalytics.map((subject) => ({
    name: subject.name,
    notStarted: subject.notStartedLessons,
    practicing: subject.practicingLessons,
    proficient: subject.proficientLessons,
    mastered: subject.masteredLessons,
  }));

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Progress analytics</h1>
        <p className="mt-2 text-sm text-slate-400">
          Your study trends, subject accuracy, weak areas, and mastery breakdown from Firestore progress data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-white/10 bg-[#0b101a] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{stat.value}</p>
              </div>
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-[#0b101a] p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Accuracy by subject</h2>
            <p className="text-sm text-slate-400">A quick bar view of your current average performance.</p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    color: '#e2e8f0',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" radius={[10, 10, 0, 0]}>
                  {accuracyData.map((subject) => (
                    <Cell key={subject.name} fill={subject.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-white/10 bg-[#0b101a] p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">Topics needing attention</h2>
              <p className="text-sm text-slate-400">Units below 60% accuracy are surfaced first.</p>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.weakAreas.length > 0 ? (
              analytics.weakAreas.map((area) => (
                <div key={`${area.subjectId}-${area.unitId}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">{area.subjectName}</p>
                      <h3 className="text-lg font-semibold text-white">{area.unitTitle}</h3>
                    </div>
                    <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
                      {area.accuracy}% accuracy
                    </span>
                  </div>
                  <div className="mt-4">
                    <Link href={area.href}>
                      <Button className="bg-rose-600 text-white hover:bg-rose-500">Practice now</Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                No weak areas under 60% right now. Keep revising to push your practicing lessons into proficiency.
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-[#0b101a] p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Study streak calendar</h2>
            <p className="text-sm text-slate-400">The last 30 days of study activity, darker when you earned more XP.</p>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
            {analytics.studyCalendar.map((day) => (
              <div key={day.key} className="flex flex-col items-center gap-2">
                <CalendarCell intensity={day.intensity} isToday={day.isToday} didStudy={day.didStudy} />
                <span className="text-[10px] text-slate-500">{day.dayOfMonth}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-slate-800" /> No study
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-violet-700/80" /> Studied
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded border border-white ring-1 ring-violet-400/70" /> Today
            </span>
          </div>
        </Card>

        <Card className="border-white/10 bg-[#0b101a] p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Mastery breakdown</h2>
            <p className="text-sm text-slate-400">Lesson counts by mastery stage across each subject.</p>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masteryData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} width={100} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    color: '#e2e8f0',
                  }}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }} />
                <Bar dataKey="notStarted" stackId="mastery" fill="#475569" radius={[6, 0, 0, 6]} />
                <Bar dataKey="practicing" stackId="mastery" fill="#38bdf8" />
                <Bar dataKey="proficient" stackId="mastery" fill="#f59e0b" />
                <Bar dataKey="mastered" stackId="mastery" fill="#22c55e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="border-white/10 bg-[#0b101a] p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-white">Subject snapshot</h2>
            <p className="text-sm text-slate-400">Accuracy, completed lessons, and study time across your enrolled subjects.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {analytics.subjectAnalytics.map((subject) => (
            <div key={subject.subjectId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">
                      {subject.icon}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {subject.averageAccuracy}% accuracy · {subject.completedLessons}/{subject.totalLessons} lessons completed
                  </p>
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 ring-1 ring-white/10">
                  {formatDuration(subject.totalTimeSpentSeconds)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
