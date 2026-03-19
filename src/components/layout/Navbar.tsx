'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, BookOpen, ChevronRight, ChevronDown, LayoutDashboard, Trophy, Settings, LogOut } from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { auth } from '@/lib/firebase';

function truncateName(name: string) {
  return name.length > 12 ? `${name.slice(0, 12)}...` : name;
}

function AuthLoadingSkeleton() {
  return (
    <div className="hidden md:flex items-center gap-3">
      <div className="h-9 w-24 animate-pulse rounded-lg bg-white/10" />
      <div className="h-9 w-28 animate-pulse rounded-lg bg-white/[0.06]" />
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    setDropdownOpen(false);
    setIsOpen(false);
    router.push('/');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass border-b border-white/5 py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-11 w-[156px] overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg transition-transform duration-200 group-hover:scale-[1.02]">
              <Image
                src="/logo.jpg"
                alt="Iconic Academy"
                fill
                priority
                sizes="156px"
                className="object-cover"
              />
            </div>
          </Link>

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

          {authLoading ? (
            <AuthLoadingSkeleton />
          ) : (
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                  >
                    Dashboard
                  </Link>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen((current) => !current)}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:bg-white/10"
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="h-8 w-8 rounded-full border border-white/20 object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                          {avatarLetter}
                        </div>
                      )}
                      <span className="max-w-[96px] truncate text-sm font-medium text-white">
                        {truncateName(displayName)}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen ? (
                      <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#111827] shadow-2xl shadow-black/40">
                        <div className="border-b border-white/5 px-4 py-3">
                          <p className="truncate text-sm font-medium text-white">{displayName}</p>
                          <p className="truncate text-xs text-slate-500">{user.email}</p>
                        </div>

                        <div className="py-1">
                          {[
                            { label: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
                            { label: 'My Subjects', href: '/dashboard/subjects', icon: BookOpen },
                            { label: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
                            { label: 'Settings', href: '/dashboard/settings', icon: Settings },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setDropdownOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                                pathname === item.href
                                  ? 'bg-indigo-500/10 text-indigo-400'
                                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          ))}
                        </div>

                        <div className="border-t border-white/5 py-1">
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </>
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
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
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
                {authLoading ? (
                  <>
                    <div className="h-10 animate-pulse rounded-xl bg-white/10" />
                    <div className="h-10 animate-pulse rounded-xl bg-white/[0.06]" />
                  </>
                ) : user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 mb-2">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-white/20 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-lg font-bold text-white uppercase">
                          {avatarLetter}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm font-medium text-white">{displayName}</span>
                        <span className="truncate text-xs text-slate-500">{user.email}</span>
                      </div>
                    </div>

                    {[
                      { label: 'Dashboard', href: '/dashboard' },
                      { label: 'My Subjects', href: '/dashboard/subjects' },
                      { label: 'Achievements', href: '/dashboard/achievements' },
                      { label: 'Settings', href: '/dashboard/settings' },
                    ].map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 justify-start">
                          {item.label}
                        </Button>
                      </Link>
                    ))}

                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
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
                        Start Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
