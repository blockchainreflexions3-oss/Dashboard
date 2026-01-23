"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrendingUp } from "lucide-react";

export function ForecastToggle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const isChecked = searchParams.get('includeForecast') === 'true';

    const handleToggle = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (isChecked) {
            params.delete('includeForecast');
        } else {
            params.set('includeForecast', 'true');
        }

        startTransition(() => {
            router.replace(`/?${params.toString()}`);
            router.refresh();
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                border: isChecked ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                backgroundColor: isChecked ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                color: isChecked ? 'var(--accent-purple)' : 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: isPending ? 0.7 : 1
            }}
        >
            <TrendingUp size={16} />
            Avec prévisions
            {isChecked && (
                <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-purple)',
                    marginLeft: '4px',
                    boxShadow: '0 0 8px var(--accent-purple)'
                }} />
            )}
        </button>
    );
}
