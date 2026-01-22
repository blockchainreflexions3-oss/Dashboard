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
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            color: '#FF69B4', // HotPink or use a softer pink like #ffb7c5 depending on preference. Using a nice vibrant pink.
                            letterSpacing: '-0.5px'
                        }}>
                            Dashboard CALVIN
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
