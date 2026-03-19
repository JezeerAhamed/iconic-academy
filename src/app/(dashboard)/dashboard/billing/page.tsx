'use client';

import { useState } from 'react';
import { getSecureJsonHeaders } from '@/lib/client-security';
import { useAuth } from '@/lib/contexts/AuthContext';
import { motion } from 'framer-motion';
import { CreditCard, CalendarDays, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';

export default function BillingPortal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const plan = (user as any)?.plan || 'free';

  const handleManageSubscription = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: getSecureJsonHeaders(),
        body: JSON.stringify({ userId: user.uid }),
        credentials: 'same-origin',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Could not load billing portal. Are you on a paid plan?');
      }
    } catch (error) {
      console.error(error);
      alert('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-coursera space-y-6 px-6 pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-cgray-900">Billing & Subscription</h1>
        <p className="text-cgray-600">View your current plan and manage your payment methods.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="c-card p-6 sm:p-8">
            <div>
              <span className="mb-1 block text-sm font-semibold uppercase tracking-wider text-cblue-500">Current Plan</span>
              <div className="mb-6 flex items-end gap-3">
                <h2 className="text-4xl font-bold capitalize text-cgray-900">{plan} Plan</h2>
                {plan !== 'free' ? <span className="c-badge-green normal-case tracking-normal">Active</span> : null}
              </div>
            </div>

            <div className="my-6 h-px w-full bg-cgray-200" />

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2 text-cgray-500">
                  <CalendarDays className="h-4 w-4" /> Next Billing Cycle
                </div>
                <p className="font-semibold text-cgray-900">
                  {plan === 'free' ? 'No Upcoming Payments' : 'Manage via Stripe Portal'}
                </p>
              </div>

              {plan !== 'free' ? (
                <button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Redirecting...' : 'Manage Subscription'}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <a href="/pricing" className="btn-primary">
                  Upgrade Plan <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              )}
            </div>
          </motion.div>
        </div>

        <div className="md:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="c-card h-full p-6"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cblue-50 text-cblue-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-cgray-900">Secure Payments</h3>
            <p className="mb-6 text-sm leading-relaxed text-cgray-600">
              All payment processing is securely handled by Stripe. Iconic Academy does not store or
              process any raw credit card information on our servers.
            </p>
            <div className="flex items-center gap-4 text-cgray-400">
              <CreditCard className="h-8 w-8" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
