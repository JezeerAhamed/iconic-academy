// =====================================================
// ICONIC ACADEMY – Core Type Definitions
// =====================================================

export type SubjectId = 'physics' | 'chemistry' | 'biology' | 'maths';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ContentType = 'video' | 'text' | 'mixed';
export type ProgressStatus = 'not_started' | 'in_progress' | 'mastered';
export type UserLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Ranker';
export type SubscriptionPlan = 'free' | 'pro' | 'elite';

// ── Syllabus Structure ──────────────────────────────

export interface Subject {
    id: SubjectId;
    name: string;
    description: string;
    icon: string;
    color: string;
    colorLight: string;
    gradient: string;
    bgGradient: string;
    unitCount: number;
    lessonCount: number;
}

export interface Unit {
    id: string;
    subjectId: SubjectId;
    title: string;
    description: string;
    order: number;
    topicCount: number;
    lessonCount: number;
    isLocked?: boolean;
}

export interface Topic {
    id: string;
    unitId: string;
    subjectId: SubjectId;
    title: string;
    description: string;
    order: number;
    status?: ProgressStatus;
    isLocked?: boolean;
}

export interface PracticeQuestion {
    id: string;
    question: string;
    options?: string[];
    answer: string;
    explanation: string;
    type: 'mcq' | 'structured' | 'essay';
    marks: number;
}

export interface Lesson {
    id: string;
    subjectId: SubjectId;
    unitId: string;
    topicId: string;
    title: string;
    contentType: ContentType;
    explanation: string;
    examples: string[];
    practiceQuestions: PracticeQuestion[];
    examTips: string;
    difficultyLevel: DifficultyLevel;
    duration: number; // minutes
    videoUrl?: string;
    isPremium?: boolean;
    order: number;
}

// ── User & Progress ─────────────────────────────────

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    subjects: SubjectId[];
    level: UserLevel;
    examYear: number;
    plan: SubscriptionPlan;
    xp: number;
    streak: number;
    lastLoginDate: string;
    badges: string[];
    createdAt: string;
}

export interface Progress {
    userId: string;
    subjectId: SubjectId;
    unitId: string;
    topicId: string;
    status: ProgressStatus;
    accuracy: number;
    timeSpent: number; // seconds
    lastAttemptAt: string;
    attempts: number;
}

export interface Attempt {
    id: string;
    userId: string;
    lessonId: string;
    subjectId: SubjectId;
    answers: Record<string, string>;
    score: number;
    accuracy: number;
    timeTaken: number;
    completedAt: string;
}

// ── AI & Interactions ───────────────────────────────

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    subjectId?: SubjectId;
    unitId?: string;
    topicId?: string;
}

export interface AIInteraction {
    id: string;
    userId: string;
    messages: AIMessage[];
    subjectContext?: SubjectId;
    createdAt: string;
    updatedAt: string;
}

// ── Gamification ─────────────────────────────────────

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    condition: string;
    unlockedAt?: string;
}

export interface XPEvent {
    id: string;
    userId: string;
    eventType: 'lesson_complete' | 'practice_complete' | 'streak' | 'badge';
    xpEarned: number;
    description: string;
    createdAt: string;
}

// ── Past Papers ──────────────────────────────────────

export interface PastPaper {
    id: string;
    subjectId: SubjectId;
    unitId?: string;
    year: number;
    semester?: 1 | 2;
    title: string;
    questions: PastPaperQuestion[];
    isPremium: boolean;
}

export interface PastPaperQuestion {
    id: string;
    question: string;
    marks: number;
    stepByStepSolution: string[];
    markingScheme: string;
    examinerInsights?: string;
}

// ── Dashboard Analytics ──────────────────────────────

export interface SubjectProgress {
    subjectId: SubjectId;
    completedLessons: number;
    totalLessons: number;
    averageAccuracy: number;
    timeSpent: number;
    weakTopics: string[];
    strongTopics: string[];
}

export interface DailyTask {
    id: string;
    title: string;
    type: 'lesson' | 'practice' | 'revision' | 'past_paper';
    subjectId: SubjectId;
    topicId?: string;
    lessonId?: string;
    isCompleted: boolean;
    estimatedTime: number;
}
