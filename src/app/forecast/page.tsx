import { RefreshButton } from "@/components/RefreshButton";
import { ForecastTable } from "@/components/ForecastTable";
import { getForecastData } from "@/lib/forecast";

export const dynamic = 'force-dynamic';

export default async function ForecastPage() {
    const deals = await getForecastData();

    // KPIs
    const totalPotentialRevenue = deals.reduce((sum, deal) => sum + deal.amount, 0);
    const dealCount = deals.length;
    const avgDealSize = dealCount > 0 ? totalPotentialRevenue / dealCount : 0;
    const commercialSurface = deals.reduce((sum, deal) => sum + deal.surface, 0);

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div>
                        <h1>Prévisions</h1>
                        <p className="text-muted">Suivi des affaires en cours</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <RefreshButton />
                    </div>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <div className="text-muted">Dossiers en cours</div>
                    <div className="kpi-value">{dealCount}</div>
                </div>
                <div className="card">
                    <div className="text-muted">Potentiel CA</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-blue)' }}>
                        {totalPotentialRevenue.toLocaleString('fr-FR')} €
                    </div>
                </div>
                <div className="card">
                    <div className="text-muted">Honoraires Moyens</div>
                    <div className="kpi-value">
                        {avgDealSize.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                    </div>
                </div>
                <div className="card">
                    <div className="text-muted">Surface à Traiter</div>
                    <div className="kpi-value">
                        {commercialSurface.toLocaleString()} m²
                    </div>
                </div>
            </div>

            {/* Forecast Table */}
            <div className="card">
                <h2>Liste des Projets</h2>
                <ForecastTable deals={deals} />
            </div>
        </div>
    );
}


