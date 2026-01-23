import type { Metadata } from "next";
import "@/styles/globals.css";
import Image from "next/image";
import { NavBar } from "@/components/NavBar";

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
                <NavBar />
                <main className="container">
                    {children}
                </main>
            </body>
        </html>
    );
}
