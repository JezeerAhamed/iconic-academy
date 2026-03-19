'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { signInWithEmail, signInWithGoogle } = useAuth();

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return toast.error('Please enter email and password');

        setIsLoading(true);
        try {
            await signInWithEmail(email, password);
            toast.success('Welcome back!');
            // Router.push is handled inside AuthContext.signInWithEmail → /dashboard
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            toast.success('Welcome back!');
            // Router.push is handled inside AuthContext.signInWithGoogle → /dashboard
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none grid-bg opacity-30" />
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

                    <div className="text-center mb-8">
                        <Link href="/" className="mb-6 inline-flex items-center justify-center">
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
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
                        <p className="text-slate-400 text-sm">Sign in to continue your learning journey</p>
                    </div>

                    {/* Google sign-in — Primary */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 border-0 flex items-center justify-center gap-2 font-medium mb-6"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || googleLoading}
                    >
                        {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5">
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
                        <span className="text-xs text-slate-500 uppercase font-medium">Or sign in with email</span>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>

                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                <Input id="email" type="email" placeholder="name@example.com"
                                    className="pl-9 bg-black/20 border-white/10 focus:border-indigo-500/50"
                                    value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading || googleLoading} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="/auth/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                <Input id="password" type="password" placeholder="Your password"
                                    className="pl-9 bg-black/20 border-white/10 focus:border-indigo-500/50"
                                    value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading || googleLoading} />
                            </div>
                        </div>

                        <Button type="submit"
                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white border-0 mt-6"
                            disabled={isLoading || googleLoading}>
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-8">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign Up Free
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
