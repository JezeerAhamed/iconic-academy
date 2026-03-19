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
        <div className="min-h-screen bg-cgray-50 flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-white rounded-lg border border-cgray-200 shadow-card p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="mx-auto h-10 w-40 animate-pulse rounded bg-cgray-100" />
                    <div className="mx-auto mt-4 h-8 w-52 animate-pulse rounded bg-cgray-100" />
                    <div className="mx-auto mt-3 h-4 w-64 animate-pulse rounded bg-cgray-100" />
                </div>
                <div className="space-y-4">
                    <div className="h-11 animate-pulse rounded bg-cgray-100" />
                    <div className="h-px bg-cgray-200" />
                    <div className="h-11 animate-pulse rounded bg-cgray-100" />
                    <div className="h-11 animate-pulse rounded bg-cgray-100" />
                    <div className="h-11 animate-pulse rounded bg-cgray-100" />
                    <div className="h-11 animate-pulse rounded bg-cgray-100" />
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
        <div className="min-h-screen bg-cgray-50 flex flex-col items-center justify-center py-16 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-lg border border-cgray-200 shadow-card p-8 w-full max-w-md">
                    <div className="text-center mb-6">
                        <Link href="/" className="inline-flex flex-col items-center justify-center hover:no-underline">
                            <div className="relative h-12 w-[148px] overflow-hidden">
                                <Image
                                    src="/logo.jpg"
                                    alt="Iconic Academy"
                                    fill
                                    priority
                                    sizes="148px"
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-2xl font-bold text-cblue-500 tracking-tight">ICONIC ACADEMY</span>
                            <span className="text-sm text-cgray-500 mt-1">Sri Lanka&apos;s A/L learning platform</span>
                        </Link>
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-cgray-900 mb-1">Join ICONIC ACADEMY</h1>
                        <p className="text-sm text-cgray-500 mb-6">
                            {selectedPlan
                                ? `You are starting with the ${selectedPlan} plan selection.`
                                : 'Start your premium A/L learning journey'}
                        </p>
                        {selectedPlan ? (
                            <div className="mt-4 inline-flex rounded-full border border-cblue-200 bg-cblue-25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cblue-600">
                                Plan selected: {selectedPlan}
                            </div>
                        ) : null}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-cgray-200 rounded bg-white text-cgray-700 font-semibold text-sm hover:bg-cgray-50 transition-colors duration-150 mb-4 h-auto shadow-none"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || googleLoading}
                    >
                        {googleLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        Continue with Google
                    </Button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 border-t border-cgray-200" />
                        <span className="text-xs text-cgray-400 font-medium whitespace-nowrap">OR SIGN UP WITH EMAIL</span>
                        <div className="flex-1 border-t border-cgray-200" />
                    </div>

                    <form onSubmit={handleEmailSignUp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="block text-sm font-semibold text-cgray-700 mb-1">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cgray-400" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="c-input h-auto pl-9"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    disabled={isLoading || googleLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="block text-sm font-semibold text-cgray-700 mb-1">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cgray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="c-input h-auto pl-9"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={isLoading || googleLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="block text-sm font-semibold text-cgray-700 mb-1">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cgray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="At least 6 characters"
                                    className="c-input h-auto pl-9"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    disabled={isLoading || googleLoading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="btn-primary w-full mt-2 h-auto border-0 shadow-none"
                            disabled={isLoading || googleLoading}
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
                        </Button>
                    </form>

                    <div className="text-center mt-5 pt-5 border-t border-cgray-100">
                        <p className="text-sm text-cgray-600">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-sm font-semibold text-cblue-500 hover:text-cblue-600">
                                Sign In
                            </Link>
                        </p>
                    </div>
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
