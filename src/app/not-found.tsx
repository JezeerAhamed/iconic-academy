import Link from 'next/link';
import { Home, LayoutDashboard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#080c14] px-4">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b101a] p-10 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 shadow-lg">
          <Zap className="h-8 w-8 text-white" strokeWidth={2.5} />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">ICONIC ACADEMY</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">Page not found</h1>
        <p className="mt-4 text-slate-400">
          The page you were looking for does not exist, may have moved, or may need a different link.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/">
            <Button className="w-full bg-white text-black hover:bg-slate-100 sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 sm:w-auto">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
