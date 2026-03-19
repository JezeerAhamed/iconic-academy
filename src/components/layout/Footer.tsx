'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Instagram, Mail, MessageCircle, Phone, Youtube } from 'lucide-react';
import { SUBJECTS } from '@/lib/constants';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="border-t border-white/5 bg-[#060a11]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative h-12 w-[180px] overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg">
                <Image
                  src="/logo.jpg"
                  alt="Iconic Academy"
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-slate-500">
              Sri Lanka&apos;s A/L learning platform with AI tutoring, past papers, and structured science subject coverage.
            </p>

            <div className="flex items-center gap-3">
              <SocialLink
                href="https://www.youtube.com/results?search_query=JR+Highlights"
                label="YouTube: JR Highlights"
                icon={<Youtube className="h-4 w-4" />}
              />
              <SocialLink
                href="https://www.instagram.com/jezeerjrahamed/"
                label="Instagram: @jezeerjrahamed"
                icon={<Instagram className="h-4 w-4" />}
              />
              <SocialLink
                href="https://www.facebook.com/search/top/?q=Iconic%20Academy"
                label="Facebook: Iconic Academy"
                icon={<Facebook className="h-4 w-4" />}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-white">Subjects</h4>
            <ul className="space-y-2.5">
              {SUBJECTS.map((subject) => (
                <li key={subject.id}>
                  <Link
                    href={`/subjects/${subject.id}`}
                    className="group flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-white"
                  >
                    <span>{subject.icon}</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">{subject.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-white">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'AI Tutor', href: '/ai-tutor' },
                { label: 'Past Papers', href: '/past-papers' },
                { label: 'Subjects', href: '/subjects' },
                { label: 'Pricing', href: '/pricing' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="group text-sm text-slate-500 transition-colors hover:text-white">
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-white">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:jezeerahamed254@gmail.com" className="flex items-center gap-2.5 text-sm text-slate-500 transition-colors hover:text-white">
                  <Mail className="h-4 w-4 shrink-0 text-indigo-400" />
                  jezeerahamed254@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+94771041815" className="flex items-center gap-2.5 text-sm text-slate-500 transition-colors hover:text-white">
                  <Phone className="h-4 w-4 shrink-0 text-indigo-400" />
                  +94 7710 41 815
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/94771041815"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-slate-500 transition-colors hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-indigo-400" />
                  WhatsApp: +94 7710 41 815
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <p className="text-xs text-slate-500">Start free today. No credit card required.</p>
              <p className="mt-1 text-xs text-slate-600">Built for Sri Lankan A/L students.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} ICONIC ACADEMY. All rights reserved. Built for Sri Lankan A/L excellence.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((label) => (
              <Link key={label} href="#" className="text-xs text-slate-600 transition-colors hover:text-slate-400">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all duration-200 hover:border-indigo-500/30 hover:bg-indigo-500/20 hover:text-white"
    >
      {icon}
    </a>
  );
}
