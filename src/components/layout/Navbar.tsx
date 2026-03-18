'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                scrolled
                    ? 'glass border-b border-white/5 py-3'
                    : 'bg-transparent py-5'
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-200" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-base font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                ICONIC
                            </span>
                            <span className="text-[10px] text-indigo-400 font-medium tracking-widest uppercase">
                                Academy
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                    pathname === link.href
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                                >
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                                    <div className="flex items-center gap-2">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white uppercase">
                                                {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-white max-w-[100px] truncate">
                                            {user.displayName || 'Student'}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => signOut()}
                                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 px-3"
                                    >
                                        Sign Out
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/5">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/25 font-semibold"
                                    >
                                        Start Free
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden glass border-t border-white/5 mt-2"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                                        pathname === link.href
                                            ? 'bg-indigo-500/20 text-indigo-400'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    )}
                                >
                                    <BookOpen className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 mb-2">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-white/20" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-lg font-bold text-white uppercase">
                                                    {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white border-none bg-transparent m-0 p-0 text-left">
                                                    {user.displayName || 'Student'}
                                                </span>
                                                <span className="text-xs text-slate-500">{user.email}</span>
                                            </div>
                                        </div>
                                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 justify-start">
                                                Go to Dashboard
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            onClick={() => { signOut(); setIsOpen(false); }}
                                            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start"
                                        >
                                            Sign Out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                                            <Button variant="ghost" className="w-full text-slate-400 hover:text-white justify-start">
                                                Sign In
                                            </Button>
                                        </Link>
                                        <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                                                Start For Free
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
