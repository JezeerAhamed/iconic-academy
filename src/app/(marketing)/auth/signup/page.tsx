'use client';

import Image from 'next/image';
import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function SignUpCardSkeleton() {
    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden p-4 pt-20">
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
            <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]" />
            <div className="absolute -left-32 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />

            <div className="glass relative mt-6 w-full max-w-md overflow-hidden rounded-3xl border border-white/5 p-8 shadow-2xl">
                <div className="absolute left-1/2 top-0 h-1 w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-6 h-12 w-12 animate-pulse rounded-2xl bg-white/10" />
                    <div className="mx-auto h-8 w-48 animate-pulse rounded bg-white/10" />
                    <div className="mx-auto mt-3 h-4 w-64 animate-pulse rounded bg-white/5" />
                </div>
                <div className="space-y-4">
                    <div className="h-11 animate-pulse rounded-xl bg-white/10" />
                    <div className="h-px bg-white/5" />
                    <div className="h-11 animate-pulse rounded-xl bg-white/5" />
                    <div className="h-11 animate-pulse rounded-xl bg-white/5" />
                    <div className="h-11 animate-pulse rounded-xl bg-white/5" />
                    <div className="h-11 animate-pulse rounded-xl bg-white/10" />
                </div>
            </div>
        </div>
    );
}

function SignUpPageContent() {
    const searchParams = useSearchParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { signUpWithEmail, signInWithGoogle } = useAuth();
    const selectedPlan = searchParams.get('plan');

    const handleEmailSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!name || !email || !password) return toast.error('Please fill in all fields');
        if (password.length < 6) return toast.error('Password must be at least 6 characters');

        setIsLoading(true);
        try {
            await signUpWithEmail(email, password, name);
            toast.success('Account created! Welcome to ICONIC ACADEMY!');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            toast.success('Welcome to ICONIC ACADEMY!');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Google sign-up failed. Please try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden p-4 pt-20">
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
            <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]" />
            <div className="absolute -left-32 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass relative mt-6 overflow-hidden rounded-3xl border border-white/5 p-8 shadow-2xl">
                    <div className="absolute left-1/2 top-0 h-1 w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

                    <div className="mb-8 text-center">
                        <Link
                            href="/"
                            className="mb-6 inline-flex items-center justify-center"
                        >
                            <div className="relative h-14 w-[180px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-indigo-500/15">
                                <Image
                                    src="/logo.jpg"
                                    alt="Iconic Academy"
                                    fill
                                    priority
                                    sizes="180px"
                                    className="object-cover"
                                />
                            </div>
                        </Link>
                        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">Create Account</h1>
                        <p className="text-sm text-slate-400">
                            {selectedPlan
                                ? `You are starting with the ${selectedPlan} plan selection.`
                                : 'Start your premium A/L learning journey'}
                        </p>
                        {selectedPlan ? (
                            <div className="mt-4 inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                                Plan selected: {selectedPlan}
                            </div>
                        ) : null}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="mb-6 flex h-11 w-full items-center justify-center gap-2 border-0 bg-white font-medium text-slate-900 hover:bg-slate-100"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || googleLoading}
                    >
                        {googleLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <svg viewBox="0 0 24 24" className="h-5 w-5">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        Continue with Google
                    </Button>

                    <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-xs font-medium uppercase text-slate-500">Or sign up with email</span>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>

                    <form onSubmit={handleEmailSignUp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="border-white/10 bg-black/20 pl-9 focus:border-indigo-500/50"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    disabled={isLoading || googleLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="border-white/10 bg-black/20 pl-9 focus:border-indigo-500/50"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={isLoading || googleLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="At least 6 characters"
                                    className="border-white/10 bg-black/20 pl-9 focus:border-indigo-500/50"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    disabled={isLoading || googleLoading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="mt-6 h-11 w-full border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700"
                            disabled={isLoading || googleLoading}
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-medium text-indigo-400 transition-colors hover:text-indigo-300">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<SignUpCardSkeleton />}>
            <SignUpPageContent />
        </Suspense>
    );
}
