export default function Loading() {
    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div>
                        <div style={{ height: '32px', width: '200px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', marginBottom: '8px' }} className="animate-pulse" />
                        <div style={{ height: '20px', width: '300px', backgroundColor: 'var(--bg-card)', borderRadius: '4px' }} className="animate-pulse" />
                    </div>
                    <div style={{ height: '40px', width: '40px', backgroundColor: 'var(--bg-card)', borderRadius: '4px' }} className="animate-pulse" />
                </div>
            </header>

            {/* KPI Cards Skeleton */}
            <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card" style={{ height: '120px' }}>
                        <div style={{ height: '16px', width: '100px', backgroundColor: '#333', borderRadius: '4px', marginBottom: '16px' }} className="animate-pulse" />
                        <div style={{ height: '32px', width: '80px', backgroundColor: '#333', borderRadius: '4px' }} className="animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="card" style={{ minHeight: '400px' }}>
                <div style={{ height: '24px', width: '150px', backgroundColor: '#333', borderRadius: '4px', marginBottom: '24px' }} className="animate-pulse" />
                <div style={{ height: '40px', width: '100%', backgroundColor: '#333', borderRadius: '4px', marginBottom: '16px', opacity: 0.5 }} className="animate-pulse" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ height: '60px', width: '100%', backgroundColor: '#333', borderRadius: '4px', marginBottom: '12px', opacity: 0.3 }} className="animate-pulse" />
                ))}
            </div>

            <style>{`
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
            `}</style>
        </div>
    );
}
