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
import EmojiIcon from '@/components/accessibility/EmojiIcon';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/contexts/AuthContext';
import { formatDuration } from '@/lib/dashboard-intelligence';
import { useDashboardAnalytics } from '@/lib/use-dashboard-analytics';

function CalendarCell({ intensity, isToday, didStudy }: { intensity: number; isToday: boolean; didStudy: boolean }) {
  const colors = [
    'bg-cgray-100',
    'bg-cblue-100',
    'bg-cblue-200',
    'bg-cblue-300',
    'bg-cblue-500',
  ];

  return (
    <div
      className={[
        'h-8 w-8 rounded border transition',
        didStudy ? colors[intensity] : colors[0],
        isToday ? 'border-cblue-500 ring-1 ring-cblue-100' : 'border-cgray-200',
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
            <Card key={index} className="c-card h-32 animate-pulse bg-cgray-100" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="c-card h-80 animate-pulse bg-cgray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return <Card className="c-card p-6 text-cgray-600">Progress analytics will appear after you complete some lessons.</Card>;
  }

  const stats = [
    { label: 'Total XP earned', value: analytics.totalXp.toLocaleString(), icon: Gauge, color: 'text-cblue-500' },
    { label: 'Lessons completed', value: analytics.lessonsCompleted.toLocaleString(), icon: BookCheck, color: 'text-cgreen-500' },
    { label: 'Average accuracy', value: `${analytics.averageAccuracy}%`, icon: Crosshair, color: 'text-cyellow-500' },
    { label: 'Total study time', value: formatDuration(analytics.totalStudyTimeSeconds), icon: Timer, color: 'text-cblue-700' },
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
        <h1 className="text-3xl font-bold tracking-tight text-cgray-900">Progress analytics</h1>
        <p className="mt-2 text-sm text-cgray-600">
          Your study trends, subject accuracy, weak areas, and mastery breakdown from Firestore progress data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="c-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-cgray-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold text-cgray-900">{stat.value}</p>
              </div>
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-lg bg-cgray-50 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="c-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-cgray-900">Accuracy by subject</h2>
            <p className="text-sm text-cgray-500">A quick bar view of your current average performance.</p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E0E0E0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: '#F5F5F5' }}
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    color: '#1F1F1F',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                  {accuracyData.map((subject) => (
                    <Cell key={subject.name} fill={subject.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="c-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-cred-50 text-cred-500">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-cgray-900">Topics needing attention</h2>
              <p className="text-sm text-cgray-500">Units below 60% accuracy are surfaced first.</p>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.weakAreas.length > 0 ? (
              analytics.weakAreas.map((area) => (
                <div key={`${area.subjectId}-${area.unitId}`} className="rounded border border-cgray-200 bg-cgray-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-cgray-500">{area.subjectName}</p>
                      <h3 className="text-lg font-semibold text-cgray-900">{area.unitTitle}</h3>
                    </div>
                    <span className="rounded-full bg-cred-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cred-500">
                      {area.accuracy}% accuracy
                    </span>
                  </div>
                  <div className="mt-4">
                    <Link href={area.href} className="btn-primary btn-sm">
                      Practice now
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded border border-cgreen-500/20 bg-cgreen-50 p-4 text-sm text-cgreen-600">
                No weak areas under 60% right now. Keep revising to push your practicing lessons into proficiency.
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="c-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-cgray-900">Study streak calendar</h2>
            <p className="text-sm text-cgray-500">The last 30 days of study activity, darker when you earned more XP.</p>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
            {analytics.studyCalendar.map((day) => (
              <div key={day.key} className="flex flex-col items-center gap-2">
                <CalendarCell intensity={day.intensity} isToday={day.isToday} didStudy={day.didStudy} />
                <span className="text-[10px] text-cgray-500">{day.dayOfMonth}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-xs text-cgray-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-cgray-100" /> No study
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-cblue-300" /> Studied
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded border border-cblue-500 ring-1 ring-cblue-100" /> Today
            </span>
          </div>
        </Card>

        <Card className="c-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-cgray-900">Mastery breakdown</h2>
            <p className="text-sm text-cgray-500">Lesson counts by mastery stage across each subject.</p>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masteryData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#E0E0E0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#424242', fontSize: 12 }} width={100} />
                <Tooltip
                  cursor={{ fill: '#F5F5F5' }}
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    color: '#1F1F1F',
                  }}
                />
                <Legend wrapperStyle={{ color: '#424242', fontSize: 12 }} />
                <Bar dataKey="notStarted" stackId="mastery" fill="#BDBDBD" radius={[6, 0, 0, 6]} />
                <Bar dataKey="practicing" stackId="mastery" fill="#0056D2" />
                <Bar dataKey="proficient" stackId="mastery" fill="#F9A825" />
                <Bar dataKey="mastered" stackId="mastery" fill="#2E7D32" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="c-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-cblue-50 text-cblue-500">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-cgray-900">Subject snapshot</h2>
            <p className="text-sm text-cgray-500">Accuracy, completed lessons, and study time across your enrolled subjects.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {analytics.subjectAnalytics.map((subject) => (
            <div key={subject.subjectId} className="rounded border border-cgray-200 bg-cgray-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <EmojiIcon emoji={subject.icon} label={subject.name} decorative className="text-xl" />
                    <h3 className="text-lg font-semibold text-cgray-900">{subject.name}</h3>
                  </div>
                  <p className="mt-2 text-sm text-cgray-600">
                    {subject.averageAccuracy}% accuracy - {subject.completedLessons}/{subject.totalLessons} lessons completed
                  </p>
                </div>
                <span className="rounded-full border border-cgray-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cgray-500">
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
