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

    // Generate complete timeline based on period
    let startDate: Date;
    let endDate: Date;

    if (period === '2024') {
        startDate = new Date('2024-01-01');
        endDate = new Date('2024-12-31');
    } else if (period === '2025') {
        startDate = new Date('2025-01-01');
        endDate = new Date('2025-12-31');
    } else if (period === '2026') {
        startDate = new Date('2026-01-01');
        endDate = new Date('2026-12-31');
    } else if (period === '3m') {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 2); // Current + prev 2
        startDate.setDate(1);
        endDate = new Date();
    } else if (period === '6m') {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 5);
        startDate.setDate(1);
        endDate = new Date();
    } else {
        // 'all' case: find min and max from deals or default to current year
        if (deals.length > 0) {
            const dates = deals.map((d: any) => new Date(d.signatureDate).getTime());
            startDate = new Date(Math.min(...dates));
            endDate = new Date(Math.max(...dates));
            // Snap to start of month
            startDate.setDate(1);
        } else {
            // Default to current year if empty
            const y = new Date().getFullYear();
            startDate = new Date(`${y}-01-01`);
            endDate = new Date(`${y}-12-31`);
        }
    }

    // Helper to generate all months between dates
    const allMonths: { month: string; sortDate: Date; revenue: number }[] = [];
    const iterator = new Date(startDate);
    iterator.setDate(1); // Force start of month

    while (iterator <= endDate || iterator.getMonth() === endDate.getMonth() && iterator.getFullYear() === endDate.getFullYear()) {
        const key = iterator.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
        // Check if we already added this key (handle edge case of tight loops)
        if (!allMonths.find(m => m.month === key)) {
            allMonths.push({
                month: key,
                sortDate: new Date(iterator),
                revenue: 0
            });
        }
        iterator.setMonth(iterator.getMonth() + 1);
    }

    // Fill with actual data
    deals.forEach((d: any) => {
        const date = new Date(d.signatureDate);
        const key = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
        const monthItem = allMonths.find(m => m.month === key);
        if (monthItem) {
            monthItem.revenue += d.agencyFee;
        }
    });

    const historyList = allMonths; // Already sorted by creation

    // Calculate Cumulative
    let runningTotal = 0;
    const historyWithCumul = historyList.map((h: any) => {
        runningTotal += h.revenue;
        return { ...h, cumulative: runningTotal };
    });

    // Process Zone Distribution (Revenue & Count)
    const zoneMap = new Map<string, { revenue: number, count: number }>();
    deals.forEach((d: any) => {
        const z = d.property.zone || "AUTRE";
        const current = zoneMap.get(z) || { revenue: 0, count: 0 };
        // Count only strict transactions (Vente/Location), but sum all revenue
        const isTransaction = d.type === 'LOCATION' || d.type === 'VENTE';
        zoneMap.set(z, {
            revenue: current.revenue + d.agencyFee,
            count: current.count + (isTransaction ? 1 : 0)
        });
    });

    const zoneDistribution = Array.from(zoneMap.entries()).map(([name, data]) => ({
        name: name.replace('LYON_', 'Lyon ').replace('_', ' '),
        value: data.revenue,
        count: data.count
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
