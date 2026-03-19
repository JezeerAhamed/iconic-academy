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
import { Button } from '@/components/ui/button';
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
      <Card className="border-white/10 bg-[#0b101a] py-6">
        <CardContent className="space-y-4">
          <div className="h-10 w-56 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-white/5" />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-[#0b101a] py-6">
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                <div className="h-12 animate-pulse rounded-2xl bg-white/[0.04]" />
              </div>
            ))}
            <div className="h-12 w-40 animate-pulse rounded-xl bg-white/10" />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b101a] py-6">
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
                <div className="h-12 animate-pulse rounded-2xl bg-white/[0.04]" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-[#0b101a] py-6">
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-48 animate-pulse rounded bg-white/5" />
              </div>
              <div className="h-10 w-32 animate-pulse rounded-xl bg-white/[0.04]" />
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
          setLanguagePreference(
            userData?.languagePreference === 'Tamil' ? 'Tamil' : 'English'
          );
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
        <Card className="border-white/10 bg-[#0b101a] py-6">
          <CardContent className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Settings</p>
            <h1 className="text-3xl font-black tracking-tight text-white">Manage your profile, learning preferences, and account access.</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-300">
              Update your study identity, language preference, and daily XP target without leaving the dashboard.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-white/10 bg-[#0b101a] py-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="text-xl font-semibold text-white">Profile Settings</CardTitle>
                  <p className="text-sm text-slate-400">Keep your academic profile up to date.</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Display name</span>
                <Input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="h-12 border-white/10 bg-white/[0.03] text-white"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">School name</span>
                <Input
                  value={schoolName}
                  onChange={(event) => setSchoolName(event.target.value)}
                  className="h-12 border-white/10 bg-white/[0.03] text-white"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">District</span>
                <select
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition focus:border-violet-400"
                >
                  <option value="" className="bg-[#0b101a] text-white">Select district</option>
                  {DISTRICTS.map((districtName) => (
                    <option key={districtName} value={districtName} className="bg-[#0b101a] text-white">
                      {districtName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Exam year</span>
                <select
                  value={examYear}
                  onChange={(event) => setExamYear(Number(event.target.value))}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition focus:border-violet-400"
                >
                  {EXAM_YEARS.map((year) => (
                    <option key={year} value={year} className="bg-[#0b101a] text-white">
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="h-12 bg-violet-600 text-white hover:bg-violet-500"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0b101a] py-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                  <Shield className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="text-xl font-semibold text-white">Learning Preferences</CardTitle>
                  <p className="text-sm text-slate-400">Tune the platform to your study rhythm.</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-300">Language preference</span>
                <div className="flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                  {LANGUAGE_OPTIONS.map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => setLanguagePreference(language)}
                      className={[
                        'flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition',
                        languagePreference === language
                          ? 'bg-white text-black'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white',
                      ].join(' ')}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Daily XP goal</span>
                <select
                  value={dailyGoalXP}
                  onChange={(event) => setDailyGoalXP(Number(event.target.value))}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition focus:border-violet-400"
                >
                  {DAILY_GOALS.map((goal) => (
                    <option key={goal} value={goal} className="bg-[#0b101a] text-white">
                      {goal} XP
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-300">Subscription tier</p>
                    <p className="mt-1 text-sm text-slate-500">Manage billing and plan upgrades from your billing page.</p>
                  </div>
                  <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                    {formatPlan(subscriptionTier)}
                  </span>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="mt-4 inline-flex text-sm font-semibold text-violet-300 transition hover:text-violet-200"
                >
                  Manage Subscription
                </Link>
              </div>

              <Button
                onClick={handleSavePreferences}
                disabled={savingPreferences}
                className="h-12 bg-emerald-600 text-white hover:bg-emerald-500"
              >
                {savingPreferences ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-[#0b101a] py-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Account</CardTitle>
                <p className="text-sm text-slate-400">Security and account-level actions.</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-slate-300">Email</p>
              <p className="mt-2 text-sm text-slate-400">{user.email || 'No email available'}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleSendPasswordReset}
                disabled={sendingReset}
                variant="outline"
                className="h-12 border-white/10 bg-white/[0.03] text-white hover:bg-white/10"
              >
                {sendingReset ? 'Sending...' : 'Change Password'}
              </Button>

              <Button
                onClick={handleSignOut}
                disabled={signingOut}
                variant="outline"
                className="h-12 border-white/10 bg-white/[0.03] text-white hover:bg-white/10"
              >
                {signingOut ? 'Signing Out...' : 'Sign Out'}
              </Button>

              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="destructive"
                className="h-12"
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b101a] p-6 shadow-2xl">
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-white">Are you sure? This cannot be undone.</h2>
              <p className="text-sm leading-6 text-slate-300">
                Deleting your account removes your user record and signs you out permanently.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
                className="border-white/10 bg-white/[0.03] text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? 'Deleting...' : 'Delete Forever'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
