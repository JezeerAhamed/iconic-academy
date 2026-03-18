'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Twitter, Instagram, Youtube, Mail, Phone } from 'lucide-react';
import { SUBJECTS } from '@/lib/constants';

export default function Footer() {
    const pathname = usePathname();

    // Hide marketing footer inside the authenticated app
    if (pathname?.startsWith('/dashboard')) {
        return null;
    }

    return (
        <footer className="border-t border-white/5 bg-[#060a11]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
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
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Sri Lanka&apos;s most advanced A/L learning ecosystem. AI-powered, exam-focused, and built for mastery.
                        </p>
                        <div className="flex items-center gap-3">
                            <SocialLink href="#" icon={<Twitter className="w-4 h-4" />} />
                            <SocialLink href="#" icon={<Instagram className="w-4 h-4" />} />
                            <SocialLink href="#" icon={<Youtube className="w-4 h-4" />} />
                        </div>
                    </div>

                    {/* Subjects */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold text-sm tracking-wide">Subjects</h4>
                        <ul className="space-y-2.5">
                            {SUBJECTS.map((subject) => (
                                <li key={subject.id}>
                                    <Link
                                        href={`/subjects/${subject.id}`}
                                        className="text-slate-500 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                                    >
                                        <span>{subject.icon}</span>
                                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">{subject.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Platform */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold text-sm tracking-wide">Platform</h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'AI Tutor', href: '/ai-tutor' },
                                { label: 'Past Papers', href: '/past-papers' },
                                { label: 'Progress Tracker', href: '/dashboard' },
                                { label: 'Pricing', href: '/pricing' },
                                { label: 'Admin', href: '/admin' },
                            ].map(({ label, href }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="text-slate-500 hover:text-white text-sm transition-colors group"
                                    >
                                        <span className="group-hover:translate-x-0.5 inline-block transition-transform duration-200">{label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold text-sm tracking-wide">Contact</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="mailto:hello@iconicacademy.lk" className="flex items-center gap-2.5 text-slate-500 hover:text-white text-sm transition-colors">
                                    <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                                    hello@iconicacademy.lk
                                </a>
                            </li>
                            <li>
                                <a href="tel:+94761234567" className="flex items-center gap-2.5 text-slate-500 hover:text-white text-sm transition-colors">
                                    <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                                    +94 76 123 4567
                                </a>
                            </li>
                        </ul>

                        <div className="pt-2">
                            <p className="text-xs text-slate-600">Sri Lanka&apos;s #1 A/L Platform</p>
                            <div className="flex items-center gap-1 mt-1">
                                {'★★★★★'.split('').map((star, i) => (
                                    <span key={i} className="text-yellow-400 text-xs">{star}</span>
                                ))}
                                <span className="text-slate-500 text-xs ml-1">5.0 (2,400+ students)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-600 text-xs">
                        © {new Date().getFullYear()} ICONIC ACADEMY. All rights reserved. Built for Sri Lankan A/L Excellence.
                    </p>
                    <div className="flex items-center gap-4">
                        {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((link) => (
                            <Link key={link} href="#" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
                                {link}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-200"
        >
            {icon}
        </a>
    );
}
