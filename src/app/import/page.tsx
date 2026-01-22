"use client";

import { useState } from "react";
import { syncFromGoogleSheet } from "@/app/actions/import-csv";

export default function ImportPage() {
    const [log, setLog] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSync() {
        setIsLoading(true);
        setLog([]);

        try {
            const result = await syncFromGoogleSheet();
            if (result.success) {
                setLog(prev => [...prev, `✅ Succès: ${result.count} transactions synchronisées.`]);
            } else {
                setLog(prev => [...prev, `❌ Erreur: ${result.error}`]);
            }

            if (result.logs) {
                setLog(prev => [...prev, ...result.logs]);
            }
        } catch (e) {
            setLog(prev => [...prev, "❌ Erreur critique lors de la synchro."]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1>Synchronisation Google Sheets</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>
                Récupère automatiquement les données depuis votre tableau public.
            </p>

            <div style={{ marginBottom: '2rem' }}>
                <a
                    href="https://docs.google.com/spreadsheets/d/1v1CjpxJyKqM1Ac7EF14B0XSwXVB9ti2oRohHRM78sgI/edit"
                    target="_blank"
                    style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}
                >
                    Voir le Google Sheet source ↗
                </a>
            </div>

            <div className="card">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <button
                        onClick={handleSync}
                        disabled={isLoading}
                        style={{
                            backgroundColor: isLoading ? '#333' : 'var(--accent-blue)',
                            color: 'white',
                            padding: '1rem 2rem',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            width: '100%'
                        }}
                    >
                        {isLoading ? 'Synchronisation...' : '🔄 Lancer la Synchronisation'}
                    </button>

                    <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                        Cela remplacera toutes les données actuelles par celles du Sheet.
                    </p>
                </div>
            </div>

            {log.length > 0 && (
                <div className="card" style={{ marginTop: '2rem', backgroundColor: '#1a1a1a' }}>
                    <h3>Journal</h3>
                    <ul style={{ listStyle: 'none', marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {log.map((entry, i) => (
                            <li key={i} style={{
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem',
                                color: entry.startsWith('❌') ? 'var(--accent-red)' : (entry.startsWith('✅') ? 'var(--accent-green)' : 'var(--text-secondary)')
                            }}>
                                {entry}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
