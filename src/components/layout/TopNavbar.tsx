'use client';

import { usePathname } from 'next/navigation';
import PublicNavbar from './Navbar';

export default function TopNavbar() {
  const pathname = usePathname();

  if (pathname === '/onboarding') return null;
  if (pathname.startsWith('/dashboard')) return null;

  return <PublicNavbar />;
}
