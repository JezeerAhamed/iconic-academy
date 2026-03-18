import { SUBJECT_MAP, SYLLABUS } from '@/lib/constants';
import { Progress, ProgressStatus, SubjectId, UserProfile } from '@/lib/types';

export const SRI_LANKA_TIME_ZONE = 'Asia/Colombo';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface AchievementLevel {
  level: number;
  rank: string;
  threshold: number;
}

export const ACHIEVEMENT_LEVELS: AchievementLevel[] = [
  { level: 1, rank: 'Beginner', threshold: 0 },
  { level: 2, rank: 'Student', threshold: 500 },
  { level: 3, rank: 'Scholar', threshold: 1500 },
  { level: 4, rank: 'Advanced', threshold: 3500 },
  { level: 5, rank: 'Expert', threshold: 7000 },
  { level: 6, rank: 'Master', threshold: 12000 },
  { level: 7, rank: 'Champion', threshold: 20000 },
  { level: 8, rank: 'Ranker', threshold: 35000 },
  { level: 9, rank: 'Island Ranker', threshold: 60000 },
  { level: 10, rank: 'Legend', threshold: 100000 },
];

export interface LessonMeta {
  subjectId: SubjectId;
  subjectName: string;
  subjectColor: string;
  unitId: string;
  unitTitle: string;
  lessonId: string;
  lessonTitle: string;
  durationMinutes: number;
  href: string;
}

export interface ProgressEntry extends Progress {
  lessonId: string;
}

export interface ActivityDay {
  key: string;
  label: string;
  shortLabel: string;
  xp: number;
  sessions: number;
  didStudy: boolean;
  isToday: boolean;
}

export interface StudyCalendarDay {
  key: string;
  dayOfMonth: number;
  xp: number;
  intensity: number;
  didStudy: boolean;
  isToday: boolean;
}

export interface UnitProgressSnapshot {
  unitId: string;
  unitTitle: string;
  status: ProgressStatus;
  completedLessons: number;
  masteredLessons: number;
  totalLessons: number;
  percentage: number;
  href: string;
}

export interface SubjectAnalytics {
  subjectId: SubjectId;
  name: string;
  color: string;
  icon: string;
  totalLessons: number;
  notStartedLessons: number;
  practicingLessons: number;
  proficientLessons: number;
  completedLessons: number;
  masteredLessons: number;
  averageAccuracy: number;
  totalTimeSpentSeconds: number;
  masteredUnitCount: number;
  unitCompletionPercentage: number;
  units: UnitProgressSnapshot[];
  continueHref: string;
}

export interface WeakArea {
  subjectId: SubjectId;
  subjectName: string;
  unitId: string;
  unitTitle: string;
  accuracy: number;
  href: string;
}

export interface TimelineMilestone {
  label: string;
  status: 'complete' | 'in_progress' | 'not_started';
}

export interface LeaderboardEntry {
  name: string;
  weeklyXp: number;
  isCurrentUser: boolean;
}

export interface LevelProgressSnapshot {
  current: AchievementLevel;
  next: AchievementLevel | null;
  progressPercent: number;
  currentXp: number;
  nextThreshold: number;
  remainingXp: number;
}

export interface DashboardAnalyticsSnapshot {
  displayName: string;
  greeting: string;
  examYear: number;
  daysToExam: number;
  examCountdownLabel: string;
  totalXp: number;
  lessonsCompleted: number;
  averageAccuracy: number;
  totalStudyTimeSeconds: number;
  currentStreak: number;
  personalBestStreak: number;
  dailyGoalXP: number;
  todayXP: number;
  dailyGoalProgress: number;
  continueLesson: LessonMeta | null;
  hasLastVisitedLesson: boolean;
  continueLessonStatus: ProgressStatus;
  continueLessonAccuracy: number | null;
  continueLessonRemainingMinutes: number;
  recommendedLessons: LessonMeta[];
  weakAreas: WeakArea[];
  subjectAnalytics: SubjectAnalytics[];
  weeklyActivity: ActivityDay[];
  studyCalendar: StudyCalendarDay[];
  timelineMilestones: TimelineMilestone[];
  syllabusCompletionPercent: number;
  projectedFinishLabel: string | null;
  levelProgress: LevelProgressSnapshot;
  firstLessonUnlockedAt: Date | null;
  firstPerfectAccuracyAt: Date | null;
  highestDailyCompletedLessons: number;
  chemistryOrganicProgressPercent: number;
  physicsCompletionPercent: number;
  islandRankerProgressPercent: number;
  comebackKidUnlocked: boolean;
  leaderboardPreview: LeaderboardEntry[];
}

type TimeLike = string | number | Date | { toDate: () => Date } | null | undefined;

interface ActivityAggregate {
  xp: number;
  sessions: number;
  completedLessons: number;
}

interface LessonStatusSnapshot extends LessonMeta {
  progress?: ProgressEntry;
  status: ProgressStatus;
  accuracy: number | null;
}

interface SubjectUnitsIndexEntry {
  id: string;
  title: string;
  description: string;
}

export function toDate(value: TimeLike): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'object' && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    const converted = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(converted.getTime()) ? null : converted;
  }
  const converted = new Date(value as string | number | Date);
  return Number.isNaN(converted.getTime()) ? null : converted;
}

function getTimeZoneParts(date: Date, timeZone = SRI_LANKA_TIME_ZONE) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? '0');

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
  };
}

export function getDateKey(date: Date, timeZone = SRI_LANKA_TIME_ZONE) {
  const parts = getTimeZoneParts(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function getDateStamp(date: Date, timeZone = SRI_LANKA_TIME_ZONE) {
  const parts = getTimeZoneParts(date, timeZone);
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function formatWeekday(date: Date, timeZone = SRI_LANKA_TIME_ZONE) {
  return new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(date);
}

export function formatShortDate(date: Date, timeZone = SRI_LANKA_TIME_ZONE) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getGreeting(date = new Date()) {
  const hour = getTimeZoneParts(date, SRI_LANKA_TIME_ZONE).hour;
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getDaysToExam(examYear: number, now = new Date()) {
  const todayStamp = getDateStamp(now, SRI_LANKA_TIME_ZONE);
  const examStamp = Date.UTC(examYear, 7, 1);
  return Math.max(0, Math.ceil((examStamp - todayStamp) / DAY_IN_MS));
}

function splitDescription(description: string) {
  const commaParts = description
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (commaParts.length >= 3) {
    return commaParts.slice(0, 3);
  }

  if (commaParts.length === 2) {
    return [commaParts[0], commaParts[1], 'Exam Practice'];
  }

  const andParts = description
    .split(/\band\b/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (andParts.length >= 3) {
    return andParts.slice(0, 3);
  }

  if (andParts.length === 2) {
    return [andParts[0], andParts[1], 'Exam Practice'];
  }

  return [description, `${description} Examples`, 'Exam Practice'];
}

function normalizeLessonTitle(fragment: string, unitTitle: string) {
  const trimmed = fragment.replace(/\.$/, '').trim();
  if (!trimmed) return unitTitle;
  if (trimmed.split(' ').length <= 2 && !trimmed.toLowerCase().includes(unitTitle.toLowerCase())) {
    return `${trimmed} in ${unitTitle}`;
  }
  return trimmed;
}

function getSubjectUnits(subjectId: SubjectId): SubjectUnitsIndexEntry[] {
  return ((SYLLABUS[subjectId] ?? []) as SubjectUnitsIndexEntry[]).map((unit) => ({
    id: unit.id,
    title: unit.title,
    description: unit.description,
  }));
}

export function getGeneratedLessons(subjectId: SubjectId, unitId: string): LessonMeta[] {
  const subject = SUBJECT_MAP[subjectId];
  const unit = getSubjectUnits(subjectId).find((entry) => entry.id === unitId);
  if (!subject || !unit) return [];

  const titles = splitDescription(unit.description);
  const durations = [14, 18, 22];

  return titles.map((title, index) => {
    const lessonId = `${unit.id}-l${index + 1}`;
    return {
      subjectId,
      subjectName: subject.name,
      subjectColor: subject.color,
      unitId: unit.id,
      unitTitle: unit.title,
      lessonId,
      lessonTitle: normalizeLessonTitle(title, unit.title),
      durationMinutes: durations[index] ?? 18,
      href: `/dashboard/subjects/${subjectId}/${unit.id}/${lessonId}`,
    };
  });
}

export function getAllLessonsForSubjects(subjectIds: SubjectId[]) {
  return subjectIds.flatMap((subjectId) =>
    getSubjectUnits(subjectId).flatMap((unit) => getGeneratedLessons(subjectId, unit.id))
  );
}

export function getLessonMeta(subjectId: SubjectId, unitId: string, lessonId: string) {
  return getGeneratedLessons(subjectId, unitId).find((lesson) => lesson.lessonId === lessonId) ?? null;
}

function getStatusRank(status: ProgressStatus) {
  switch (status) {
    case 'mastered':
      return 3;
    case 'proficient':
      return 2;
    case 'practicing':
      return 1;
    default:
      return 0;
  }
}

export function isCompletedStatus(status: ProgressStatus) {
  return status === 'proficient' || status === 'mastered';
}

function estimateLessonXp(progress: ProgressEntry) {
  const base =
    progress.status === 'mastered'
      ? 90
      : progress.status === 'proficient'
        ? 65
        : progress.status === 'practicing'
          ? 35
          : 10;

  return base + Math.max(0, (progress.attempts ?? 1) - 1) * 8;
}

function getUnitStatus(progressItems: LessonStatusSnapshot[]): ProgressStatus {
  const rankedStatuses = progressItems.map((item) => getStatusRank(item.status));
  const maxStatus = Math.max(...rankedStatuses, 0);
  const masteredCount = progressItems.filter((item) => item.status === 'mastered').length;

  if (masteredCount === progressItems.length && progressItems.length > 0) {
    return 'mastered';
  }

  if (maxStatus >= 2) {
    return 'proficient';
  }

  if (maxStatus >= 1) {
    return 'practicing';
  }

  return 'not_started';
}

function quantizeIntensity(xp: number, maxXp: number) {
  if (xp <= 0 || maxXp <= 0) return 0;
  const ratio = xp / maxXp;
  if (ratio >= 0.85) return 4;
  if (ratio >= 0.55) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

function buildDaySeries(length: number, now = new Date()) {
  return Array.from({ length }, (_, index) => {
    const date = new Date(now.getTime() - (length - 1 - index) * DAY_IN_MS);
    return {
      date,
      key: getDateKey(date, SRI_LANKA_TIME_ZONE),
      shortLabel: formatWeekday(date, SRI_LANKA_TIME_ZONE),
      label: formatShortDate(date, SRI_LANKA_TIME_ZONE),
      isToday: index === length - 1,
    };
  });
}

function deriveCurrentStreak(dayKeys: string[], now = new Date()) {
  if (dayKeys.length === 0) return 0;

  const keySet = new Set(dayKeys);
  let streak = 0;
  let cursor = new Date(now);

  const todayKey = getDateKey(cursor, SRI_LANKA_TIME_ZONE);
  const yesterdayKey = getDateKey(new Date(now.getTime() - DAY_IN_MS), SRI_LANKA_TIME_ZONE);
  const startsToday = keySet.has(todayKey);
  const startsYesterday = !startsToday && keySet.has(yesterdayKey);

  if (!startsToday && !startsYesterday) {
    return 0;
  }

  if (startsYesterday) {
    cursor = new Date(now.getTime() - DAY_IN_MS);
  }

  while (keySet.has(getDateKey(cursor, SRI_LANKA_TIME_ZONE))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_IN_MS);
  }

  return streak;
}

function deriveLongestStreak(dayKeys: string[]) {
  if (dayKeys.length === 0) return 0;

  const stamps = dayKeys
    .map((key) => Date.UTC(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10))))
    .sort((left, right) => left - right);

  let longest = 1;
  let current = 1;

  for (let index = 1; index < stamps.length; index += 1) {
    if (stamps[index] - stamps[index - 1] === DAY_IN_MS) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (stamps[index] !== stamps[index - 1]) {
      current = 1;
    }
  }

  return longest;
}

function resolveLevelProgress(totalXp: number): LevelProgressSnapshot {
  const current =
    [...ACHIEVEMENT_LEVELS].reverse().find((level) => totalXp >= level.threshold) ?? ACHIEVEMENT_LEVELS[0];
  const currentIndex = ACHIEVEMENT_LEVELS.findIndex((level) => level.level === current.level);
  const next = ACHIEVEMENT_LEVELS[currentIndex + 1] ?? null;

  if (!next) {
    return {
      current,
      next: null,
      progressPercent: 100,
      currentXp: totalXp,
      nextThreshold: current.threshold,
      remainingXp: 0,
    };
  }

  const span = next.threshold - current.threshold;
  const progressPercent = Math.min(100, Math.max(0, ((totalXp - current.threshold) / span) * 100));

  return {
    current,
    next,
    progressPercent,
    currentXp: totalXp,
    nextThreshold: next.threshold,
    remainingXp: Math.max(0, next.threshold - totalXp),
  };
}

function resolveLastVisitedLesson(
  lastVisitedLesson: unknown,
  lessons: LessonMeta[]
): LessonMeta | null {
  if (!lastVisitedLesson) return null;

  if (typeof lastVisitedLesson === 'string') {
    return lessons.find((lesson) => lesson.lessonId === lastVisitedLesson) ?? null;
  }

  if (typeof lastVisitedLesson !== 'object') {
    return null;
  }

  const candidate = lastVisitedLesson as Record<string, unknown>;
  const lessonId = typeof candidate.lessonId === 'string' ? candidate.lessonId : null;
  const subjectId = typeof candidate.subjectId === 'string' ? (candidate.subjectId as SubjectId) : null;
  const unitId = typeof candidate.unitId === 'string' ? candidate.unitId : null;
  const href = typeof candidate.href === 'string' ? candidate.href : null;

  if (subjectId && unitId && lessonId) {
    return getLessonMeta(subjectId, unitId, lessonId);
  }

  if (lessonId) {
    return lessons.find((lesson) => lesson.lessonId === lessonId) ?? null;
  }

  if (href) {
    return lessons.find((lesson) => lesson.href === href) ?? null;
  }

  return null;
}

function buildLeaderboardPreview(displayName: string, weeklyXp: number): LeaderboardEntry[] {
  const peers: LeaderboardEntry[] = [
    { name: 'Arun S.', weeklyXp: 850, isCurrentUser: false },
    { name: 'Nimisha R.', weeklyXp: 720, isCurrentUser: false },
    { name: 'Dilan M.', weeklyXp: 380, isCurrentUser: false },
    { name: 'Sajani K.', weeklyXp: 320, isCurrentUser: false },
  ];

  const userEntry: LeaderboardEntry = {
    name: displayName || 'You',
    weeklyXp: weeklyXp || 450,
    isCurrentUser: true,
  };

  return [...peers, userEntry]
    .sort((left, right) => right.weeklyXp - left.weeklyXp)
    .slice(0, 5);
}

export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function buildDashboardAnalyticsSnapshot(params: {
  profile: UserProfile | null;
  userData: Record<string, unknown> | null;
  gamification: Record<string, unknown> | null;
  progressEntries: ProgressEntry[];
  aiConversationDates?: Date[];
  now?: Date;
}): DashboardAnalyticsSnapshot {
  const { profile, userData, gamification, progressEntries, aiConversationDates = [], now = new Date() } = params;

  const enrolledSubjects = ((profile?.enrolledSubjects ?? []) as SubjectId[]).filter((subjectId) => Boolean(SUBJECT_MAP[subjectId]));
  const lessonCatalog = getAllLessonsForSubjects(enrolledSubjects);
  const progressMap = new Map(progressEntries.map((entry) => [entry.lessonId, entry]));
  const displayName = profile?.displayName?.split(' ')[0] || 'Student';
  const totalXp = Number(gamification?.xpTotal ?? profile?.xp ?? 0);
  const levelProgress = resolveLevelProgress(totalXp);
  const examYear = Number(profile?.examYear ?? new Date().getFullYear());
  const dailyGoalXP = Math.max(1, Number(gamification?.dailyGoalXP ?? 100));

  const activityMap = new Map<string, ActivityAggregate>();
  const touchActivity = (key: string) => {
    if (!activityMap.has(key)) {
      activityMap.set(key, { xp: 0, sessions: 0, completedLessons: 0 });
    }
    return activityMap.get(key)!;
  };

  progressEntries.forEach((entry) => {
    const attemptDate = toDate(entry.lastAttemptAt);
    if (!attemptDate) return;
    const key = getDateKey(attemptDate, SRI_LANKA_TIME_ZONE);
    const bucket = touchActivity(key);
    bucket.xp += estimateLessonXp(entry);
    bucket.sessions += Math.max(1, entry.attempts ?? 1);
    if (isCompletedStatus(entry.status)) {
      bucket.completedLessons += 1;
    }
  });

  aiConversationDates.forEach((conversationDate) => {
    const key = getDateKey(conversationDate, SRI_LANKA_TIME_ZONE);
    const bucket = touchActivity(key);
    bucket.xp += 12;
    bucket.sessions += 1;
  });

  const todayKey = getDateKey(now, SRI_LANKA_TIME_ZONE);
  const lastActivityDate = toDate(gamification?.lastActivityDate as TimeLike);
  const storedTodayXp = Number(gamification?.todayXP ?? 0);
  const bucketTodayXp = activityMap.get(todayKey)?.xp ?? 0;
  const todayXP =
    lastActivityDate && getDateKey(lastActivityDate, SRI_LANKA_TIME_ZONE) === todayKey
      ? Math.max(storedTodayXp, bucketTodayXp)
      : bucketTodayXp;

  const lessonSnapshots: LessonStatusSnapshot[] = lessonCatalog.map((lesson) => {
    const progress = progressMap.get(lesson.lessonId);
    return {
      ...lesson,
      progress,
      status: progress?.status ?? 'not_started',
      accuracy: typeof progress?.accuracy === 'number' ? progress.accuracy : null,
    };
  });

  const subjectAnalytics = enrolledSubjects.map((subjectId) => {
    const subject = SUBJECT_MAP[subjectId];
    const subjectLessons = lessonSnapshots.filter((lesson) => lesson.subjectId === subjectId);
    const unitSnapshots = getSubjectUnits(subjectId).map((unit) => {
      const lessons = subjectLessons.filter((lesson) => lesson.unitId === unit.id);
      const masteredLessons = lessons.filter((lesson) => lesson.status === 'mastered').length;
      const completedLessons = lessons.filter((lesson) => isCompletedStatus(lesson.status)).length;
      const status = getUnitStatus(lessons);

      return {
        unitId: unit.id,
        unitTitle: unit.title,
        status,
        completedLessons,
        masteredLessons,
        totalLessons: lessons.length,
        percentage: lessons.length > 0 ? Math.round((masteredLessons / lessons.length) * 100) : 0,
        href: `/dashboard/subjects/${subjectId}/${unit.id}`,
      } satisfies UnitProgressSnapshot;
    });

    const accuracyValues = subjectLessons
      .map((lesson) => lesson.accuracy)
      .filter((accuracy): accuracy is number => typeof accuracy === 'number');
    const totalTimeSpentSeconds = subjectLessons.reduce((total, lesson) => total + Number(lesson.progress?.timeSpent ?? 0), 0);
    const notStartedLessons = subjectLessons.filter((lesson) => lesson.status === 'not_started').length;
    const practicingLessons = subjectLessons.filter((lesson) => lesson.status === 'practicing').length;
    const proficientLessons = subjectLessons.filter((lesson) => lesson.status === 'proficient').length;
    const completedLessons = subjectLessons.filter((lesson) => isCompletedStatus(lesson.status)).length;
    const masteredLessons = subjectLessons.filter((lesson) => lesson.status === 'mastered').length;

    return {
      subjectId,
      name: subject.name,
      color: subject.color,
      icon: subject.icon,
      totalLessons: subjectLessons.length,
      notStartedLessons,
      practicingLessons,
      proficientLessons,
      completedLessons,
      masteredLessons,
      averageAccuracy: accuracyValues.length > 0 ? Math.round(accuracyValues.reduce((sum, accuracy) => sum + accuracy, 0) / accuracyValues.length) : 0,
      totalTimeSpentSeconds,
      masteredUnitCount: unitSnapshots.filter((unit) => unit.status === 'mastered').length,
      unitCompletionPercentage: unitSnapshots.length > 0 ? Math.round((unitSnapshots.filter((unit) => unit.status === 'mastered').length / unitSnapshots.length) * 100) : 0,
      units: unitSnapshots,
      continueHref: unitSnapshots.find((unit) => unit.status !== 'mastered')?.href ?? `/dashboard/subjects/${subjectId}`,
    } satisfies SubjectAnalytics;
  });

  const accuracyValues = progressEntries
    .map((entry) => (typeof entry.accuracy === 'number' ? entry.accuracy : null))
    .filter((accuracy): accuracy is number => accuracy !== null);
  const lessonsCompleted = lessonSnapshots.filter((lesson) => isCompletedStatus(lesson.status)).length;
  const totalStudyTimeSeconds = progressEntries.reduce((total, entry) => total + Number(entry.timeSpent ?? 0), 0);

  const weakAreas = subjectAnalytics
    .flatMap((subject) =>
      subject.units
        .map((unit) => {
          const lessons = lessonSnapshots.filter((lesson) => lesson.subjectId === subject.subjectId && lesson.unitId === unit.unitId);
          const lessonAccuracy = lessons
            .map((lesson) => lesson.accuracy)
            .filter((accuracy): accuracy is number => typeof accuracy === 'number');
          if (lessonAccuracy.length === 0) return null;

          return {
            subjectId: subject.subjectId,
            subjectName: subject.name,
            unitId: unit.unitId,
            unitTitle: unit.unitTitle,
            accuracy: Math.round(lessonAccuracy.reduce((sum, accuracy) => sum + accuracy, 0) / lessonAccuracy.length),
            href: unit.href,
          } satisfies WeakArea;
        })
        .filter((item): item is WeakArea => Boolean(item))
    )
    .filter((area) => area.accuracy < 60)
    .sort((left, right) => left.accuracy - right.accuracy);

  const recommendedLessons = lessonSnapshots
    .filter((lesson) => lesson.status === 'practicing' || lesson.status === 'not_started')
    .sort((left, right) => {
      const statusDelta = getStatusRank(right.status) - getStatusRank(left.status);
      if (statusDelta !== 0) return statusDelta;
      return left.lessonTitle.localeCompare(right.lessonTitle);
    })
    .slice(0, 6)
    .map((lesson) => ({
      subjectId: lesson.subjectId,
      subjectName: lesson.subjectName,
      subjectColor: lesson.subjectColor,
      unitId: lesson.unitId,
      unitTitle: lesson.unitTitle,
      lessonId: lesson.lessonId,
      lessonTitle: lesson.lessonTitle,
      durationMinutes: lesson.durationMinutes,
      href: lesson.href,
    }));

  const continueLesson = resolveLastVisitedLesson(userData?.lastVisitedLesson, lessonCatalog);
  const hasLastVisitedLesson = Boolean(continueLesson);
  const fallbackLesson = continueLesson ?? recommendedLessons[0] ?? lessonCatalog[0] ?? null;
  const continueProgress = fallbackLesson ? progressMap.get(fallbackLesson.lessonId) : undefined;
  const continueLessonStatus = continueProgress?.status ?? 'not_started';
  const continueLessonRemainingMinutes = fallbackLesson
    ? Math.max(
        5,
        fallbackLesson.durationMinutes -
          Math.round((Number(continueProgress?.timeSpent ?? 0) / 60) / Math.max(1, Number(continueProgress?.attempts ?? 1)))
      )
    : 0;

  const weeklyActivity = buildDaySeries(7, now).map((day) => {
    const aggregate = activityMap.get(day.key);
    return {
      key: day.key,
      label: day.label,
      shortLabel: day.shortLabel,
      xp: aggregate?.xp ?? 0,
      sessions: aggregate?.sessions ?? 0,
      didStudy: Boolean(aggregate && aggregate.xp > 0),
      isToday: day.isToday,
    } satisfies ActivityDay;
  });

  const lastThirtyDays = buildDaySeries(30, now);
  const maxCalendarXp = Math.max(...lastThirtyDays.map((day) => activityMap.get(day.key)?.xp ?? 0), 0);
  const studyCalendar = lastThirtyDays.map((day) => {
    const aggregate = activityMap.get(day.key);
    return {
      key: day.key,
      dayOfMonth: Number(day.key.slice(8, 10)),
      xp: aggregate?.xp ?? 0,
      intensity: quantizeIntensity(aggregate?.xp ?? 0, maxCalendarXp),
      didStudy: Boolean(aggregate && aggregate.xp > 0),
      isToday: day.isToday,
    } satisfies StudyCalendarDay;
  });

  const studyDayKeys = [...activityMap.entries()]
    .filter(([, aggregate]) => aggregate.xp > 0)
    .map(([key]) => key)
    .sort();

  const derivedCurrentStreak = deriveCurrentStreak(studyDayKeys, now);
  const derivedLongestStreak = deriveLongestStreak(studyDayKeys);
  const currentStreak = Math.max(derivedCurrentStreak, Number(gamification?.currentStreak ?? 0));
  const personalBestStreak = Math.max(derivedLongestStreak, Number(gamification?.longestStreak ?? 0));

  const primarySubject = subjectAnalytics.find((subject) => subject.subjectId === fallbackLesson?.subjectId) ?? subjectAnalytics[0] ?? null;
  const timelineMilestones =
    primarySubject?.units.slice(0, 3).map((unit) => {
      const status: TimelineMilestone['status'] =
        unit.status === 'mastered'
          ? 'complete'
          : unit.status === 'practicing' || unit.status === 'proficient'
            ? 'in_progress'
            : 'not_started';

      return {
        label: unit.unitTitle,
        status,
      };
    }) ?? [];

  const totalLessons = lessonSnapshots.length;
  const syllabusCompletionPercent = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  const sortedProgressDates = progressEntries
    .map((entry) => toDate(entry.lastAttemptAt))
    .filter((date): date is Date => Boolean(date))
    .sort((left, right) => left.getTime() - right.getTime());
  const firstProgressDate = sortedProgressDates[0] ?? null;
  const elapsedWeeks =
    firstProgressDate
      ? Math.max(1, (getDateStamp(now, SRI_LANKA_TIME_ZONE) - getDateStamp(firstProgressDate, SRI_LANKA_TIME_ZONE)) / DAY_IN_MS / 7)
      : 0;
  const lessonsPerWeek = elapsedWeeks > 0 ? lessonsCompleted / elapsedWeeks : 0;
  const remainingLessons = Math.max(0, totalLessons - lessonsCompleted);
  const projectedFinishLabel =
    lessonsPerWeek > 0
      ? new Intl.DateTimeFormat('en-US', {
          timeZone: SRI_LANKA_TIME_ZONE,
          month: 'long',
          year: 'numeric',
        }).format(new Date(now.getTime() + Math.ceil((remainingLessons / lessonsPerWeek) * 7) * DAY_IN_MS))
      : null;

  const firstLessonUnlockedAt = sortedProgressDates[0] ?? null;
  const perfectEntries = progressEntries
    .filter((entry) => entry.accuracy === 100)
    .map((entry) => toDate(entry.lastAttemptAt))
    .filter((date): date is Date => Boolean(date))
    .sort((left, right) => left.getTime() - right.getTime());
  const firstPerfectAccuracyAt = perfectEntries[0] ?? null;

  const highestDailyCompletedLessons = Math.max(
    0,
    ...[...activityMap.values()].map((aggregate) => aggregate.completedLessons)
  );

  const chemistryOrganicUnits = new Set(['ch-07', 'ch-08', 'ch-12']);
  const organicLessons = lessonSnapshots.filter(
    (lesson) => lesson.subjectId === 'chemistry' && chemistryOrganicUnits.has(lesson.unitId)
  );
  const organicAccuracy = organicLessons
    .map((lesson) => lesson.accuracy)
    .filter((accuracy): accuracy is number => typeof accuracy === 'number');
  const chemistryOrganicProgressPercent =
    organicAccuracy.length > 0 ? Math.min(100, Math.round((organicAccuracy.reduce((sum, accuracy) => sum + accuracy, 0) / organicAccuracy.length / 80) * 100)) : 0;

  const physicsSubject = subjectAnalytics.find((subject) => subject.subjectId === 'physics');
  const physicsCompletionPercent = physicsSubject?.unitCompletionPercentage ?? 0;
  const islandRankerProgressPercent = Math.min(100, Math.round((totalXp / 60000) * 100));

  const studyDayStamps = studyDayKeys.map(
    (key) => Date.UTC(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10)))
  );
  let comebackKidUnlocked = false;
  for (let index = 1; index < studyDayStamps.length; index += 1) {
    if (studyDayStamps[index] - studyDayStamps[index - 1] >= DAY_IN_MS * 8) {
      comebackKidUnlocked = true;
      break;
    }
  }

  return {
    displayName,
    greeting: getGreeting(now),
    examYear,
    daysToExam: getDaysToExam(examYear, now),
    examCountdownLabel: `A/L ${examYear}`,
    totalXp,
    lessonsCompleted,
    averageAccuracy: accuracyValues.length > 0 ? Math.round(accuracyValues.reduce((sum, accuracy) => sum + accuracy, 0) / accuracyValues.length) : 0,
    totalStudyTimeSeconds,
    currentStreak,
    personalBestStreak,
    dailyGoalXP,
    todayXP,
    dailyGoalProgress: Math.min(1, todayXP / dailyGoalXP),
    continueLesson: fallbackLesson,
    hasLastVisitedLesson,
    continueLessonStatus,
    continueLessonAccuracy: typeof continueProgress?.accuracy === 'number' ? continueProgress.accuracy : null,
    continueLessonRemainingMinutes,
    recommendedLessons,
    weakAreas,
    subjectAnalytics,
    weeklyActivity,
    studyCalendar,
    timelineMilestones,
    syllabusCompletionPercent,
    projectedFinishLabel,
    levelProgress,
    firstLessonUnlockedAt,
    firstPerfectAccuracyAt,
    highestDailyCompletedLessons,
    chemistryOrganicProgressPercent,
    physicsCompletionPercent,
    islandRankerProgressPercent,
    comebackKidUnlocked,
    leaderboardPreview: buildLeaderboardPreview(displayName, weeklyActivity.reduce((sum, day) => sum + day.xp, 0)),
  };
}
