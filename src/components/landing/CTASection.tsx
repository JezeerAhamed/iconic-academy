'use client';

import { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDaysToExam } from '@/lib/dashboard-intelligence';

function getMonthsToExam() {
  const days = getDaysToExam(2026, new Date());
  return Math.max(0, Math.ceil(days / 30));
}

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const monthsToExam = useMemo(() => getMonthsToExam(), []);

  return (
    <section ref={ref} className="section-pad bg-[#060a11]">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-indigo-500/30 p-12"
          style={{
            background:
              'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(59,130,246,0.10) 100%)',
          }}
        >
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30">
              <Zap className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>

            <h2 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Your A-Grade Journey <br />
              <span className="gradient-text">Starts Today</span>
            </h2>

            <p className="mx-auto mb-4 max-w-xl text-lg leading-relaxed text-slate-300">
              2026 A/L exam in {monthsToExam} months - start preparing now with structured lessons, past papers, and AI support.
            </p>

            <p className="mx-auto mb-8 max-w-xl text-base text-slate-400">
              Start free today with no credit card required. Upgrade only when you want more subjects, past papers, or premium tools.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-10 text-base font-semibold text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105 hover:from-indigo-600 hover:to-purple-700"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/subjects">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-2xl border-white/10 bg-white/5 px-10 text-base font-medium text-white hover:bg-white/10"
                >
                  Browse Subjects
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-400">Free plan available. No credit card required. Cancel anytime.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
