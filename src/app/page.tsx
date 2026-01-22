import { RevenueChart, ZonePieChart } from "@/components/OverviewCharts";
import { PrismaClient } from "@prisma/client";
import Link from "next/link"; // For simple navigation as filter
import Image from "next/image";

const prisma = new PrismaClient();

// Client Component moved to external file to allow interactivity
import { PeriodFilter } from "@/components/PeriodFilter";
import { TransactionsTable } from "@/components/TransactionsTable";
import { RefreshButton } from "@/components/RefreshButton";

async function getDashboardData(period: string) {
    // Define Date Filter
    let dateFilter: any = {};
    const now = new Date();

    if (period === '2024') {
        dateFilter = {
            gte: new Date('2024-01-01'),
            lt: new Date('2025-01-01')
        };
    } else if (period === '2025') {
        dateFilter = {
            gte: new Date('2025-01-01'),
            lt: new Date('2026-01-01')
        };
    } else if (period === '2026') {
        dateFilter = {
            gte: new Date('2026-01-01'),
            lt: new Date('2027-01-01')
        };
    } else if (period === '3m') {
        const d = new Date();
        d.setMonth(d.getMonth() - 3);
        dateFilter = { gte: d };
    } else if (period === '6m') {
        const d = new Date();
        d.setMonth(d.getMonth() - 6);
        dateFilter = { gte: d };
    }

    const deals = await prisma.deal.findMany({
        where: {
            signatureDate: dateFilter
        },
        include: { property: true },
        orderBy: { signatureDate: 'desc' }
    });

    const totalRevenue = deals.reduce((acc: number, d: any) => acc + d.agencyFee, 0);
    const totalSurface = deals.reduce((acc: number, d: any) => acc + d.surfaceM2, 0);

    // Filter "Vraies" Signatures (Location/Vente) - Excludes Avis de valeur, Travaux, etc.
    const signatures = deals.filter((d: any) => d.type === 'LOCATION' || d.type === 'VENTE');
    const totalSignatures = signatures.length;

    // Avg Fee based on User Logic: Total Revenue / Total Signatures
    // (Considère que les avis de valeur font partie du panier moyen des signatures)
    const avgFee = totalSignatures > 0 ? totalRevenue / totalSignatures : 0;

    // Process Revenue History (Group by Month)
    // Use JS Map for easy aggregation: "YYYY-MM" -> value
    const historyMap = new Map<string, number>();
    deals.forEach((d: any) => {
        const date = new Date(d.signatureDate);
        // Format Month short: "Jan 24", "Feb 24"... to distinguish years if mixed
        const key = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
        historyMap.set(key, (historyMap.get(key) || 0) + d.agencyFee);
    });

    // Create robust keys order. 
    // Naive loop through actual data keys to respect sparse data or multi-year
    const revenueHistory = Array.from(historyMap.entries()).map(([month, revenue]) => ({
        month,
        revenue
    })).reverse(); // Map iterates insertion order? No reliable.
    // Better: Sort by date.
    // Re-do history map with sortable keys
    const historyList = deals.reduce((acc: any[], d: any) => {
        const date = new Date(d.signatureDate);
        const key = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
        const exist = acc.find(item => item.month === key);
        if (exist) {
            exist.revenue += d.agencyFee;
        } else {
            acc.push({ month: key, revenue: d.agencyFee, sortDate: date });
        }
        return acc;
    }, []);
    // Sort ascending for chart
    historyList.sort((a: any, b: any) => a.sortDate.getTime() - b.sortDate.getTime());

    // Calculate Cumulative
    let runningTotal = 0;
    const historyWithCumul = historyList.map((h: any) => {
        runningTotal += h.revenue;
        return { ...h, cumulative: runningTotal };
    });

    // Process Zone Distribution (Revenue)
    const zoneMap = new Map<string, number>();
    deals.forEach((d: any) => {
        const z = d.property.zone || "AUTRE";
        zoneMap.set(z, (zoneMap.get(z) || 0) + d.agencyFee);
    });

    const zoneDistribution = Array.from(zoneMap.entries()).map(([name, value]) => ({
        name: name.replace('LYON_', 'Lyon ').replace('_', ' '),
        value
    }));

    // Format All Deals
    const recentDeals = deals.map((d: any) => ({
        id: d.id,
        property: `${d.property.addressFull}, ${d.property.zipCode} ${d.property.city}`,
        type: d.type,
        surface: d.surfaceM2,
        date: new Date(d.signatureDate).toLocaleDateString("fr-FR"),
        fee: d.agencyFee
    }));

    return {
        kpis: {
            totalSignatures,
            totalRevenue,
            avgFee,
            totalSurface
        },
        revenueHistory: historyWithCumul,
        zoneDistribution,
        recentDeals
    };
}

export default async function Home({ searchParams }: { searchParams: { period?: string } }) {
    const period = searchParams?.period || 'all';
    const data = await getDashboardData(period);

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div>
                        <h1>Vue d’ensemble</h1>
                        <p className="text-muted">Performances globales</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <RefreshButton />
                        <PeriodFilter current={period} />
                    </div>
                </div>
            </header>


            {/* KPI Cards Row */}
            <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <div className="text-muted">Total Signatures</div>
                    <div className="kpi-value">{data.kpis.totalSignatures}</div>
                </div>
                <div className="card">
                    <div className="text-muted">Chiffre d'affaires</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-green)' }}>
                        {data.kpis.totalRevenue.toLocaleString('fr-FR')} €
                    </div>
                </div>
                <div className="card">
                    <div className="text-muted">Honoraires Moyens</div>
                    <div className="kpi-value">
                        {(data.kpis.avgFee || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                    </div>
                </div>
                <div className="card">
                    <div className="text-muted">Surface Commercialisée</div>
                    <div className="kpi-value">
                        {data.kpis.totalSurface.toLocaleString()} m²
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <h2>Évolution du CA</h2>
                    <RevenueChart data={data.revenueHistory} />
                </div>
                <div className="card">
                    <h2>Répartition Géographique</h2>
                    <ZonePieChart data={data.zoneDistribution} />
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="card">
                <h2>Toutes les Signatures</h2>
                <TransactionsTable deals={data.recentDeals} />
            </div>
        </div>
    );
}
