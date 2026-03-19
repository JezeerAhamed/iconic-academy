'use client';

import { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
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
    <section ref={ref} className="border-t border-cgray-200 bg-cblue-500 py-16">
      <div className="c-wrap">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-white/15 text-white">
            <Zap className="h-7 w-7" strokeWidth={2.2} />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/80">
            Start your preparation
          </p>

          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Your A-Grade Journey Starts Today
          </h2>

          <p className="mx-auto mb-4 max-w-2xl text-lg leading-relaxed text-white/90">
            2026 A/L exam in {monthsToExam} months. Start preparing now with structured lessons, past
            papers, and AI support.
          </p>

          <p className="mx-auto mb-8 max-w-2xl text-base text-white/75">
            Start free today with no credit card required. Upgrade only when you want more subjects,
            past papers, or premium tools.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded bg-white px-6 py-3 text-base font-semibold text-cblue-500 no-underline transition-colors duration-150 hover:bg-cgray-50 hover:no-underline"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/subjects"
              className="inline-flex items-center justify-center rounded border border-white/50 bg-transparent px-6 py-3 text-base font-semibold text-white no-underline transition-colors duration-150 hover:bg-white/10 hover:no-underline"
            >
              Browse Subjects
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/75">
            Free plan available. No credit card required. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
