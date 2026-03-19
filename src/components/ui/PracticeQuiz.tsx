import React, { useState } from 'react';
import { CheckCircle, XCircle, Award } from 'lucide-react';

export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

interface PracticeQuizProps {
  questions: Question[];
  onComplete: (score: number, accuracy: number) => void;
}

export function PracticeQuiz({ questions, onComplete }: PracticeQuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    let currentScore = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionId) currentScore++;
    });

    const accuracy = (currentScore / questions.length) * 100;
    setScore(currentScore);
    setIsSubmitted(true);
    onComplete(currentScore, accuracy);
  };

  return (
    <div className="space-y-8">
      {questions.map((q, index) => {
        const selectedOption = answers[q.id];
        const isCorrect = selectedOption === q.correctOptionId;

        return (
          <div key={q.id} className="c-card p-6">
            <h4 className="mb-4 text-lg font-semibold text-cgray-900">
              <span className="mr-2 text-cblue-500">{index + 1}.</span>
              {q.text}
            </h4>

            <div className="mb-4 space-y-3">
              {q.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const showCorrect = isSubmitted && opt.id === q.correctOptionId;
                const showWrong = isSubmitted && isSelected && !isCorrect;

                let borderClass = 'border-cgray-200';
                let bgClass = 'bg-white hover:bg-cgray-50';
                let textClass = 'text-cgray-700';

                if (isSelected && !isSubmitted) {
                  borderClass = 'border-cblue-500';
                  bgClass = 'bg-cblue-25';
                  textClass = 'text-cblue-600';
                } else if (showCorrect) {
                  borderClass = 'border-cgreen-500/20';
                  bgClass = 'bg-cgreen-50';
                  textClass = 'text-cgreen-600';
                } else if (showWrong) {
                  borderClass = 'border-cred-500/20';
                  bgClass = 'bg-cred-50';
                  textClass = 'text-cred-600';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(q.id, opt.id)}
                    className={`flex w-full items-center justify-between rounded border p-4 text-left transition ${borderClass} ${bgClass}`}
                    disabled={isSubmitted}
                  >
                    <span className={textClass}>{opt.text}</span>
                    {showCorrect ? <CheckCircle className="h-5 w-5 text-cgreen-500" /> : null}
                    {showWrong ? <XCircle className="h-5 w-5 text-cred-500" /> : null}
                  </button>
                );
              })}
            </div>

            {isSubmitted ? (
              <div className={`mt-4 rounded border p-4 ${isCorrect ? 'border-cgreen-500/20 bg-cgreen-50' : 'border-cred-500/20 bg-cred-50'}`}>
                <h5 className={`mb-1 flex items-center gap-2 font-semibold ${isCorrect ? 'text-cgreen-600' : 'text-cred-600'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </h5>
                <p className="text-sm leading-relaxed text-cgray-700">{q.explanation}</p>
              </div>
            ) : null}
          </div>
        );
      })}

      {!isSubmitted ? (
        <button onClick={handleSubmit} className="btn-primary w-full justify-center">
          Submit Answers
        </button>
      ) : (
        <div className="c-card mt-8 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-cblue-50 text-cblue-500">
            <Award className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-cgray-900">Practice Complete!</h3>
          <p className="text-cgray-600">
            You scored {score} out of {questions.length} ({(score / questions.length) * 100}%).
          </p>
        </div>
      )}
    </div>
  );
}
