"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { syncFromGoogleSheet } from "@/app/actions/import-csv";

export function RefreshButton() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleRefresh = () => {
        startTransition(async () => {
            await syncFromGoogleSheet();
            router.refresh(); // Refresh Server Components to show new data
        });
    };

    return (
        <button
            onClick={handleRefresh}
            disabled={isPending}
            title="Sychroniser avec Google Sheet"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #333',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: isPending ? '#888' : '#fff',
                cursor: isPending ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.85rem'
            }}
        >
            <RefreshCw
                size={16}
                className={isPending ? "animate-spin" : ""}
                style={isPending ? { animation: 'spin 1s linear infinite' } : {}}
            />
            {isPending ? "Sync..." : "Mettre à jour"}
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </button>
    );
}
