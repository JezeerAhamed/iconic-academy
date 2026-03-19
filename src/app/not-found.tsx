import Link from 'next/link';
import { Home, LayoutDashboard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-cgray-50 px-4">
      <div className="c-card w-full max-w-xl p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-cblue-25">
          <Zap className="h-8 w-8 text-cblue-500" strokeWidth={2.5} />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cblue-500">ICONIC ACADEMY</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-cgray-900">Page not found</h1>
        <p className="mt-4 text-cgray-600">
          The page you were looking for does not exist, may have moved, or may need a different link.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/">
            <Button className="btn-primary w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="btn-secondary w-full sm:w-auto">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
