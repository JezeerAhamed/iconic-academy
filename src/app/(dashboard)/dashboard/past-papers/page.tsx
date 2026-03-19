'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { ArrowRight, Clock3, FileText, Lock, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
      '#0056D2',
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
      <Card className="c-card py-6">
        <CardContent className="space-y-4">
          <div className="h-10 w-64 animate-pulse rounded bg-cgray-100" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-cgray-100" />
          <div className="grid gap-3 lg:grid-cols-[1.4fr_220px_220px]">
            <div className="h-12 animate-pulse rounded bg-cgray-100" />
            <div className="h-12 animate-pulse rounded bg-cgray-100" />
            <div className="h-12 animate-pulse rounded bg-cgray-100" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="c-card py-6">
            <CardContent className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-cgray-100" />
                  <div className="h-5 w-40 animate-pulse rounded bg-cgray-100" />
                  <div className="h-4 w-24 animate-pulse rounded bg-cgray-100" />
                </div>
                <div className="h-12 w-12 animate-pulse rounded bg-cgray-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 animate-pulse rounded bg-cgray-100" />
                <div className="h-16 animate-pulse rounded bg-cgray-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-11 animate-pulse rounded bg-cgray-100" />
                <div className="h-11 animate-pulse rounded bg-cgray-100" />
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
        <Card className="c-card border-cred-500/20 py-6">
          <CardContent className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cred-500">Unable to load papers</p>
            <h1 className="text-2xl font-bold text-cgray-900">Something went wrong while loading past papers.</h1>
            <p className="max-w-2xl text-sm leading-6 text-cgray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="pb-12">
        <Card className="c-card py-8">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cgray-100">
              <FileText className="text-2xl text-cgray-400" />
            </div>
            <h1 className="mb-2 text-lg font-semibold text-cgray-900">Past Papers Coming Soon</h1>
            <p className="mb-5 max-w-xs text-base text-cgray-500">
              We are uploading past papers from 1995 to 2023. Check back very soon!
            </p>
            <Link href="/dashboard/ai-tutor" className="btn-primary">
              Practice with AI Tutor instead
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Card className="c-card py-6">
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cblue-500">Past papers</p>
            <h1 className="text-3xl font-bold tracking-tight text-cgray-900">
              Practice real A/L exam papers with clean filters and fast access.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-cgray-600">
              Filter by subject, year, and paper type, then jump straight into exam mode or premium
              solutions.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.5fr_220px_220px]">
            <div className="flex flex-wrap gap-2 rounded border border-cgray-200 bg-cgray-50 p-2">
              {SUBJECT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSubjectFilter(tab.id)}
                  className={subjectFilter === tab.id ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cgray-500">Year</span>
              <select
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value as YearFilter)}
                className="c-input h-12 bg-white"
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year === 'all' ? 'All Years' : year}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cgray-500">Paper type</span>
              <select
                value={paperTypeFilter}
                onChange={(event) => setPaperTypeFilter(event.target.value as PaperTypeFilter)}
                className="c-input h-12 bg-white"
              >
                {PAPER_TYPES.map((paperType) => (
                  <option key={paperType} value={paperType}>
                    {paperType === 'all' ? 'All' : paperType}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardContent>
      </Card>

      {filteredPapers.length === 0 ? (
        <Card className="c-card py-8">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cgray-100">
              <Sparkles className="text-2xl text-cgray-400" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-cgray-900">No papers match these filters yet.</h2>
            <p className="mb-5 max-w-xs text-base text-cgray-500">
              Try a different subject, year, or paper type to see more papers.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPapers.map((paper) => (
            <Card key={paper.id} className="c-card py-6">
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
                      <h3 className="text-xl font-semibold text-cgray-900">{paper.subjectName}</h3>
                      <p className="mt-1 text-sm text-cgray-500">{paper.type === 'Full' ? 'Full Paper' : paper.type}</p>
                    </div>
                  </div>

                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                    style={{ backgroundColor: `${paper.subjectColor}15`, color: paper.subjectColor }}
                  >
                    {paper.subjectIcon}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded border border-cgray-200 bg-cgray-50 p-4">
                    <div className="flex items-center gap-2 text-cgray-500">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">Duration</span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-cgray-900">{paper.durationText}</p>
                  </div>

                  <div className="rounded border border-cgray-200 bg-cgray-50 p-4">
                    <div className="flex items-center gap-2 text-cgray-500">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">Marks</span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-cgray-900">{paper.marks}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/dashboard/past-papers/${paper.id}/exam`}
                    className="btn-primary btn-sm justify-center"
                  >
                    Start Exam
                  </Link>

                  {paper.isPremium ? (
                    hasPremiumAccess ? (
                      <Link
                        href={`/dashboard/past-papers/${paper.id}/solutions`}
                        className="btn-secondary btn-sm justify-center"
                      >
                        View Solutions
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex h-11 items-center justify-center gap-2 rounded border border-cgray-200 bg-cgray-50 px-4 text-sm font-semibold text-cgray-400"
                      >
                        <Lock className="h-4 w-4" />
                        View Solutions
                      </button>
                    )
                  ) : (
                    <Link
                      href={`/dashboard/past-papers/${paper.id}/solutions`}
                      className="btn-secondary btn-sm justify-center"
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
