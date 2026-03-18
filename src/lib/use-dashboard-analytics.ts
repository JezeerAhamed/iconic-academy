'use client';

import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';
import {
  DashboardAnalyticsSnapshot,
  ProgressEntry,
  buildDashboardAnalyticsSnapshot,
  toDate,
} from '@/lib/dashboard-intelligence';

type FirestoreRecord = Record<string, unknown>;

interface DashboardAnalyticsState {
  loading: boolean;
  analytics: DashboardAnalyticsSnapshot | null;
}

export function useDashboardAnalytics(profile: UserProfile | null): DashboardAnalyticsState {
  const [state, setState] = useState<DashboardAnalyticsState>({
    loading: true,
    analytics: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      if (!profile?.uid) {
        setState({ loading: false, analytics: null });
        return;
      }

      setState((current) => ({ ...current, loading: true }));

      try {
        const [userSnap, gamificationSnap, progressSnap, aiConversationResult] = await Promise.all([
          getDoc(doc(db, 'users', profile.uid)),
          getDoc(doc(db, 'gamification', profile.uid)),
          getDocs(collection(db, 'studentProgress', profile.uid, 'lessons')),
          getDocs(query(collection(db, 'ai_conversations'), where('userId', '==', profile.uid))).catch(() => null),
        ]);

        const progressEntries = progressSnap.docs.map(
          (snapshot) =>
            ({
              lessonId: snapshot.id,
              ...(snapshot.data() as Omit<ProgressEntry, 'lessonId'>),
            }) satisfies ProgressEntry
        );

        const aiConversationDates =
          aiConversationResult?.docs
            .map((snapshot) => toDate(snapshot.data().createdAt as string | number | Date | { toDate: () => Date } | null))
            .filter((date): date is Date => Boolean(date)) ?? [];

        const analytics = buildDashboardAnalyticsSnapshot({
          profile,
          userData: userSnap.exists() ? (userSnap.data() as FirestoreRecord) : null,
          gamification: gamificationSnap.exists() ? (gamificationSnap.data() as FirestoreRecord) : null,
          progressEntries,
          aiConversationDates,
        });

        if (!cancelled) {
          setState({ loading: false, analytics });
        }
      } catch (error) {
        console.error('Failed to load dashboard analytics:', error);
        if (!cancelled) {
          setState({ loading: false, analytics: null });
        }
      }
    }

    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  return state;
}
