'use client';

import { useEffect, useId, useRef, useState } from 'react';
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
    <div className="hidden md:flex items-center gap-2">
      <div className="h-9 w-24 animate-pulse rounded bg-cgray-100" />
      <div className="h-9 w-28 animate-pulse rounded bg-cgray-100" />
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuId = useId();

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const menuElement = mobileMenuRef.current;
    const focusableElements = menuElement?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusableElements?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!menuElement) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const activeFocusableElements = Array.from(
        menuElement.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (activeFocusableElements.length === 0) {
        return;
      }

      const firstElement = activeFocusableElements[0];
      const lastElement = activeFocusableElements[activeFocusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
      className="sticky top-0 z-[100] w-full border-b border-cgray-200 bg-white shadow-none"
    >
      <div className="mx-auto flex h-16 max-w-site items-center justify-between gap-4 px-6">
        <div className="flex items-center justify-between w-full gap-4">
          <Link href="/" className="text-xl font-bold text-cblue-500 tracking-tight hover:no-underline hover:text-cblue-600 transition-colors">
            <div className="relative h-8 w-[140px] overflow-hidden">
              <Image
                src="/logo.jpg"
                alt="Iconic Academy logo"
                fill
                priority
                sizes="140px"
                className="object-contain"
              />
            </div>
          </Link>

          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-base font-normal text-cgray-700 hover:text-cblue-500 hover:no-underline transition-colors whitespace-nowrap',
                  pathname === link.href
                    ? 'text-base font-semibold text-cblue-500'
                    : 'text-base font-normal text-cgray-700 hover:text-cblue-500 hover:no-underline transition-colors whitespace-nowrap'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {authLoading ? (
            <AuthLoadingSkeleton />
          ) : (
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-base font-semibold text-cblue-500 hover:no-underline transition-colors whitespace-nowrap"
                  >
                    Dashboard
                  </Link>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen((current) => !current)}
                      aria-expanded={dropdownOpen}
                      aria-haspopup="menu"
                      aria-label={`Open account menu for ${displayName}`}
                      className="flex items-center gap-2 text-left text-cgray-700 transition-colors hover:text-cgray-900"
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover cursor-pointer" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-cblue-500 text-white text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-cblue-600 transition-colors">
                          {avatarLetter}
                        </div>
                      )}
                      <span className="max-w-[96px] truncate text-sm font-semibold text-cgray-800">
                        {truncateName(displayName)}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-cgray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen ? (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-cgray-200 rounded shadow-dropdown min-w-[200px] py-2 z-50">
                        <div className="px-4 py-2">
                          <p className="truncate text-sm font-semibold text-cgray-900">{displayName}</p>
                          <p className="truncate text-xs text-cgray-500">{user.email}</p>
                        </div>

                        <div className="border-t border-cgray-200 my-1" />
                        <div>
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
                                'px-4 py-2 text-sm hover:bg-cgray-50 cursor-pointer transition-colors w-full text-left flex items-center gap-2',
                                pathname === item.href
                                  ? 'bg-cgray-50 font-semibold text-cblue-500'
                                  : 'text-cgray-700'
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          ))}
                        </div>

                        <div className="border-t border-cgray-200 my-1" />
                        <div>
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="px-4 py-2 text-sm text-cgray-700 hover:bg-cgray-50 cursor-pointer transition-colors w-full text-left flex items-center gap-2"
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
                    <Button variant="ghost" size="sm" className="btn-ghost btn-sm border border-cgray-700 text-cgray-900 hover:bg-cgray-50 shadow-none">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      size="sm"
                      className="btn-primary btn-sm border-0 shadow-none"
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
            type="button"
            ref={menuButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls={mobileMenuId}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="text-cgray-700 hover:text-cgray-900 p-1 -ml-1 md:hidden"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id={mobileMenuId}
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-cgray-200 bg-white"
          >
            <nav aria-label="Mobile navigation" className="px-6 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-base font-normal text-cgray-700 transition-colors hover:bg-cgray-50 hover:text-cblue-500 hover:no-underline',
                    pathname === link.href
                      ? 'bg-cgray-50 font-semibold text-cblue-500'
                      : 'text-cgray-700 hover:bg-cgray-50 hover:text-cblue-500'
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-cgray-200 flex flex-col gap-2">
                {authLoading ? (
                  <>
                    <div className="h-10 animate-pulse rounded bg-cgray-100" />
                    <div className="h-10 animate-pulse rounded bg-cgray-100" />
                  </>
                ) : user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-cgray-200 mb-2">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-cblue-500 flex items-center justify-center text-lg font-bold text-white uppercase">
                          {avatarLetter}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm font-semibold text-cgray-900">{displayName}</span>
                        <span className="truncate text-xs text-cgray-500">{user.email}</span>
                      </div>
                    </div>

                    {[
                      { label: 'Dashboard', href: '/dashboard' },
                      { label: 'My Subjects', href: '/dashboard/subjects' },
                      { label: 'Achievements', href: '/dashboard/achievements' },
                      { label: 'Settings', href: '/dashboard/settings' },
                    ].map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-cgray-700 hover:bg-cgray-50 hover:text-cblue-500 shadow-none">
                          {item.label}
                        </Button>
                      </Link>
                    ))}

                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full text-cgray-700 hover:text-cblue-500 hover:bg-cgray-50 justify-start shadow-none"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="btn-ghost w-full justify-start border border-cgray-700 text-cgray-900 hover:bg-cgray-50 shadow-none">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full btn-primary border-0 shadow-none">
                        Start Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
