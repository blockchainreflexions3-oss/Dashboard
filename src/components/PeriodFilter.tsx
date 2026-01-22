"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronDown, Check } from "lucide-react";

export function PeriodFilter({ current }: { current: string }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filters = [
        { label: 'Tout l\'historique', value: 'all' },
        { label: 'Année 2026', value: '2026' },
        { label: 'Année 2025', value: '2025' },
        { label: 'Année 2024', value: '2024' },
        { label: '3 derniers mois', value: '3m' },
        { label: '6 derniers mois', value: '6m' },
    ];

    const activeLabel = filters.find(f => f.value === current)?.label || 'Tout l\'historique';

    // Handle click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        router.push(`/?period=${value}`);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', zIndex: 50 }}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: isOpen ? '#333' : '#1e1e1e', // Active state lighter
                    color: '#fff',
                    border: '1px solid #333',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    minWidth: '200px',
                    justifyContent: 'space-between'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#555'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#333'}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} color="#a0a0a0" />
                    <span>{activeLabel}</span>
                </div>
                <ChevronDown size={16} color="#666" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    minWidth: '220px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
                    animation: 'fadeIn 0.15s ease-out'
                }}>
                    {filters.map((f) => {
                        const isActive = current === f.value;
                        return (
                            <div
                                key={f.value}
                                onClick={() => handleSelect(f.value)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.6rem 0.8rem',
                                    fontSize: '0.9rem',
                                    color: isActive ? '#fff' : '#a0a0a0',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    backgroundColor: isActive ? 'rgba(0, 112, 243, 0.1)' : 'transparent',
                                    transition: 'background 0.15s'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = '#2a2a2a';
                                        e.currentTarget.style.color = '#fff';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#a0a0a0';
                                    }
                                }}
                            >
                                <span>{f.label}</span>
                                {isActive && <Check size={14} color="#0070f3" />}
                            </div>
                        );
                    })}
                </div>
            )}

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
