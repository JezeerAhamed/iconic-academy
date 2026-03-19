'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  User,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { AlertTriangle, Shield, UserRound } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
] as const;

const EXAM_YEARS = [2025, 2026, 2027] as const;
const DAILY_GOALS = [50, 100, 150, 200] as const;
const LANGUAGE_OPTIONS = ['English', 'Tamil'] as const;

function formatPlan(plan: string) {
  if (!plan) return 'Free';
  return plan
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <Card className="c-card py-6">
        <CardContent className="space-y-4">
          <div className="h-10 w-56 animate-pulse rounded bg-cgray-100" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-cgray-100" />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="c-card py-6">
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-cgray-100" />
                <div className="h-12 animate-pulse rounded bg-cgray-100" />
              </div>
            ))}
            <div className="h-12 w-40 animate-pulse rounded bg-cgray-100" />
          </CardContent>
        </Card>

        <Card className="c-card py-6">
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-36 animate-pulse rounded bg-cgray-100" />
                <div className="h-12 animate-pulse rounded bg-cgray-100" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="c-card py-6">
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4 rounded border border-cgray-200 bg-cgray-50 p-4">
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-cgray-100" />
                <div className="h-4 w-48 animate-pulse rounded bg-cgray-100" />
              </div>
              <div className="h-10 w-32 animate-pulse rounded bg-cgray-100" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [district, setDistrict] = useState('');
  const [examYear, setExamYear] = useState<number>(2026);
  const [languagePreference, setLanguagePreference] = useState<(typeof LANGUAGE_OPTIONS)[number]>('English');
  const [dailyGoalXP, setDailyGoalXP] = useState<number>(100);
  const [subscriptionTier, setSubscriptionTier] = useState('free');

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!isActive) return;

        if (!currentUser) {
          setUser(null);
          setLoading(false);
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);

        try {
          const [userSnap, gamificationSnap] = await Promise.all([
            getDoc(doc(db, 'users', currentUser.uid)),
            getDoc(doc(db, 'gamification', currentUser.uid)),
          ]);

          if (!isActive) return;

          const userData = userSnap.data();
          const gamificationData = gamificationSnap.data();

          setDisplayName(
            (typeof userData?.fullName === 'string' && userData.fullName) ||
            (typeof userData?.displayName === 'string' && userData.displayName) ||
            currentUser.displayName ||
            ''
          );
          setSchoolName(typeof userData?.schoolName === 'string' ? userData.schoolName : '');
          setDistrict(typeof userData?.district === 'string' ? userData.district : '');
          setExamYear(
            typeof userData?.examYear === 'number' && EXAM_YEARS.includes(userData.examYear as (typeof EXAM_YEARS)[number])
              ? userData.examYear
              : 2026
          );
          setLanguagePreference(userData?.languagePreference === 'Tamil' ? 'Tamil' : 'English');
          setDailyGoalXP(
            typeof gamificationData?.dailyGoalXP === 'number' && DAILY_GOALS.includes(gamificationData.dailyGoalXP as (typeof DAILY_GOALS)[number])
              ? gamificationData.dailyGoalXP
              : 100
          );
          setSubscriptionTier(typeof userData?.plan === 'string' ? userData.plan : 'free');
        } catch (error) {
          console.error('Failed to load settings', error);
          toast.error('Failed to load settings.');
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      },
      (error) => {
        const errorCode =
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          typeof (error as { code?: unknown }).code === 'string'
            ? (error as { code: string }).code
            : 'unknown';
        console.warn('Auth check:', errorCode);
        if (isActive) {
          setLoading(false);
        }
      }
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [router]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: displayName,
        displayName,
        schoolName,
        district,
        examYear,
      });
      toast.success('Profile updated!');
    } catch (error) {
      console.error('Failed to save profile', error);
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setSavingPreferences(true);

    try {
      await Promise.all([
        updateDoc(doc(db, 'users', user.uid), {
          languagePreference,
        }),
        updateDoc(doc(db, 'gamification', user.uid), {
          dailyGoalXP,
        }),
      ]);
      toast.success('Preferences updated!');
    } catch (error) {
      console.error('Failed to save preferences', error);
      toast.error('Failed to update preferences.');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) {
      toast.error('No email found for this account.');
      return;
    }

    setSendingReset(true);

    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Failed to send password reset email', error);
      toast.error('Failed to send password reset email.');
    } finally {
      setSendingReset(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('Failed to sign out', error);
      toast.error('Failed to sign out.');
    } finally {
      setSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeletingAccount(true);

    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      toast.success('Account deleted.');
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account', error);
      toast.error('Failed to delete account. You may need to sign in again before deleting.');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="space-y-6 pb-12">
        <Card className="c-card py-6">
          <CardContent className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cblue-500">Settings</p>
            <h1 className="text-3xl font-bold tracking-tight text-cgray-900">
              Manage your profile, learning preferences, and account access.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-cgray-600">
              Update your study identity, language preference, and daily XP target without leaving the
              dashboard.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="c-card py-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-cblue-50 text-cblue-500">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="text-xl font-semibold text-cgray-900">Profile Settings</CardTitle>
                  <p className="text-sm text-cgray-500">Keep your academic profile up to date.</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-cgray-700">Display name</span>
                <Input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="c-input h-12"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-cgray-700">School name</span>
                <Input
                  value={schoolName}
                  onChange={(event) => setSchoolName(event.target.value)}
                  className="c-input h-12"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-cgray-700">District</span>
                <select
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  className="c-input h-12 bg-white"
                >
                  <option value="">Select district</option>
                  {DISTRICTS.map((districtName) => (
                    <option key={districtName} value={districtName}>
                      {districtName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-cgray-700">Exam year</span>
                <select
                  value={examYear}
                  onChange={(event) => setExamYear(Number(event.target.value))}
                  className="c-input h-12 bg-white"
                >
                  {EXAM_YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </CardContent>
          </Card>

          <Card className="c-card py-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-cblue-50 text-cblue-500">
                  <Shield className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="text-xl font-semibold text-cgray-900">Learning Preferences</CardTitle>
                  <p className="text-sm text-cgray-500">Tune the platform to your study rhythm.</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <span className="text-sm font-semibold text-cgray-700">Language preference</span>
                <div className="flex rounded border border-cgray-200 bg-cgray-50 p-1">
                  {LANGUAGE_OPTIONS.map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => setLanguagePreference(language)}
                      className={languagePreference === language ? 'btn-primary btn-sm flex-1' : 'btn-ghost btn-sm flex-1'}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-cgray-700">Daily XP goal</span>
                <select
                  value={dailyGoalXP}
                  onChange={(event) => setDailyGoalXP(Number(event.target.value))}
                  className="c-input h-12 bg-white"
                >
                  {DAILY_GOALS.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal} XP
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded border border-cgray-200 bg-cgray-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-cgray-700">Subscription tier</p>
                    <p className="mt-1 text-sm text-cgray-500">Manage billing and plan upgrades from your billing page.</p>
                  </div>
                  <span className="c-badge-blue normal-case tracking-normal">{formatPlan(subscriptionTier)}</span>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="mt-4 inline-flex text-sm font-semibold text-cblue-500 transition hover:text-cblue-600"
                >
                  Manage Subscription
                </Link>
              </div>

              <button
                onClick={handleSavePreferences}
                disabled={savingPreferences}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingPreferences ? 'Saving...' : 'Save Preferences'}
              </button>
            </CardContent>
          </Card>
        </div>

        <Card className="c-card py-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-cgray-100 text-cgray-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-xl font-semibold text-cgray-900">Account</CardTitle>
                <p className="text-sm text-cgray-500">Security and account-level actions.</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded border border-cgray-200 bg-cgray-50 p-4">
              <p className="text-sm font-semibold text-cgray-700">Email</p>
              <p className="mt-2 text-sm text-cgray-500">{user.email || 'No email available'}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleSendPasswordReset}
                disabled={sendingReset}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingReset ? 'Sending...' : 'Change Password'}
              </button>

              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {signingOut ? 'Signing Out...' : 'Sign Out'}
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center justify-center rounded bg-cred-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-cred-600"
              >
                Delete Account
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cgray-900/20 p-4 backdrop-blur-sm">
          <div className="c-card w-full max-w-md p-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-cgray-900">Are you sure? This cannot be undone.</h2>
              <p className="text-sm leading-6 text-cgray-600">
                Deleting your account removes your user record and signs you out permanently.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="inline-flex items-center justify-center rounded bg-cred-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-cred-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingAccount ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
