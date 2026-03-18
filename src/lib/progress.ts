import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Progress, ProgressStatus, SubjectId } from './types';
import { calculateMastery } from './utils/mastery';

/**
 * Saves a lesson attempt and updates the user's mastery level.
 * @param userId User's ID
 * @param subjectId Subject ID
 * @param unitId Unit ID
 * @param topicId Topic ID
 * @param lessonId Lesson ID
 * @param score Number of correct answers
 * @param totalQuestions Total number of questions
 * @param timeSpent Time spent in seconds
 * @returns The new mastery level
 */
export async function savePracticeAttempt(
    userId: string,
    subjectId: SubjectId,
    unitId: string,
    topicId: string,
    lessonId: string,
    score: number,
    totalQuestions: number,
    timeSpent: number
): Promise<ProgressStatus> {
    const accuracy = Math.round((score / totalQuestions) * 100);
    const newMasteryLevel = calculateMastery(accuracy);

    const progressRef = doc(db, 'studentProgress', userId, 'lessons', lessonId);
    const progressDoc = await getDoc(progressRef);

    const now = new Date().toISOString();

    if (progressDoc.exists()) {
        const data = progressDoc.data() as Progress;

        // Only update mastery level if the new one is better or if they improved accuracy
        let finalMasteryLevel = data.status;
        let finalAccuracy = data.accuracy || 0;

        if (accuracy > finalAccuracy) {
            finalAccuracy = accuracy;
            finalMasteryLevel = newMasteryLevel;
        }

        await updateDoc(progressRef, {
            status: finalMasteryLevel,
            accuracy: finalAccuracy,
            timeSpent: increment(timeSpent),
            attempts: increment(1),
            lastAttemptAt: now
        });

        return finalMasteryLevel;
    } else {
        const newProgress: Progress = {
            userId,
            subjectId,
            unitId,
            topicId,
            status: newMasteryLevel,
            accuracy,
            timeSpent,
            attempts: 1,
            lastAttemptAt: now
        };

        await setDoc(progressRef, newProgress);
        return newMasteryLevel;
    }
}

/**
 * Fetches mastery progress for a specific unit (all its lessons).
 */
export async function getUnitProgress(userId: string, unitId: string): Promise<Record<string, Progress>> {
    const lessonsRef = collection(db, 'studentProgress', userId, 'lessons');
    const q = query(lessonsRef, where('unitId', '==', unitId));

    const snapshot = await getDocs(q);
    const progressMap: Record<string, Progress> = {};

    snapshot.forEach((doc) => {
        progressMap[doc.id] = doc.data() as Progress;
    });

    return progressMap;
}

/**
 * Fetches mastery progress for a specific subject (all its lessons).
 */
export async function getSubjectProgress(userId: string, subjectId: string): Promise<Record<string, Progress>> {
    const lessonsRef = collection(db, 'studentProgress', userId, 'lessons');
    const q = query(lessonsRef, where('subjectId', '==', subjectId));

    const snapshot = await getDocs(q);
    const progressMap: Record<string, Progress> = {};

    snapshot.forEach((doc) => {
        progressMap[doc.id] = doc.data() as Progress;
    });

    return progressMap;
}
