"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortField = 'date' | 'property' | 'type' | 'surface' | 'fee';
type SortOrder = 'asc' | 'desc';

export function TransactionsTable({ deals }: { deals: any[] }) {
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc'); // Default to desc for new field usually good (highest fee, latest date)
        }
    };

    const sortedDeals = [...deals].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Parser pour date si nécessaire, mais format string "JJ/MM/AAAA" mal trié string.
        // L'objet deal passé a string date. Il faudrait idéalement passer raw date ou parser.
        // Hack: on va supposer que 'date' est string mais on va essayer de parser.
        if (sortField === 'date') {
            // "15/03/2024" -> parse
            const partsA = valA.split('/');
            const partsB = valB.split('/');
            // YYYYMMDD string compare
            valA = partsA.length === 3 ? `${partsA[2]}${partsA[1]}${partsA[0]}` : valA;
            valB = partsB.length === 3 ? `${partsB[2]}${partsB[1]}${partsB[0]}` : valB;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown size={14} color="#555" style={{ marginLeft: '4px' }} />;
        return sortOrder === 'asc'
            ? <ArrowUp size={14} color="#fff" style={{ marginLeft: '4px' }} />
            : <ArrowDown size={14} color="#fff" style={{ marginLeft: '4px' }} />;
    };

    const thStyle = {
        padding: '0.75rem 0.5rem',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        userSelect: 'none' as const,
        textAlign: 'center' as const
    };

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={thStyle} onClick={() => handleSort('date')}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Date <SortIcon field="date" /></div>
                    </th>
                    <th style={thStyle} onClick={() => handleSort('property')}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Biens <SortIcon field="property" /></div>
                    </th>
                    <th style={thStyle} onClick={() => handleSort('type')}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Type <SortIcon field="type" /></div>
                    </th>
                    <th style={thStyle} onClick={() => handleSort('surface')}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Surface <SortIcon field="surface" /></div>
                    </th>
                    <th style={thStyle} onClick={() => handleSort('fee')}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Honoraires <SortIcon field="fee" /></div>
                    </th>
                </tr>
            </thead>
            <tbody>
                {sortedDeals.map((deal: any) => (
                    <tr key={deal.id} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>{deal.date}</td>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>{deal.property}</td>
                        <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                            <span style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                backgroundColor: deal.type === 'VENTE' ? 'rgba(16, 185, 129, 0.2)' : (deal.type === 'AUTRE' ? 'rgba(156, 163, 175, 0.2)' : 'rgba(0, 112, 243, 0.2)'),
                                color: deal.type === 'VENTE' ? '#10b981' : (deal.type === 'AUTRE' ? '#9ca3af' : '#0070f3')
                            }}>
                                {deal.type}
                            </span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>{deal.surface} m²</td>
                        <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>{deal.fee.toLocaleString('fr-FR')} €</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
