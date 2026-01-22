"use client";

import { useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

const HEADER_COLORS = ['#0070f3']; // Placeholder to remove old COLORS but avoid re-edit conflicts if possible. 
// Actually I should just remove it.
// Wait, I can't just delete it if RevenueChart uses it? RevenueChart doesn't use COLORS. ZonePieChart uses it.
// I will just remove the first declaration.

export function RevenueChart({ data }: { data: any[] }) {
    const [viewMode, setViewMode] = useState<'monthly' | 'cumulative'>('cumulative');

    return (
        <div style={{ width: '100%', height: '340px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-45px', right: 0, zIndex: 10, display: 'flex', gap: '4px', backgroundColor: '#1a1a1a', padding: '2px', borderRadius: '6px', border: '1px solid #333' }}>
                <button
                    onClick={() => setViewMode('monthly')}
                    style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: viewMode === 'monthly' ? '#333' : 'transparent',
                        color: viewMode === 'monthly' ? '#fff' : '#888',
                        transition: 'all 0.2s'
                    }}
                >
                    Mensuel
                </button>
                <button
                    onClick={() => setViewMode('cumulative')}
                    style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: viewMode === 'cumulative' ? '#333' : 'transparent',
                        color: viewMode === 'cumulative' ? '#fff' : '#888',
                        transition: 'all 0.2s'
                    }}
                >
                    Cumulé
                </button>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="month"
                        stroke="#a0a0a0"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        interval={data.length > 15 ? 'preserveStartEnd' : 0}
                    />
                    <YAxis
                        stroke="#a0a0a0"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    {/* Hidden Axis for Volume Bars to scale them independently */}
                    <YAxis yAxisId="volume" hide domain={[0, (dataMax: number) => (dataMax * 3.5)]} />

                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff', fontSize: '0.9rem' }}
                        formatter={(value: number) => `${value.toLocaleString()} €`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />

                    {viewMode === 'monthly' && (
                        <Bar
                            name="CA Réalisé"
                            dataKey="revenue"
                            fill="#8b5cf6"
                            barSize={32}
                            radius={[4, 4, 0, 0]}
                        />
                    )}

                    {viewMode === 'cumulative' && (
                        <>
                            <Bar
                                name="CA Réalisé"
                                dataKey="revenue"
                                yAxisId="volume"
                                fill="#fff"
                                barSize={24}
                                radius={[4, 4, 0, 0]}
                                // Make it resemble volume bars (subtle)
                                fillOpacity={0.5}
                            />
                            <Line
                                name="CA Cumulé"
                                type="monotone"
                                dataKey="cumulative"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ r: 3, fill: '#8b5cf6' }}
                                activeDot={{ r: 6 }}
                            />
                        </>
                    )}

                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

// Modern Palette
const COLORS = [
    '#3b82f6', // Blue 500
    '#8b5cf6', // Violet 500
    '#10b981', // Emerald 500
    '#f59e0b', // Amber 500
    '#ec4899', // Pink 500
    '#06b6d4', // Cyan 500
    '#6366f1'  // Indigo 500
];

import { PieChart as RePieChart } from 'recharts'; // Rename to avoid conflict if I need to use it? No, standard import is fine.

export function ZonePieChart({ data }: { data: any[] }) {
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

    // Calculate total for center text (optional, adds "Pro" feel)
    const total = data.reduce((acc, item) => acc + item.value, 0);

    return (
        <div style={{ height: '340px', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-45px', right: 0, zIndex: 10, display: 'flex', gap: '4px', backgroundColor: '#1a1a1a', padding: '2px', borderRadius: '6px', border: '1px solid #333' }}>
                <button
                    onClick={() => setViewMode('chart')}
                    style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: viewMode === 'chart' ? '#333' : 'transparent',
                        color: viewMode === 'chart' ? '#fff' : '#888',
                        transition: 'all 0.2s'
                    }}
                >
                    Graphique
                </button>
                <button
                    onClick={() => setViewMode('table')}
                    style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: viewMode === 'table' ? '#333' : 'transparent',
                        color: viewMode === 'table' ? '#fff' : '#888',
                        transition: 'all 0.2s'
                    }}
                >
                    Tableau
                </button>
            </div>

            {viewMode === 'chart' ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80} // Thinner ring
                            outerRadius={110}
                            paddingAngle={3}
                            cornerRadius={6} // Rounded edges
                            dataKey="value"
                            stroke="none" // No border
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    style={{ outline: 'none' }} // Remove focus outline
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div style={{ backgroundColor: '#1f1f1f', border: '1px solid #333', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                            <p style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>{d.name}</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#a0a0a0' }}>Transactions :</span>
                                                    <span style={{ color: '#fff', fontWeight: 500 }}>{d.count}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#a0a0a0' }}>CA Total :</span>
                                                    <span style={{ color: '#fff', fontWeight: 500 }}>{d.value.toLocaleString()} €</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            iconSize={10}
                            wrapperStyle={{ fontSize: '0.85rem', color: '#a0a0a0' }}
                        />

                        {/* Center Text (Total) */}
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                            <tspan x="50%" dy="-0.5em" fontSize="24" fill="#fff" fontWeight="bold">
                                {data.length}
                            </tspan>
                            <tspan x="50%" dy="1.5em" fontSize="12" fill="#888">
                                Zones
                            </tspan>
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ height: '100%', overflowY: 'auto', paddingRight: '5px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', color: '#888', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Zone</th>
                                <th style={{ padding: '8px', textAlign: 'right' }}>Nb</th>
                                <th style={{ padding: '8px', textAlign: 'right' }}>CA</th>
                                <th style={{ padding: '8px', textAlign: 'right' }}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.sort((a, b) => b.value - a.value).map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></span>
                                        {item.name}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: '#fff' }}>
                                        {item.count}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                                        {item.value.toLocaleString()} €
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: '#888' }}>
                                        {((item.value / total) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
