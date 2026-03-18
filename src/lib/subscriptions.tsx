export const TIER_RANK: Record<string, number> = {
    free: 0,
    basic: 1,
    premium: 2,
    elite: 3
};

export function hasAccess(userTier: string, required: string): boolean {
    const userRank = TIER_RANK[userTier] ?? 0;
    const requiredRank = TIER_RANK[required] ?? 0;
    return userRank >= requiredRank;
}

import React from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UpgradeModal({
    required,
    onClose
}: {
    required: string;
    onClose?: () => void
}) {
    const router = useRouter();

    const handleUpgradeClick = () => {
        router.push('/pricing');
    };

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-t from-[#080c14] via-[#080c14]/80 to-transparent p-4">
            <div
                className="bg-[#0b101a] border border-indigo-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)] relative"
            >
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white"
                    >
                        ✕
                    </button>
                )}
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6 text-indigo-400">
                    <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                    Premium Content
                </h2>
                <p className="text-slate-400 mb-8">
                    This content requires the <span className="text-indigo-400 font-bold capitalize">{required}</span> plan or higher.
                    Unlock full access to the Sri Lankan A/L syllabus, AI features, and step-by-step past paper solutions by upgrading today.
                </p>
                <button
                    onClick={handleUpgradeClick}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-lg hover:from-indigo-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                    View Upgrade Plans
                </button>
            </div>
        </div>
    );
}
