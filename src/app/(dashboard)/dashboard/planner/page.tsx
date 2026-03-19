'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, Circle, Flame, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudyPlannerPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Watch Physics: Bernoulli's Principle", duration: '45m', type: 'lesson', status: 'completed' },
    { id: 2, title: 'Chemistry MCQ Practice: Energetics', duration: '30m', type: 'practice', status: 'pending' },
    { id: 3, title: 'Revise Spaced Repetition: Organic Nomenclature', duration: '20m', type: 'revision', status: 'pending' },
    { id: 4, title: 'Attempt Biology Unit 2 Past Paper', duration: '2h', type: 'exam', status: 'pending' },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t)));
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="mx-auto max-w-coursera space-y-8 px-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-cgray-900">Daily Study Planner</h1>
          <p className="text-cgray-600">AI-generated tasks customized for your A/L target timeline and weak spots.</p>
        </div>

        <button className="btn-primary">
          <Sparkles className="mr-2 h-4 w-4" /> Auto-Generate Tomorrow
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="c-card col-span-1 p-5 md:col-span-2">
          <p className="mb-2 text-sm font-semibold text-cblue-500">Today&apos;s Progress</p>
          <div className="mb-2 flex items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-cgray-100">
              <motion.div
                className="h-full rounded-full bg-cblue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xl font-bold text-cgray-900">{progress}%</span>
          </div>
          <p className="text-xs text-cgray-500">
            {completedCount} of {tasks.length} tasks completed
          </p>
        </Card>

        <Card className="c-card flex items-center justify-between p-5">
          <div>
            <p className="mb-1 text-sm font-semibold text-cgray-500">Current Streak</p>
            <h2 className="text-3xl font-bold text-cgray-900">12 Days</h2>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
            <Flame className="h-7 w-7 text-orange-500" />
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-cgray-200 pb-4">
          <Calendar className="h-5 w-5 text-cblue-500" />
          <h2 className="text-xl font-semibold text-cgray-900">Today&apos;s Schedule</h2>
        </div>

        <div className="space-y-3">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => toggleTask(task.id)}
              className={`flex cursor-pointer items-center gap-4 rounded border p-4 transition-all ${task.status === 'completed'
                ? 'border-cgreen-500/20 bg-cgreen-50 opacity-80'
                : 'border-cgray-200 bg-white hover:border-cblue-500 hover:bg-cgray-50'
                }`}
            >
              <div>
                {task.status === 'completed' ? (
                  <CheckCircle2 className="h-6 w-6 text-cgreen-500" />
                ) : (
                  <Circle className="h-6 w-6 text-cgray-400 transition-colors group-hover:text-cblue-500" />
                )}
              </div>

              <div className="flex-1">
                <h3 className={`font-medium ${task.status === 'completed' ? 'text-cgray-500 line-through' : 'text-cgray-900'}`}>
                  {task.title}
                </h3>
                <div className="mt-1 flex items-center gap-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${task.type === 'lesson'
                      ? 'bg-cblue-50 text-cblue-500'
                      : task.type === 'practice'
                        ? 'bg-cgray-100 text-cgray-700'
                        : task.type === 'revision'
                          ? 'bg-cyellow-50 text-cyellow-500'
                          : 'bg-cgreen-50 text-cgreen-600'
                      }`}
                  >
                    {task.type}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-cgray-500">
                    <Clock className="h-3 w-3" /> {task.duration}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
