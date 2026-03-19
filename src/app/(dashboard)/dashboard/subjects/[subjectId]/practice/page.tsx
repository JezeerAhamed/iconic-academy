'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECTS } from '@/lib/constants';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Check, X, Trophy, Clock, BrainCircuit, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

const QUESTIONS = [
  {
    id: 'q1',
    text: 'Which of the following is a derived SI unit?',
    options: ['Kilogram', 'Second', 'Newton', 'Kelvin'],
    correct: 2,
    explanation: 'Newton (N) is derived from mass, length, and time (kg·m/s²). The others are base units.',
  },
  {
    id: 'q2',
    text: 'If the velocity of a particle is given by v = At + Bt², the dimensions of A and B are:',
    options: ['[L][T]^-2 and [L][T]^-3', '[L][T]^-1 and [L][T]^-2', '[L]^2[T]^-1 and [L][T]^-2', '[L][T]^-2 and [L][T]'],
    correct: 0,
    explanation: 'v has dimensions [L][T]^-1. So At and Bt² must also have [L][T]^-1. Thus, A = [L][T]^-2 and B = [L][T]^-3.',
  },
  {
    id: 'q3',
    text: 'Which of the physical quantities does not have the same dimensions?',
    options: ['Work and Energy', 'Torque and Work', 'Momentum and Impulse', 'Force and Pressure'],
    correct: 3,
    explanation: 'Force has dimensions [M][L][T]^-2 while pressure has dimensions [M][L]^-1[T]^-2.',
  },
];

export default function PracticeEnginePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const subjectId = params.subjectId as string;
  const subject = SUBJECTS.find((s) => s.id === subjectId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (!isFinished) {
      const timer = setInterval(() => setTimeSpent((prev) => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isFinished]);

  if (!subject) return <div className="text-cgray-700">Subject not found</div>;

  const currentQ = QUESTIONS[currentIndex];

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === currentQ.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);

      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const xpEarned = score * 20;
          await updateDoc(userRef, {
            xp: increment(xpEarned),
          });
          toast.success(`Practice completed! +${xpEarned} XP earned.`);
        } catch (error) {
          console.error('Failed to save progress', error);
        }
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isFinished) {
    const accuracy = Math.round((score / QUESTIONS.length) * 100);

    return (
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-4">
        <Card className="c-card w-full p-8 text-center md:p-12">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-cgreen-50 text-cgreen-500">
            <Trophy className="h-12 w-12" />
          </div>

          <h1 className="mb-2 text-4xl font-bold text-cgray-900">Practice Complete!</h1>
          <p className="mb-8 text-cgray-500">You finished the {subject.name} unit practice session.</p>

          <div className="mb-10 grid grid-cols-3 gap-4">
            <div className="rounded border border-cgray-200 bg-cgray-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cgray-500">Score</p>
              <p className="text-3xl font-bold text-cgray-900">
                {score}/{QUESTIONS.length}
              </p>
            </div>
            <div className="rounded border border-cgray-200 bg-cgray-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cgray-500">Accuracy</p>
              <p className="text-3xl font-bold text-cblue-500">{accuracy}%</p>
            </div>
            <div className="rounded border border-cgray-200 bg-cgray-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cgray-500">Time</p>
              <p className="text-3xl font-bold text-cgray-900">{formatTime(timeSpent)}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              className="btn-secondary flex-1 justify-center"
              onClick={() => router.push(`/dashboard/subjects/${subjectId}`)}
            >
              Back to Syllabus
            </button>
            <button className="btn-primary flex-1 justify-center" onClick={() => window.location.reload()}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-coursera px-6 pb-12">
      <div className="mb-8 flex items-center justify-between">
        <button
          className="inline-flex items-center gap-2 text-sm font-semibold text-cgray-500 transition-colors hover:text-cblue-500"
          onClick={() => router.push(`/dashboard/subjects/${subjectId}`)}
        >
          <ChevronLeft className="h-5 w-5" /> Exit Practice
        </button>

        <div className="flex items-center gap-4 rounded border border-cgray-200 bg-cgray-50 px-4 py-2">
          <div className="flex items-center gap-2 font-medium text-cgray-700">
            <Clock className="h-4 w-4 text-cblue-500" /> {formatTime(timeSpent)}
          </div>
          <div className="h-5 w-px bg-cgray-200" />
          <div className="font-bold text-cgray-900">
            {currentIndex + 1} <span className="font-medium text-cgray-500">/ {QUESTIONS.length}</span>
          </div>
        </div>
      </div>

      <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-cgray-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(currentIndex / QUESTIONS.length) * 100}%`, backgroundColor: subject.color }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="c-card relative p-6 md:p-10">
            <h2 className="mb-8 text-2xl font-bold leading-tight text-cgray-900 md:text-3xl">{currentQ.text}</h2>

            <div className="space-y-4">
              {currentQ.options.map((option, i) => {
                const isSelected = selectedOption === i;
                const isCorrect = i === currentQ.correct;
                let bgState = 'bg-white hover:bg-cgray-50 border-cgray-200 text-cgray-700';

                if (isAnswered) {
                  if (isSelected && isCorrect) bgState = 'bg-cgreen-50 border-cgreen-500/20 text-cgreen-600';
                  else if (isSelected && !isCorrect) bgState = 'bg-cred-50 border-cred-500/20 text-cred-600';
                  else if (isCorrect) bgState = 'bg-cgreen-50 border-cgreen-500/20 text-cgreen-600';
                  else bgState = 'bg-cgray-50 border-cgray-200 text-cgray-400 opacity-60';
                } else if (isSelected) {
                  bgState = 'bg-cblue-25 border-cblue-500 text-cblue-600';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={isAnswered}
                    className={`flex w-full items-center justify-between rounded border p-5 text-left text-base font-medium transition-all ${bgState}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded font-bold text-sm ${isAnswered && isSelected && isCorrect
                          ? 'bg-cgreen-50 text-cgreen-600'
                          : isAnswered && isSelected && !isCorrect
                            ? 'bg-cred-50 text-cred-600'
                            : isSelected
                              ? 'bg-cblue-50 text-cblue-500'
                              : 'bg-cgray-100 text-cgray-500'
                          }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span>{option}</span>
                    </div>

                    {isAnswered && isSelected && isCorrect ? <Check className="h-5 w-5 text-cgreen-500" /> : null}
                    {isAnswered && isSelected && !isCorrect ? <X className="h-5 w-5 text-cred-500" /> : null}
                    {isAnswered && !isSelected && isCorrect ? <Check className="h-5 w-5 text-cgreen-500" /> : null}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {isAnswered ? (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                  className="flex gap-4 overflow-hidden rounded border border-cblue-500/20 bg-cblue-25 p-5"
                >
                  <BrainCircuit className="h-6 w-6 flex-shrink-0 text-cblue-500" />
                  <div>
                    <h4 className="mb-1 font-semibold text-cblue-500">AI Tutor Insight</h4>
                    <p className="text-sm leading-relaxed text-cgray-700">{currentQ.explanation}</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="mt-8 flex justify-end border-t border-cgray-200 pt-8">
              {!isAnswered ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Check Answer
                </button>
              ) : (
                <button onClick={handleNext} className="btn-primary">
                  {currentIndex < QUESTIONS.length - 1 ? 'Next Question' : 'Finish Practice'}
                </button>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
