'use client';

import { use, useEffect, useState } from 'react';
import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, PlayCircle, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getUnitProgress } from '@/lib/progress';
import { Progress } from '@/lib/types';
import { MasteryBadge } from '@/components/ui/MasteryBadge';

export default function UnitLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subjectId: string; unitId: string }>;
}) {
  const unwrappedParams = use(params);
  const subjectId = unwrappedParams.subjectId;
  const unitId = unwrappedParams.unitId;

  const pathname = usePathname();
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});

  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const units = (SYLLABUS as any)[subjectId] || [];
  const unit = units.find((u: any) => u.id === unitId);

  useEffect(() => {
    if (user && unit) {
      getUnitProgress(user.uid, unit.id).then(setProgressMap).catch(console.error);
    }
  }, [user, unit]);

  if (!subject || !unit) {
    return <div className="p-8 text-cgray-700">Unit not found</div>;
  }

  const lessons = [
    { id: `${unitId}-l1`, title: 'Introduction and Core Concepts', duration: 12 },
    { id: `${unitId}-l2`, title: 'Deep Dive: Key Principles', duration: 18 },
    { id: `${unitId}-l3`, title: 'Practice & Application', duration: 24 },
  ];

  let masteredCount = 0;
  lessons.forEach((lesson) => {
    if (progressMap[lesson.id]?.status === 'mastered') masteredCount++;
  });
  const unitProgress = Math.round((masteredCount / lessons.length) * 100);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white md:flex-row">
      <div className="hidden h-full w-full flex-col border-r border-cgray-200 bg-white md:sticky md:top-16 md:flex md:h-[calc(100vh-4rem)] md:w-[35%] md:overflow-y-auto lg:w-[30%]">
        <div className="border-b border-cgray-200 p-5">
          <Link
            href={`/dashboard/subjects/${subject.id}`}
            className="mb-4 inline-flex items-center gap-2 text-sm text-cgray-500 transition-colors hover:text-cblue-500 hover:no-underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to {subject.name}
          </Link>

          <h2 className="mb-2 text-xl font-semibold text-cgray-900">{unit.title}</h2>

          <div className="mt-4 mb-2 flex items-center justify-between text-sm">
            <span className="text-cgray-500">Mastery</span>
            <span className="font-semibold text-cgray-900">
              {masteredCount}/{lessons.length}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cgray-100">
            <div className="h-full rounded-full bg-cblue-500 transition-all duration-700" style={{ width: `${unitProgress}%` }} />
          </div>
        </div>

        <div className="flex-1 space-y-1 p-3">
          {lessons.map((lesson, idx) => {
            const isActive = pathname.includes(`/${lesson.id}`);
            const status = progressMap[lesson.id]?.status || 'not_started';

            return (
              <Link
                key={lesson.id}
                href={`/dashboard/subjects/${subject.id}/${unit.id}/${lesson.id}`}
                className={`group flex items-start gap-3 rounded p-3 transition-colors hover:no-underline ${isActive ? 'border border-cblue-500/20 bg-cblue-25' : 'hover:bg-cgray-50'}`}
              >
                <div className="mt-0.5 shrink-0">
                  <MasteryBadge status={status} size="md" />
                </div>
                <div className="flex-1">
                  <h4 className={`mb-1 text-sm font-medium leading-tight transition-colors ${isActive ? 'text-cgray-900' : 'text-cgray-700 group-hover:text-cblue-500'}`}>
                    {idx + 1}. {lesson.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-cgray-500">
                    <PlayCircle className="h-3 w-3" />
                    {lesson.duration}m
                  </div>
                </div>
              </Link>
            );
          })}

          <div className="my-4 border-t border-cgray-200" />

          <Link
            href={`/dashboard/subjects/${subject.id}/${unit.id}/quiz`}
            className={`group mt-2 flex items-center gap-3 rounded border p-3 transition-colors hover:no-underline ${pathname.includes('/quiz') ? 'border-cblue-500/20 bg-cblue-25' : 'border-cgray-200 bg-cgray-50 hover:border-cblue-500/20 hover:bg-cblue-25'}`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cblue-50 text-cblue-500">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-cgray-900 transition-colors group-hover:text-cblue-500">Unit Quiz</h4>
              <p className="text-xs text-cgray-500">Test your mastery</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex-1 bg-white">{children}</div>
    </div>
  );
}
