'use client';

import { useState } from 'react';
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid }),
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
        <div className="pb-20 max-w-4xl mx-auto px-4 sm:px-6">
            <div className="mb-10 mt-6">
                <h1 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                    Billing & Subscription
                </h1>
                <p className="text-slate-400">View your current plan and manage your payment methods.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0b101a] border border-white/5 rounded-2xl p-6 sm:p-8"
                    >
                        <div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1 block">Current Plan</span>
                            <div className="flex items-end gap-3 mb-6">
                                <h2 className="text-4xl font-black text-white capitalize">{plan} Plan</h2>
                                {plan !== 'free' && (
                                    <span className="mb-1.5 px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">Active</span>
                                )}
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-white/5 my-6" />

                        <div className="flex flex-col sm:flex-row gap-6 sm:justify-between sm:items-center">
                            <div>
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <CalendarDays className="w-4 h-4" /> Next Billing Cycle
                                </div>
                                <p className="text-white font-medium">
                                    {plan === 'free' ? 'No Upcoming Payments' : 'Manage via Stripe Portal'}
                                </p>
                            </div>

                            {plan !== 'free' ? (
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={loading}
                                    className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Redicrecting...' : 'Manage Subscription'}
                                    <ExternalLink className="w-4 h-4 ml-1" />
                                </button>
                            ) : (
                                <a href="/pricing" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                    Upgrade Plan <ArrowRight className="w-4 h-4 ml-1" />
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
                        className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 h-full"
                    >
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-white font-bold mb-2">Secure Payments</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            All payment processing is securely handled by Stripe. Iconic Academy does not store or process any raw credit card information on our servers.
                        </p>
                        <div className="flex items-center gap-4 text-slate-500">
                            <CreditCard className="w-8 h-8 opacity-50" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
