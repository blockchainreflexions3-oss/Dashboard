"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname?.startsWith(path)) return true;
        return false;
    };

    const linkStyle = (path: string) => ({
        color: isActive(path) ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: isActive(path) ? 600 : 400,
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        cursor: 'pointer'
    });

    return (
        <nav style={{ borderBottom: '1px solid var(--border-color)', padding: '0.8rem 0', marginBottom: '2rem' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    color: '#FF69B4',
                    letterSpacing: '-0.5px'
                }}>
                    Dashboard CALVIN
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                    <Link href="/" style={linkStyle('/')}>
                        Vue d'ensemble
                    </Link>
                    <Link href="/forecast" style={linkStyle('/forecast')}>
                        Prévisions
                    </Link>
                </div>
            </div>
        </nav>
    );
}
