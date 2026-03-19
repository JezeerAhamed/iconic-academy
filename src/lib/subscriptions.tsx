import React from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export function UpgradeModal({
    required,
    onClose
}: {
    required: string;
    onClose?: () => void;
}) {
    const router = useRouter();

    const handleUpgradeClick = () => {
        router.push('/pricing');
    };

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-lg border border-cgray-200 bg-white p-8 text-center shadow-card">
                {onClose ? (
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-cgray-400 transition-colors hover:text-cgray-700"
                    >
                        x
                    </button>
                ) : null}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cblue-25 text-cblue-500">
                    <Lock className="h-8 w-8" />
                </div>
                <h2 className="mb-3 flex items-center justify-center gap-2 text-2xl font-bold text-cgray-900">
                    Premium Content
                </h2>
                <p className="mb-8 text-cgray-600">
                    This content requires the <span className="font-bold capitalize text-cblue-500">{required}</span> plan or higher.
                    Unlock full access to the Sri Lankan A/L syllabus, AI features, and step-by-step past paper solutions by upgrading today.
                </p>
                <button onClick={handleUpgradeClick} className="btn-primary w-full justify-center">
                    View Upgrade Plans
                </button>
            </div>
        </div>
    );
}
