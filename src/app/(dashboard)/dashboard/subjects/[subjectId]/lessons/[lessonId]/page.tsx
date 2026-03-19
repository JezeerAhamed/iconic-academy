'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CheckCircle2, PlayCircle, FileText, BrainCircuit, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function LessonViewerPage() {
  const params = useParams();
  const { user } = useAuth();
  const subjectId = params.subjectId as string;
  const subject = SUBJECTS.find((s) => s.id === subjectId);

  const [isCompleted, setIsCompleted] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const lesson = {
    title: 'Introduction to Measurement Systems',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '15 mins',
    type: 'video' as const,
  };

  if (!subject) return <div className="text-cgray-700">Loading...</div>;

  const handleMarkComplete = async () => {
    if (!user) return toast.error('Please sign in');

    setIsMarking(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        xp: increment(50),
      });

      setIsCompleted(true);
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} pointer-events-auto flex max-w-md rounded border border-cblue-500/20 bg-white p-4 shadow-card`}
          >
            <div className="flex-1 p-1">
              <div className="flex items-start">
                <div className="pt-0.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cblue-50 text-cblue-500">
                    <Trophy className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-cgray-900">Lesson Completed!</p>
                  <p className="mt-1 text-xs text-cgray-500">+50 XP gained. You&apos;re getting closer to your next level.</p>
                </div>
              </div>
            </div>
          </div>
        ),
        { duration: 4000 }
      );
    } catch (error) {
      toast.error('Failed to save progress');
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="mx-auto max-w-coursera px-6 pb-12">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 text-sm text-cgray-500">
          <Link href="/dashboard" className="hover:text-cblue-500 hover:no-underline">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/subjects" className="hover:text-cblue-500 hover:no-underline">Subjects</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/dashboard/subjects/${subjectId}`} className="hover:text-cblue-500 hover:no-underline">{subject.name}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="max-w-[200px] truncate font-semibold text-cgray-900">{lesson.title}</span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="btn-secondary" disabled>
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous Lesson
          </Button>
          <Link href={`/dashboard/subjects/${subjectId}`}>
            <Button size="sm" className="btn-primary">
              Next Lesson <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-cgray-200 bg-cgray-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cgray-500">
            {lesson.type === 'video' ? <PlayCircle className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
            {lesson.type} • {lesson.duration}
          </span>
          <span
            className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: `${subject.color}10`, color: subject.color, borderColor: `${subject.color}20` }}
          >
            {subject.name}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-cgray-900">{lesson.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-cgray-200 bg-cgray-50">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full shadow-card"
                style={{ background: `linear-gradient(135deg, ${subject.color}, ${subject.color}80)` }}
              >
                <PlayCircle className="translate-x-0.5 text-white" fill="currentColor" />
              </div>
              <p className="mt-4 font-medium text-cgray-900">Play Lesson Video</p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 rounded border border-cgray-200 bg-cgray-50 p-1">
              <TabsTrigger value="overview" className="rounded data-[state=active]:bg-white data-[state=active]:text-cgray-900 text-cgray-500">
                Overview & Notes
              </TabsTrigger>
              <TabsTrigger value="resources" className="rounded data-[state=active]:bg-white data-[state=active]:text-cgray-900 text-cgray-500">
                Resources
              </TabsTrigger>
              <TabsTrigger value="qa" className="rounded data-[state=active]:bg-white data-[state=active]:text-cgray-900 text-cgray-500">
                Q&A Discussion
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="outline-none">
              <div className="c-card p-6 text-cgray-700">
                <h3 className="mb-4 text-xl font-semibold text-cgray-900">Key Concepts of Physical Quantities</h3>
                <p className="mb-4">
                  A physical quantity is a property of a material or system that can be quantified by measurement.
                  A physical quantity can be expressed as a value, which is the algebraic multiplication of a numerical
                  value and a unit.
                </p>
                <h4 className="mb-2 font-semibold text-cgray-900">Base Quantities in SI System:</h4>
                <ul className="list-disc space-y-1 pl-5 text-cgray-600">
                  <li><strong className="text-cgray-900">Length</strong> (meter - m)</li>
                  <li><strong className="text-cgray-900">Mass</strong> (kilogram - kg)</li>
                  <li><strong className="text-cgray-900">Time</strong> (second - s)</li>
                  <li><strong className="text-cgray-900">Electric current</strong> (ampere - A)</li>
                  <li><strong className="text-cgray-900">Thermodynamic temperature</strong> (kelvin - K)</li>
                  <li><strong className="text-cgray-900">Amount of substance</strong> (mole - mol)</li>
                  <li><strong className="text-cgray-900">Luminous intensity</strong> (candela - cd)</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="outline-none">
              <div className="rounded border border-dashed border-cgray-200 bg-cgray-50 p-8 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-cgray-400" />
                <p className="text-sm text-cgray-500">Downloadable PDF notes will appear here.</p>
              </div>
            </TabsContent>

            <TabsContent value="qa" className="outline-none">
              <div className="rounded border border-dashed border-cgray-200 bg-cgray-50 p-8 text-center">
                <p className="text-sm text-cgray-500">Ask questions below and our AI or tutors will answer.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <div className="c-card p-6">
            <h3 className="mb-4 font-semibold text-cgray-900">Your Progress</h3>

            {isCompleted ? (
              <div className="space-y-3">
                <div className="flex h-12 w-full items-center justify-center gap-2 rounded border border-cgreen-500/20 bg-cgreen-50 font-semibold text-cgreen-600">
                  <CheckCircle2 className="h-5 w-5" /> Completed
                </div>
                <Link href={`/dashboard/subjects/${subjectId}`} className="block">
                  <Button className="btn-primary w-full">
                    Continue Learning <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <Button onClick={handleMarkComplete} disabled={isMarking} className="btn-primary w-full">
                {isMarking ? 'Saving...' : 'Mark as Complete'}
              </Button>
            )}

            <div className="mt-6 space-y-4 border-t border-cgray-200 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-cgray-500">XP Reward</span>
                <span className="font-semibold text-cblue-500">+50 XP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-cgray-500">Estimated Time</span>
                <span className="font-semibold text-cgray-900">{lesson.duration}</span>
              </div>
            </div>
          </div>

          <div className="rounded border border-cblue-500/20 bg-cblue-25 p-6">
            <BrainCircuit className="mb-4 h-8 w-8 text-cblue-500" />
            <h3 className="mb-1 font-semibold text-cgray-900">Stuck on this topic?</h3>
            <p className="mb-4 text-xs leading-relaxed text-cgray-600">
              Our AI Tutor is trained on the Sri Lankan A/L syllabus. Ask it to explain any concept.
            </p>
            <Link href={`/dashboard/ai-tutor?context=${encodeURIComponent(lesson.title)}`}>
              <Button size="sm" className="btn-secondary w-full">Ask AI Tutor</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
