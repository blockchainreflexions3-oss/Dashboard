import type { Metadata } from "next";
import "@/styles/globals.css";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Lyon Offices Dashboard",
    description: "Pilotage performance broker immobilier",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body>
                <nav style={{ borderBottom: '1px solid var(--border-color)', padding: '0.8rem 0', marginBottom: '2rem' }}>
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            width: '180px',
                            height: '60px'
                        }}>
                            <Image src="/logo-prova.png" alt="Lyon Offices Data" width={180} height={60} style={{ objectFit: 'cover' }} priority />
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                            <a href="/" style={{ color: 'var(--text-primary)' }}>Vue d'ensemble</a>
                            <a href="/forecast" style={{ color: 'var(--text-secondary)' }}>Prévisions</a>
                        </div>
                    </div>
                </nav>
                <main className="container">
                    {children}
                </main>
            </body>
        </html>
    );
}
