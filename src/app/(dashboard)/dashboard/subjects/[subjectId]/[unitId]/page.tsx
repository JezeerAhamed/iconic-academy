import { SUBJECTS, SYLLABUS } from '@/lib/constants';
import Link from 'next/link';
import { PlayCircle, Award, Target, BookOpen } from 'lucide-react';

export default async function UnitOverviewPage({
  params,
}: {
  params: Promise<{ subjectId: string; unitId: string }>;
}) {
  const { subjectId, unitId } = await params;

  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const units = (SYLLABUS as any)[subjectId] || [];
  const unit = units.find((u: any) => u.id === unitId);

  if (!subject || !unit) {
    return <div className="p-8 text-cgray-700">Unit not found</div>;
  }

  const lessons = [
    { id: `${unit.id}-l1`, title: 'Introduction and Core Concepts', duration: 12 },
    { id: `${unit.id}-l2`, title: 'Deep Dive: Key Principles', duration: 18 },
    { id: `${unit.id}-l3`, title: 'Practice & Application', duration: 24 },
  ];

  const firstLessonId = lessons[0].id;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-coursera flex-col justify-center px-6 py-16">
      <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-cblue-50 px-3 py-1 text-sm font-semibold text-cblue-500">
        <Target className="h-4 w-4" />
        Unit Overview
      </div>

      <h1 className="mb-6 text-4xl font-bold text-cgray-900 md:text-5xl">{unit.title}</h1>

      <p className="mb-12 max-w-2xl text-lg leading-relaxed text-cgray-600">
        Dive into {unit.title} and build a strong foundation. You will complete {lessons.length}
        lessons and a final unit quiz to achieve mastery.
      </p>

      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        <div className="c-card flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cblue-50 text-cblue-500">
            <PlayCircle className="h-6 w-6" />
          </div>
          <div className="mb-1 text-2xl font-bold text-cgray-900">{lessons.length}</div>
          <div className="text-sm text-cgray-500">Total Lessons</div>
        </div>
        <div className="c-card flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cgray-100 text-cgray-700">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="mb-1 text-2xl font-bold text-cgray-900">1</div>
          <div className="text-sm text-cgray-500">Unit Quiz</div>
        </div>
        <div className="c-card flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyellow-50 text-cyellow-500">
            <Award className="h-6 w-6" />
          </div>
          <div className="mb-1 text-2xl font-bold text-cgray-900">100 XP</div>
          <div className="text-sm text-cgray-500">Completion</div>
        </div>
      </div>

      <div>
        <Link
          href={`/dashboard/subjects/${subject.id}/${unit.id}/${firstLessonId}`}
          className="btn-primary inline-flex items-center justify-center hover:no-underline"
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          Start Unit
        </Link>
      </div>
    </div>
  );
}
