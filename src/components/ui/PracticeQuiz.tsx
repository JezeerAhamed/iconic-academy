import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronRight, Award } from 'lucide-react';

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
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = () => {
        if (Object.keys(answers).length < questions.length) {
            alert('Please answer all questions before submitting.');
            return;
        }

        let currentScore = 0;
        questions.forEach(q => {
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
                    <div key={q.id} className="bg-[#0b101a] border border-white/5 rounded-2xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">
                            <span className="text-indigo-400 mr-2">{index + 1}.</span>
                            {q.text}
                        </h4>

                        <div className="space-y-3 mb-4">
                            {q.options.map(opt => {
                                const isSelected = selectedOption === opt.id;
                                const showCorrect = isSubmitted && opt.id === q.correctOptionId;
                                const showWrong = isSubmitted && isSelected && !isCorrect;

                                let borderClass = 'border-white/5';
                                let bgClass = 'bg-white/5 hover:bg-white/10';

                                if (isSelected && !isSubmitted) {
                                    borderClass = 'border-indigo-500';
                                    bgClass = 'bg-indigo-500/10';
                                } else if (showCorrect) {
                                    borderClass = 'border-green-500';
                                    bgClass = 'bg-green-500/10';
                                } else if (showWrong) {
                                    borderClass = 'border-red-500';
                                    bgClass = 'bg-red-500/10';
                                }

                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleSelect(q.id, opt.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${borderClass} ${bgClass}`}
                                        disabled={isSubmitted}
                                    >
                                        <span className={isSelected || showCorrect || showWrong ? 'text-white' : 'text-slate-300'}>
                                            {opt.text}
                                        </span>
                                        {showCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                                        {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation Area */}
                        {isSubmitted && (
                            <div className={`p-4 rounded-xl mt-4 border ${isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                <h5 className={`font-semibold mb-1 flex items-center gap-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                    {isCorrect ? 'Correct!' : 'Incorrect'}
                                </h5>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {q.explanation}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}

            {!isSubmitted ? (
                <button
                    onClick={handleSubmit}
                    className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                    Submit Answers
                </button>
            ) : (
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-8 text-center mt-8">
                    <Award className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Practice Complete!</h3>
                    <p className="text-slate-300 mb-6">
                        You scored {score} out of {questions.length} ({(score / questions.length) * 100}%).
                    </p>
                    {/* Add any next step CTA here if needed, or handled via parent state */}
                </div>
            )}
        </div>
    );
}
