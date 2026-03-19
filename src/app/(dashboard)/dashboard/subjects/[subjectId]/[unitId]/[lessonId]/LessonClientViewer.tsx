'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Subject } from '@/lib/types';
import { savePracticeAttempt, getUnitProgress } from '@/lib/progress';
import { db } from '@/lib/firebase';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ChevronRight, Clock, Sparkles, PlayCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { PracticeQuiz, Question } from '@/components/ui/PracticeQuiz';
import { MasteryBadge } from '@/components/ui/MasteryBadge';
import { doc, updateDoc } from 'firebase/firestore';

export default function LessonClientViewer({
  lesson,
  subject,
  unit,
  initialMastery,
}: {
  lesson: any;
  subject: Subject;
  unit: any;
  initialMastery?: 'not_started' | 'practicing' | 'proficient' | 'mastered';
}) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [masteryLevel, setMasteryLevel] = useState<'not_started' | 'practicing' | 'proficient' | 'mastered'>(
    initialMastery || 'not_started'
  );

  useEffect(() => {
    if (user) {
      getUnitProgress(user.uid, unit.id)
        .then((map) => {
          if (map[lesson.id]) {
            setMasteryLevel(map[lesson.id].status);
          }
        })
        .catch(console.error);
    }
  }, [user, unit.id, lesson.id]);

  useEffect(() => {
    if (!user) return;

    updateDoc(doc(db, 'users', user.uid), {
      lastVisitedLesson: {
        subjectId: subject.id,
        unitId: unit.id,
        unitTitle: unit.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        href: `/dashboard/subjects/${subject.id}/${unit.id}/${lesson.id}`,
        visitedAt: new Date().toISOString(),
      },
    }).catch((error) => {
      console.error('Failed to store last visited lesson:', error);
    });
  }, [lesson.id, lesson.title, subject.id, unit.id, unit.title, user]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: lesson.contentEn }),
        });
        const data = await res.json();
        if (data.summary) {
          setSummary(data.summary);
        } else {
          setSummary('Could not generate summary at this time.');
        }
      } catch (err) {
        setSummary('Failed to load AI summary.');
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [lesson.contentEn]);

  const mockQuestions: Question[] = [
    {
      id: 'q1',
      text: 'What is the speed of light in a vacuum?',
      options: [
        { id: '1', text: '3 × 10^8 m/s' },
        { id: '2', text: '4 × 10^8 m/s' },
        { id: '3', text: '3 × 10^5 m/s' },
        { id: '4', text: '1.5 × 10^8 m/s' },
      ],
      correctOptionId: '1',
      explanation: 'The speed of light c is universally constant at approximately 299,792,458 m/s, often rounded to 3 × 10^8 m/s.',
    },
    {
      id: 'q2',
      text: 'Which equation correctly represents mass-energy equivalence?',
      options: [
        { id: '1', text: 'F = ma' },
        { id: '2', text: 'E = mc^2' },
        { id: '3', text: 'v = u + at' },
        { id: '4', text: 'p = mv' },
      ],
      correctOptionId: '2',
      explanation: "Einstein's mass-energy equivalence formula is E = mc^2, where E is energy, m is mass, and c is the speed of light.",
    },
    {
      id: 'q3',
      text: 'What should you always verify before substituting into equations?',
      options: [
        { id: '1', text: 'Your calculator battery' },
        { id: '2', text: 'The time of day' },
        { id: '3', text: 'The units' },
        { id: '4', text: 'The font size' },
      ],
      correctOptionId: '3',
      explanation: 'Always verify your units before substituting values into equations to ensure dimensional consistency.',
    },
    {
      id: 'q4',
      text: "What is more important according to the lesson's key insights?",
      options: [
        { id: '1', text: 'Intensity' },
        { id: '2', text: 'Cramming' },
        { id: '3', text: 'Consistency' },
        { id: '4', text: 'Speed' },
      ],
      correctOptionId: '3',
      explanation: 'The lesson emphasizes that consistency is better than intensity.',
    },
    {
      id: 'q5',
      text: 'What is the SI unit of mass used in standard computational approaches for E=mc^2?',
      options: [
        { id: '1', text: 'Grams' },
        { id: '2', text: 'Pounds' },
        { id: '3', text: 'Ounces' },
        { id: '4', text: 'Kilograms' },
      ],
      correctOptionId: '4',
      explanation: 'Standard SI unit for mass in physics is the kilogram.',
    },
  ];

  const handleQuizComplete = async (score: number, accuracy: number) => {
    if (!user) {
      alert('You must be logged in to save progress.');
      return;
    }

    const newMastery = await savePracticeAttempt(
      user.uid,
      subject.id as any,
      unit.id,
      'general',
      lesson.id,
      score,
      mockQuestions.length,
      300
    );

    setMasteryLevel(newMastery);
  };

  return (
    <div className="mx-auto w-full max-w-coursera space-y-8 px-6 pb-20">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-cgray-500">
            <Link href={`/dashboard/subjects/${subject.id}`} className="hover:text-cblue-500 hover:no-underline">
              {subject.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/dashboard/subjects/${subject.id}/${unit.id}`} className="hover:text-cblue-500 hover:no-underline">
              {unit.title}
            </Link>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-cgray-900">{lesson.title}</h1>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1.5 rounded-full border border-cblue-500/20 bg-cblue-25 px-3 py-1 text-cblue-500">
              <Clock className="h-4 w-4" />
              {lesson.duration} mins
            </div>
            <div className="flex items-center gap-2 text-cgray-600">
              <MasteryBadge status={masteryLevel} size="md" />
              <span>Current Status</span>
            </div>
          </div>
        </div>
      </div>

      {lesson.videoUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-cgray-200 bg-cgray-50">
          <iframe src={lesson.videoUrl} className="h-full w-full" allowFullScreen title="Lesson Video" />
        </div>
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-cgray-200 bg-cgray-50 text-cgray-500">
          <PlayCircle className="mb-4 h-12 w-12 opacity-60" />
          <p>No video available for this lesson.</p>
        </div>
      )}

      <div className="rounded border border-cblue-500/20 bg-cblue-25 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-cblue-500">
          <Sparkles className="h-5 w-5" />
          AI Overview & Key Points
        </h3>
        <div className="prose max-w-none prose-headings:text-cgray-900 prose-p:text-cgray-700 prose-strong:text-cgray-900 prose-a:text-cblue-500">
          {loadingSummary ? (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cblue-500 border-t-transparent" />
              <span className="text-cgray-600">Gemini AI is summarizing this lesson...</span>
            </div>
          ) : (
            <ReactMarkdown>{summary || ''}</ReactMarkdown>
          )}
        </div>
      </div>

      <div className="c-card p-6 md:p-10">
        <div className="prose max-w-none prose-headings:font-bold prose-headings:text-cgray-900 prose-p:text-cgray-700 prose-a:text-cblue-500">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {lesson.contentEn}
          </ReactMarkdown>
        </div>
      </div>

      <div className="mt-16 border-t border-cgray-200 pt-8">
        <div className="mb-8">
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-cgray-900">
            <BookOpen className="h-6 w-6 text-cblue-500" />
            Practice Quiz
          </h2>
          <p className="text-cgray-600">
            Test your understanding to update your mastery level. Scoring 60%+ marks you as Proficient,
            and 80%+ marks you as Mastered.
          </p>
        </div>

        <PracticeQuiz questions={mockQuestions} onComplete={handleQuizComplete} />
      </div>
    </div>
  );
}
