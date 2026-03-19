'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { ArrowRight, Clock3, FileText, Lock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SUBJECTS } from '@/lib/constants';
import { auth, db } from '@/lib/firebase';

type SubjectFilter = 'all' | 'physics' | 'chemistry' | 'biology' | 'maths';
type YearFilter = 'all' | '2023' | '2022' | '2021' | '2020' | '2019' | '2018' | '2017';
type PaperTypeFilter = 'all' | 'MCQ' | 'Structured' | 'Full';

interface PastPaperCardData {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectIcon: string;
  subjectColor: string;
  year: number;
  type: 'MCQ' | 'Structured' | 'Full';
  durationText: string;
  marks: number;
  isPremium: boolean;
}

const SUBJECT_TABS: Array<{ id: SubjectFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'biology', label: 'Biology' },
  { id: 'maths', label: 'Combined Maths' },
];

const YEAR_OPTIONS: YearFilter[] = ['all', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];
const PAPER_TYPES: PaperTypeFilter[] = ['all', 'MCQ', 'Structured', 'Full'];

function parseNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
}

function normalizePaperType(value: unknown): 'MCQ' | 'Structured' | 'Full' {
  if (typeof value !== 'string') return 'Full';

  const normalized = value.trim().toLowerCase();

  if (normalized === 'mcq' || normalized === 'multiple choice') return 'MCQ';
  if (normalized === 'structured' || normalized === 'essay' || normalized === 'structured paper') return 'Structured';
  if (normalized === 'full' || normalized === 'full paper') return 'Full';

  return 'Full';
}

function formatDuration(value: unknown) {
  if (typeof value === 'string' && value.trim()) return value.trim();

  const minutes = parseNumber(value);
  if (minutes <= 0) return '3 Hours';

  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours <= 0) return `${remainingMinutes} Minutes`;
  return `${hours}h ${remainingMinutes}m`;
}

function normalizePaper(docId: string, rawData: Record<string, unknown>): PastPaperCardData {
  const subjectId =
    typeof rawData.subjectId === 'string' && rawData.subjectId.trim()
      ? rawData.subjectId.trim()
      : 'physics';
  const subject = SUBJECTS.find((entry) => entry.id === subjectId);

  return {
    id: docId,
    subjectId,
    subjectName:
      (typeof rawData.subjectName === 'string' && rawData.subjectName.trim()) ||
      subject?.name ||
      'Unknown Subject',
    subjectIcon:
      (typeof rawData.subjectIcon === 'string' && rawData.subjectIcon.trim()) ||
      subject?.icon ||
      '*',
    subjectColor:
      (typeof rawData.subjectColor === 'string' && rawData.subjectColor.trim()) ||
      subject?.color ||
      '#6366f1',
    year: parseNumber(rawData.year) || 2023,
    type: normalizePaperType(rawData.type),
    durationText: formatDuration(rawData.duration),
    marks: parseNumber(rawData.marks) || 100,
    isPremium: Boolean(rawData.isPremium),
  };
}

function PastPapersSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <Card className="border-white/10 bg-[#0b101a] py-6">
        <CardContent className="space-y-4">
          <div className="h-10 w-64 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-white/5" />
          <div className="grid gap-3 lg:grid-cols-[1.4fr_220px_220px]">
            <div className="h-12 animate-pulse rounded-2xl bg-white/[0.04]" />
            <div className="h-12 animate-pulse rounded-2xl bg-white/[0.04]" />
            <div className="h-12 animate-pulse rounded-2xl bg-white/[0.04]" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border-white/10 bg-[#0b101a] py-6">
            <CardContent className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-white/10" />
                  <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
                </div>
                <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/[0.04]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 animate-pulse rounded-2xl bg-white/[0.04]" />
                <div className="h-16 animate-pulse rounded-2xl bg-white/[0.04]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-11 animate-pulse rounded-xl bg-white/10" />
                <div className="h-11 animate-pulse rounded-xl bg-white/[0.04]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function PastPapersPage() {
  const router = useRouter();
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [yearFilter, setYearFilter] = useState<YearFilter>('all');
  const [paperTypeFilter, setPaperTypeFilter] = useState<PaperTypeFilter>('all');
  const [userPlan, setUserPlan] = useState<string>('free');
  const [papers, setPapers] = useState<PastPaperCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isActive) return;

      setLoading(true);
      setError(null);

      if (!firebaseUser) {
        router.replace('/auth/login');
        return;
      }

      try {
        const [papersSnapshot, userSnapshot] = await Promise.all([
          getDocs(collection(db, 'pastPapers')),
          getDoc(doc(db, 'users', firebaseUser.uid)),
        ]);

        if (!isActive) return;

        const normalized = papersSnapshot.docs
          .map((paperDoc) => normalizePaper(paperDoc.id, paperDoc.data() as Record<string, unknown>))
          .sort((left, right) => right.year - left.year);

        const plan = userSnapshot.data()?.plan;

        setUserPlan(typeof plan === 'string' ? plan : 'free');
        setPapers(normalized);
        setLoading(false);
      } catch (fetchError) {
        console.error('Failed to load past papers', fetchError);

        if (!isActive) return;

        setError('We could not load past papers right now. Please try again in a moment.');
        setLoading(false);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [router]);

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const matchesSubject = subjectFilter === 'all' || paper.subjectId === subjectFilter;
      const matchesYear = yearFilter === 'all' || String(paper.year) === yearFilter;
      const matchesPaperType = paperTypeFilter === 'all' || paper.type === paperTypeFilter;

      return matchesSubject && matchesYear && matchesPaperType;
    });
  }, [paperTypeFilter, papers, subjectFilter, yearFilter]);

  const hasPremiumAccess = userPlan === 'pro' || userPlan === 'elite' || userPlan === 'premium';

  if (loading) {
    return <PastPapersSkeleton />;
  }

  if (error) {
    return (
      <div className="pb-12">
        <Card className="border-rose-400/20 bg-[#0b101a] py-6">
          <CardContent className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-300">Unable to load papers</p>
            <h1 className="text-2xl font-black text-white">Something went wrong while loading past papers.</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="pb-12">
        <Card className="border-white/10 bg-[#0b101a] py-8">
          <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15 text-violet-300">
              <FileText className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white">Past Papers Coming Soon</h1>
              <p className="max-w-xl text-sm leading-6 text-slate-300">
                We are uploading past papers from 1995 to 2023. Check back very soon!
              </p>
            </div>
            <Link
              href="/dashboard/ai-tutor"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 font-semibold text-black transition hover:bg-slate-200"
            >
              Practice with AI Tutor instead
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Card className="border-white/10 bg-[#0b101a] py-6">
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Past papers</p>
            <h1 className="text-3xl font-black tracking-tight text-white">Practice real A/L exam papers with clean filters and fast access.</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-300">
              Filter by subject, year, and paper type, then jump straight into exam mode or premium solutions.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.5fr_220px_220px]">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
              {SUBJECT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSubjectFilter(tab.id)}
                  className={[
                    'rounded-xl px-4 py-2 text-sm font-semibold transition',
                    subjectFilter === tab.id
                      ? 'bg-white text-black'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Year</span>
              <select
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value as YearFilter)}
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white outline-none transition focus:border-violet-400"
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year} className="bg-[#0b101a] text-white">
                    {year === 'all' ? 'All Years' : year}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Paper type</span>
              <select
                value={paperTypeFilter}
                onChange={(event) => setPaperTypeFilter(event.target.value as PaperTypeFilter)}
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white outline-none transition focus:border-violet-400"
              >
                {PAPER_TYPES.map((paperType) => (
                  <option key={paperType} value={paperType} className="bg-[#0b101a] text-white">
                    {paperType === 'all' ? 'All' : paperType}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardContent>
      </Card>

      {filteredPapers.length === 0 ? (
        <Card className="border-white/10 bg-[#0b101a] py-8">
          <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15 text-violet-300">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">No papers match these filters yet.</h2>
              <p className="max-w-xl text-sm leading-6 text-slate-300">
                Try a different subject, year, or paper type to see more papers.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPapers.map((paper) => (
            <Card key={paper.id} className="border-white/10 bg-[#0b101a] py-6">
              <CardContent className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                      style={{ backgroundColor: `${paper.subjectColor}20`, color: paper.subjectColor }}
                    >
                      {paper.year}
                    </span>

                    <div>
                      <h3 className="text-xl font-bold text-white">{paper.subjectName}</h3>
                      <p className="mt-1 text-sm text-slate-400">{paper.type === 'Full' ? 'Full Paper' : paper.type}</p>
                    </div>
                  </div>

                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                    style={{ backgroundColor: `${paper.subjectColor}15`, color: paper.subjectColor }}
                  >
                    {paper.subjectIcon}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">Duration</span>
                    </div>
                    <p className="mt-3 text-lg font-bold text-white">{paper.durationText}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">Marks</span>
                    </div>
                    <p className="mt-3 text-lg font-bold text-white">{paper.marks}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/dashboard/past-papers/${paper.id}/exam`}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-slate-200"
                  >
                    Start Exam
                  </Link>

                  {paper.isPremium ? (
                    hasPremiumAccess ? (
                      <Link
                        href={`/dashboard/past-papers/${paper.id}/solutions`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/15"
                      >
                        View Solutions
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-slate-400"
                      >
                        <Lock className="h-4 w-4" />
                        View Solutions
                      </button>
                    )
                  ) : (
                    <Link
                      href={`/dashboard/past-papers/${paper.id}/solutions`}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      View Solutions
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
