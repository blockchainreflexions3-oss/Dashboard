import { RevenueChart, ZonePieChart } from "@/components/OverviewCharts";
import { PrismaClient } from "@prisma/client";
import Link from "next/link"; // For simple navigation as filter
import Image from "next/image";

const prisma = new PrismaClient();

// Client Component moved to external file to allow interactivity
import { PeriodFilter } from "@/components/PeriodFilter";
import { TransactionsTable } from "@/components/TransactionsTable";
import { RefreshButton } from "@/components/RefreshButton";
import { ForecastToggle } from "@/components/ForecastToggle";
import { getForecastData } from "@/lib/forecast";

async function getDashboardData(period: string, includeForecast: boolean) {
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

    let mergedDeals = deals.map(d => ({
        id: d.id.toString(),
        date: d.signatureDate,
        amount: d.agencyFee,
        surface: d.surfaceM2,
        type: d.type,
        address: `${d.property.addressFull}, ${d.property.zipCode} ${d.property.city}`,
        zone: d.property.zone || "AUTRE",
        isForecast: false
    }));

    if (includeForecast) {
        const forecastDeals = await getForecastData();
        const mappedForecast = forecastDeals.map((d, idx) => {
            // Parse date DD/MM/YYYY
            const parts = d.date.split('/');
            const dateObj = parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : new Date(); // Default safely

            // Zone Logic from Zip (Matches import-csv.ts)
            const zip = d.zipCode ? d.zipCode.toString().replace(/\s/g, '') : "";
            let zone = "AUTRE";

            // Lyon Districts
            if (zip.startsWith("6900")) {
                const arr = zip.slice(4);
                zone = `LYON_${arr}`;
            } else {
                // Est Lyonnais
                const estCodes = [
                    "69100", "69200", "69120", "69800", "69500",
                    "69740", "69190", "69960", "69680", "69330",
                    "69150", "69780"
                ];
                // Ouest Lyonnais
                const ouestCodes = [
                    "69230", "69390", "69530", "69540", "69630",
                    "69110", "69600", "69340", "69160", "69440"
                ];

                if (estCodes.includes(zip)) zone = "EST_LYONNAIS";
                else if (ouestCodes.includes(zip)) zone = "OUEST_LYONNAIS";
                else zone = "AUTRE";
            }

            // Filter by period if necessary
            // Note: dateFilter logic above is Prisma specific. We need applied logic here.
            // Simplified: if 'all', include all. If year, match year.
            let include = true;
            if (period === '2024') include = dateObj.getFullYear() === 2024;
            else if (period === '2025') include = dateObj.getFullYear() === 2025;
            else if (period === '2026') include = dateObj.getFullYear() === 2026;

            if (!include) return null;

            return {
                id: `forecast-${idx}`,
                date: dateObj,
                amount: d.amount,
                surface: d.surface,
                type: d.type, // VENTE / LOCATION
                address: `${d.address}, ${d.zipCode}`,
                zone: zone,
                isForecast: true
            };
        }).filter(d => d !== null) as any[]; // TS Clean

        mergedDeals = [...mergedDeals, ...mappedForecast];
        // Re-sort
        mergedDeals.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    const totalRevenue = mergedDeals.reduce((acc, d) => acc + d.amount, 0);
    const totalSurface = mergedDeals.reduce((acc, d) => acc + d.surface, 0);

    // Filter "Vraies" Signatures (Location/Vente) - Excludes Avis de valeur, Travaux, etc.
    const signatures = mergedDeals.filter(d => d.type === 'LOCATION' || d.type === 'VENTE');
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
            // Base logic on original deals for 'all' range usually, but here we can stick to defaults
            // or calculate from merged
            const dates = mergedDeals.map(d => d.date.getTime());
            if (dates.length > 0) {
                startDate = new Date(Math.min(...dates));
                endDate = new Date(Math.max(...dates));
                startDate.setDate(1);
            } else {
                const y = new Date().getFullYear();
                startDate = new Date(`${y}-01-01`);
                endDate = new Date(`${y}-12-31`);
            }
        } else {
            // Default to current year if empty
            const y = new Date().getFullYear();
            startDate = new Date(`${y}-01-01`);
            endDate = new Date(`${y}-12-31`);
        }
    }

    // Helper to generate all months between dates
    const allMonths: { month: string; sortDate: Date; revenue: number; forecastRevenue: number }[] = [];
    const iterator = new Date(startDate);
    iterator.setDate(1); // Force start of month

    // Safety for infinite loop if dates are invalid
    if (isNaN(iterator.getTime())) iterator.setTime(Date.now());
    if (isNaN(endDate.getTime())) endDate.setTime(Date.now());

    while (iterator <= endDate || iterator.getMonth() === endDate.getMonth() && iterator.getFullYear() === endDate.getFullYear()) {
        const key = iterator.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
        // Check if we already added this key (handle edge case of tight loops)
        if (!allMonths.find(m => m.month === key)) {
            allMonths.push({
                month: key,
                sortDate: new Date(iterator),
                revenue: 0,
                forecastRevenue: 0
            });
        }
        iterator.setMonth(iterator.getMonth() + 1);
        if (allMonths.length > 60) break; // Hard limit to prevent crash
    }

    // Fill with actual data
    mergedDeals.forEach(d => {
        const date = new Date(d.date);
        const key = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
        const monthItem = allMonths.find(m => m.month === key);
        if (monthItem) {
            monthItem.revenue += d.amount;
            if (d.isForecast) {
                monthItem.forecastRevenue += d.amount; // Track separately if we want valid stack? 
                // Actually RevenueChart expects just 'revenue' usually or maybe we change it.
                // For now, revenue holds BOTH.
            }
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
    mergedDeals.forEach(d => {
        const z = d.zone;
        const current = zoneMap.get(z) || { revenue: 0, count: 0 };
        // Count only strict transactions (Vente/Location), but sum all revenue
        const isTransaction = d.type === 'LOCATION' || d.type === 'VENTE';
        zoneMap.set(z, {
            revenue: current.revenue + d.amount,
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

export default async function Home({ searchParams }: { searchParams: { period?: string, includeForecast?: string } }) {
    const period = searchParams?.period || 'all';
    const includeForecast = searchParams?.includeForecast === 'true';
    const data = await getDashboardData(period, includeForecast);

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div>
                        <h1>Vue d’ensemble</h1>
                        <p className="text-muted">Performances globales</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <ForecastToggle />
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
