'use client';

import { useEffect, useMemo, useState } from 'react';
import { CONTACT } from '@/lib/contact';
import { cn } from '@/lib/utils';
const DEFAULT_MESSAGE = "Hi, I'd like to know more about Iconic Academy";

function isMobileViewport() {
  if (typeof window === 'undefined') {
    return false;
  }

  const touchDevice = /Android|iPhone|iPad|iPod|Windows Phone|webOS/i.test(window.navigator.userAgent);
  return touchDevice || window.matchMedia('(max-width: 767px)').matches;
}

interface WhatsAppFloatingButtonProps {
  message?: string;
  className?: string;
}

export default function WhatsAppFloatingButton({
  message = DEFAULT_MESSAGE,
  className,
}: WhatsAppFloatingButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobileViewport());

    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = () => setMobile(isMobileViewport());
    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('resize', handleChange);

    return () => {
      window.clearTimeout(timer);
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', handleChange);
    };
  }, []);

  const href = useMemo(() => {
    const encodedMessage = encodeURIComponent(message);

    if (mobile) {
      return `${CONTACT.whatsappUrl}?text=${encodedMessage}`;
    }

    return `https://web.whatsapp.com/send?phone=${CONTACT.whatsapp.replace(/[^\d]/g, '')}&text=${encodedMessage}`;
  }, [message, mobile]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={cn(
        'fixed bottom-6 right-4 z-[95] flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover hover:no-underline',
        'dark:bg-[#1fa855] dark:text-white md:bottom-8 md:right-8',
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        className
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.51 2 2.02 6.49 2.02 12.02c0 1.77.46 3.49 1.34 5l-1.4 5.1 5.23-1.37a10 10 0 0 0 4.85 1.24h.01c5.52 0 10.01-4.49 10.01-10.02A10 10 0 0 0 12.04 2Zm0 18.31h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.1.81.83-3.02-.2-.31a8.3 8.3 0 1 1 7 3.86Zm4.55-6.2c-.25-.13-1.48-.73-1.71-.81-.23-.08-.39-.13-.56.12-.17.25-.64.81-.78.98-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.25-.74-.66-1.24-1.48-1.38-1.73-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.43 1.02 2.6.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.52.6.19 1.14.16 1.57.1.48-.07 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29Z" />
        </svg>
      </span>
      <span className="hidden sm:inline">Chat on WhatsApp</span>
      <span className="sm:hidden">WhatsApp</span>
    </a>
  );
}
