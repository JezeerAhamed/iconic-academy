import { UserLevel } from './types';
import { db } from './firebase';
import { doc, updateDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore';

export const LEVEL_THRESHOLDS = {
    Beginner: 0,
    Intermediate: 5000,
    Advanced: 15000,
    Ranker: 40000,
};

export const getNextLevel = (currentLevel: UserLevel): UserLevel | 'Max' => {
    switch (currentLevel) {
        case 'Beginner': return 'Intermediate';
        case 'Intermediate': return 'Advanced';
        case 'Advanced': return 'Ranker';
        case 'Ranker': return 'Max';
        default: return 'Intermediate';
    }
};

export const getLevelProgress = (xp: number, level: UserLevel) => {
    const currentThreshold = LEVEL_THRESHOLDS[level];
    const nextLevelName = getNextLevel(level);

    if (nextLevelName === 'Max') {
        return { currentXPInLevel: xp, requiredXP: xp, percentage: 100 };
    }

    const nextThreshold = LEVEL_THRESHOLDS[nextLevelName];
    const requiredXP = nextThreshold - currentThreshold;
    const currentXPInLevel = Math.max(0, xp - currentThreshold);
    const percentage = Math.min(100, Math.max(0, (currentXPInLevel / requiredXP) * 100));

    return {
        currentXPInLevel,
        requiredXP,
        percentage
    };
};

export const awardXP = async (userId: string, xpReward: number) => {
    if (!userId || !xpReward) return;
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const currentXp = userSnap.data().xp || 0;
            const currentLevel = userSnap.data().level || 'Beginner';
            const newXp = currentXp + xpReward;

            // Check for level up
            const nextLevel = getNextLevel(currentLevel);
            let levelToSet = currentLevel;

            if (nextLevel !== 'Max' && newXp >= LEVEL_THRESHOLDS[nextLevel]) {
                levelToSet = nextLevel; // Leveled up!
            }

            await updateDoc(userRef, {
                xp: increment(xpReward),
                level: levelToSet,
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error awarding XP:", error);
    }
};
