import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SubjectId, UserLevel } from "./types";
import { LEVEL_THRESHOLDS } from "./constants";

// ShadCN utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get Level from XP
export function getLevelFromXP(xp: number): UserLevel {
  if (xp >= LEVEL_THRESHOLDS.Ranker) return 'Ranker';
  if (xp >= LEVEL_THRESHOLDS.Advanced) return 'Advanced';
  if (xp >= LEVEL_THRESHOLDS.Intermediate) return 'Intermediate';
  return 'Beginner';
}

// Get XP progress to next level (0-100)
export function getXPProgress(xp: number): number {
  if (xp >= LEVEL_THRESHOLDS.Ranker) return 100;
  if (xp >= LEVEL_THRESHOLDS.Advanced) {
    return Math.round(((xp - LEVEL_THRESHOLDS.Advanced) / (LEVEL_THRESHOLDS.Ranker - LEVEL_THRESHOLDS.Advanced)) * 100);
  }
  if (xp >= LEVEL_THRESHOLDS.Intermediate) {
    return Math.round(((xp - LEVEL_THRESHOLDS.Intermediate) / (LEVEL_THRESHOLDS.Advanced - LEVEL_THRESHOLDS.Intermediate)) * 100);
  }
  return Math.round((xp / LEVEL_THRESHOLDS.Intermediate) * 100);
}

// Subject color utility
export function getSubjectColor(subjectId: SubjectId): string {
  const colors: Record<SubjectId, string> = {
    physics: '#3b82f6',
    chemistry: '#f97316',
    biology: '#22c55e',
    maths: '#a855f7',
  };
  return colors[subjectId] || '#6366f1';
}

// Format time in minutes to readable string
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Format seconds to MM:SS
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Calculate completion percentage
export function calcCompletion(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Get streak emoji
export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥';
  if (streak >= 14) return '⚡';
  if (streak >= 7) return '✨';
  if (streak >= 3) return '🌟';
  return '💫';
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Date helpers
export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
