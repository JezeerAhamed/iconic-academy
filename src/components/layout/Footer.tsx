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
    <footer className="bg-cgray-900 text-white border-t border-cgray-800">
      <div className="c-wrap py-10">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-3 mb-4 hover:no-underline">
            <div className="relative h-12 w-[148px] overflow-hidden rounded border border-cgray-800 bg-white">
              <Image
                src="/logo.jpg"
                alt="Iconic Academy"
                fill
                sizes="148px"
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-xl font-bold text-white">ICONIC ACADEMY</p>
              <p className="text-sm text-cgray-400 mt-1">Sri Lanka&apos;s A/L learning platform</p>
            </div>
          </Link>

          <p className="max-w-2xl text-sm leading-relaxed text-cgray-400">
            Sri Lanka&apos;s A/L learning platform with AI tutoring, past papers, and structured science subject coverage.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Subjects</h4>
            <div className="flex flex-col gap-2">
              {SUBJECTS.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/subjects/${subject.id}`}
                  className="text-sm text-cgray-400 hover:text-white transition-colors font-normal hover:no-underline flex items-center gap-2"
                >
                  <span>{subject.icon}</span>
                  <span>{subject.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Platform</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: 'AI Tutor', href: '/ai-tutor' },
                { label: 'Past Papers', href: '/past-papers' },
                { label: 'Subjects', href: '/subjects' },
                { label: 'Pricing', href: '/pricing' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-cgray-400 hover:text-white transition-colors font-normal hover:no-underline"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Contact</h4>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:jezeerahamed254@gmail.com"
                className="text-sm text-cgray-400 hover:text-white transition-colors font-normal hover:no-underline flex items-center gap-2"
              >
                <Mail className="h-4 w-4 shrink-0 text-cgray-500" />
                <span>jezeerahamed254@gmail.com</span>
              </a>
              <a
                href="tel:+94771041815"
                className="text-sm text-cgray-400 hover:text-white transition-colors font-normal hover:no-underline flex items-center gap-2"
              >
                <Phone className="h-4 w-4 shrink-0 text-cgray-500" />
                <span>+94 7710 41 815</span>
              </a>
              <a
                href="https://wa.me/94771041815"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cgray-400 hover:text-white transition-colors font-normal hover:no-underline flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-cgray-500" />
                <span>WhatsApp: +94 7710 41 815</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Follow</h4>
            <div className="flex flex-col gap-2">
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

            <div className="mt-4">
              <p className="text-sm text-cgray-400">Start free today. No credit card required.</p>
              <p className="text-sm text-cgray-500 mt-1">Built for Sri Lankan A/L students.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-cgray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cgray-500">
            (c) {new Date().getFullYear()} ICONIC ACADEMY. All rights reserved. Built for Sri Lankan A/L excellence.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((label) => (
              <Link
                key={label}
                href="#"
                className="text-xs text-cgray-500 hover:text-cgray-300 transition-colors hover:no-underline"
              >
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
      className="text-sm text-cgray-400 hover:text-white transition-colors font-normal hover:no-underline flex items-center gap-2"
    >
      <span className="text-cgray-500">{icon}</span>
      <span>{label}</span>
    </a>
  );
}
