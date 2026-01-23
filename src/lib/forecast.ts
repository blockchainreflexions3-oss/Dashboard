import { parse } from 'papaparse';

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1v1CjpxJyKqM1Ac7EF14B0XSwXVB9ti2oRohHRM78sgI/export?format=csv&gid=1125949711";

export type ForecastDeal = {
    date: string; // DD/MM/YYYY
    address: string;
    zipCode: string;
    surface: number;
    bailleur: string;
    preneur: string;
    amount: number;
    type: string;
    offres: string;
    demand: string;
};

export async function getForecastData(): Promise<ForecastDeal[]> {
    try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL, { cache: 'no-store' });
        const text = await response.text();

        return new Promise((resolve, reject) => {
            parse(text, {
                header: true,
                skipEmptyLines: true,
                // clean: true, // removed as it caused issues in some versions or configs? kept simple
                complete: (results: any) => {
                    const deals = results.data.map((row: any) => ({
                        date: row['DATE'] || '',
                        address: row['ADRESSE'] || '',
                        zipCode: row['CODE POSTAL'] || '',
                        surface: parseFloat(row['SURFACE (m2)']?.replace(',', '.') || '0'),
                        bailleur: row['BAILLEUR'] || '',
                        preneur: row['PRENEUR'] || '',
                        amount: parseFloat(row['MONTANT']?.replace(/\s/g, '').replace(',', '.') || '0'),
                        type: row['TYPE DE TRANSAC'] || 'AUTRE',
                        offres: row['OFFRES'] || '',
                        demand: row['DEMANDES'] || ''
                    })).filter((d: ForecastDeal) => d.date);
                    resolve(deals);
                },
                error: (error: any) => reject(error)
            });
        });
    } catch (error) {
        console.error("Error fetching forecast:", error);
        return [];
    }
}
