import { ProgressStatus } from '../types';

/**
 * Calculates the mastery level based on accuracy.
 * @param accuracy 0-100 score
 * @returns MasteryLevel
 */
export function calculateMastery(accuracy: number): ProgressStatus {
    if (accuracy >= 80) return 'mastered';
    if (accuracy >= 60) return 'proficient';
    return 'practicing';
}

/**
 * Returns text describing the mastery level.
 */
export function getMasteryLabel(status?: ProgressStatus): string {
    switch (status) {
        case 'mastered':
            return 'Mastered';
        case 'proficient':
            return 'Proficient';
        case 'practicing':
            return 'Practicing';
        case 'not_started':
        default:
            return 'Not Started';
    }
}

/**
 * Returns a color class for the mastery level.
 */
export function getMasteryColor(status?: ProgressStatus): string {
    switch (status) {
        case 'mastered':
            return 'text-cgreen-500';
        case 'proficient':
            return 'text-cyellow-500';
        case 'practicing':
            return 'text-cblue-500';
        case 'not_started':
        default:
            return 'text-cgray-300';
    }
}
