'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Subject } from '@/lib/types';
import { savePracticeAttempt } from '@/lib/progress';
import { ChevronRight, Target, Award, PlayCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { PracticeQuiz, Question } from '@/components/ui/PracticeQuiz';

export default function QuizClientViewer({
  subject,
  unit,
}: {
  subject: Subject;
  unit: any;
}) {
  const { user } = useAuth();
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [quizScore, setQuizScore] = useState({ score: 0, accuracy: 0 });

  const mockUnitQuestions: Question[] = Array.from({ length: 15 }).map((_, i) => ({
    id: `uq-${i}`,
    text: `Which of the following is a key concept related to topic number ${i + 1} in this unit?`,
    options: [
      { id: '1', text: `Option A for concept ${i + 1}` },
      { id: '2', text: `Option B for concept ${i + 1}` },
      { id: '3', text: `Option C for concept ${i + 1}` },
      { id: '4', text: `Option D for concept ${i + 1}` },
    ],
    correctOptionId: '1',
    explanation: `This is the comprehensive explanation for concept ${i + 1}. In a real application, this data is fetched from Firestore.`,
  }));

  const handleQuizComplete = async (score: number, accuracy: number) => {
    setQuizScore({ score, accuracy });
    setIsComplete(true);

    if (user) {
      await savePracticeAttempt(
        user.uid,
        subject.id as any,
        unit.id,
        'quiz',
        'final-quiz',
        score,
        mockUnitQuestions.length,
        900
      );
    }
  };

  if (!hasStarted) {
    return (
      <div className="mx-auto mt-12 mb-32 flex max-w-coursera flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-xl bg-cblue-50 text-cblue-500">
          <Target className="h-10 w-10" />
        </div>
        <h1 className="mb-6 text-4xl font-bold text-cgray-900 md:text-5xl">{unit.title} - Final Quiz</h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-cgray-600">
          Test everything you have learned in this unit. You will face 15 questions derived from all
          lessons. You need to score <strong>at least 80%</strong> to earn the{' '}
          <span className="font-bold text-cgreen-500 underline decoration-cgreen-500/30 decoration-2">Mastered</span> badge for this unit.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button onClick={() => setHasStarted(true)} className="btn-primary">
            <PlayCircle className="mr-2 h-5 w-5" />
            Start Quiz Now
          </button>
          <Link href={`/dashboard/subjects/${subject.id}/${unit.id}`} className="btn-secondary hover:no-underline">
            Review Lessons First
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-coursera px-6 pb-16">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
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
          <h1 className="mb-3 flex items-center gap-3 text-3xl font-bold text-cgray-900">
            <BookOpen className="h-8 w-8 text-cblue-500" />
            Unit Quiz
          </h1>
          <p className="text-cgray-600">Answer all questions carefully. Your mastery depends on it.</p>
        </div>
      </div>

      {!isComplete ? (
        <div className="mt-8">
          <PracticeQuiz questions={mockUnitQuestions} onComplete={handleQuizComplete} />
        </div>
      ) : (
        <div className="c-card mt-8 p-10 text-center">
          {quizScore.accuracy >= 80 ? (
            <>
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-cgreen-50 text-cgreen-500">
                <Award className="h-12 w-12" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-cgray-900">Unit Mastered!</h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-cgray-600">
                Outstanding performance! You scored {quizScore.score}/{mockUnitQuestions.length} ({quizScore.accuracy}%).
                You have officially mastered this unit.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-cyellow-50 text-cyellow-500">
                <Award className="h-12 w-12" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-cgray-900">Good Effort!</h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-cgray-600">
                You scored {quizScore.score}/{mockUnitQuestions.length} ({quizScore.accuracy.toFixed(1)}%).
                Review the missed concepts and try again to achieve the 80% mastery threshold.
              </p>
            </>
          )}

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => {
                setHasStarted(false);
                setIsComplete(false);
              }}
              className="btn-primary"
            >
              Retake Quiz
            </button>
            <Link href={`/dashboard/subjects/${subject.id}`} className="btn-secondary hover:no-underline">
              Return to Course
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
