import React from 'react';
import { ProgressStatus } from '@/lib/types';
import { getMasteryColor, getMasteryLabel } from '@/lib/utils/mastery';

interface MasteryBadgeProps {
    status?: ProgressStatus;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export function MasteryBadge({ status = 'not_started', size = 'md', showLabel = false }: MasteryBadgeProps) {
    const colorClass = getMasteryColor(status);
    const label = getMasteryLabel(status);

    const sizeMap = {
        sm: 16,
        md: 20,
        lg: 24,
    };

    const s = sizeMap[size];

    // Render the appropriate SVG based on status
    const renderIcon = () => {
        switch (status) {
            case 'mastered':
                // Full circle
                return (
                    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass}>
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                );
            case 'proficient':
                // Half filled circle
                return (
                    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a10 10 0 0 1 0 20Z" fill="currentColor" />
                    </svg>
                );
            case 'practicing':
                // Quarter filled circle
                return (
                    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a10 10 0 0 1 10 10h-10Z" fill="currentColor" />
                    </svg>
                );
            case 'not_started':
            default:
                // Empty circle
                return (
                    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorClass}>
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                );
        }
    };

    if (!showLabel) {
        return renderIcon();
    }

    return (
        <div className="flex items-center gap-2">
            {renderIcon()}
            <span className={`text-sm font-medium ${colorClass}`}>{label}</span>
        </div>
    );
}
