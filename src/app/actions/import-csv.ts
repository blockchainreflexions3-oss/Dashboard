"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SHEET_ID = "1v1CjpxJyKqM1Ac7EF14B0XSwXVB9ti2oRohHRM78sgI";
const GIDS = [
    "0",          // 2024 (Default usually 0, or implied if omitted)
    "1727412465", // 2025
    "1700662717"  // 2026
];

function parseFrenchNumber(str: string): number {
    if (!str) return 0;
    // Remove non-breaking spaces and normal spaces, replace comma with dot
    // "2 412€" -> "2412" or "2 412" -> "2412"
    const cleanStr = str.replace(/[€\s\u00A0]/g, '').replace(',', '.');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : num;
}

function parseDate(str: string): Date {
    if (!str) return new Date();
    const parts = str.split('/');
    if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return new Date();
}

function deduceCity(zip: string): string {
    if (!zip) return "";
    const cleanZip = zip.replace(/\s/g, '');

    if (cleanZip.startsWith("6900")) {
        const arr = cleanZip.slice(4);
        return `Lyon ${arr}${arr === '1' ? 'er' : 'ème'}`;
    }

    switch (cleanZip) {
        case "69100": return "Villeurbanne";
        case "69800": return "Saint-Priest";
        case "69740": return "Genas";
        case "69680": return "Chassieu";
        case "69960": return "Corbas";
        case "69200": return "Vénissieux";
        case "69500": return "Bron";
        case "69300": return "Caluire-et-Cuire";
        case "69410": return "Champagne-au-Mont-d'Or";
        case "69130": return "Écully";
        case "69570": return "Dardilly";
        case "69760": return "Limonest";
        case "69370": return "Saint-Didier-au-Mont-d'Or";
        case "69160": return "Tassin-la-Demi-Lune";
        case "69600": return "Oullins";
        case "69380": return "Lissieu";
        case "69270": return "Fontaines-sur-Saône";
        default: return "";
    }
}

function deduceZone(zip: string): string {
    if (!zip) return "AUTRE";
    const cleanZip = zip.replace(/\s/g, '');

    if (cleanZip.startsWith("6900")) {
        const arr = cleanZip.slice(4);
        return `LYON_${arr}`;
    }
    // Liste définie comme "Est" dans le besoin métier ou approximatif
    const estCodes = ["69100", "69800", "69740", "69680", "69960"];
    if (estCodes.includes(cleanZip)) return "EST_LYONNAIS";

    // Quick default for others
    return "OUEST_LYONNAIS";
}

export async function syncFromGoogleSheet() {
    try {
        // 1. Wipe DB to reload fresh
        await prisma.deal.deleteMany({});
        await prisma.property.deleteMany({});

        let totalCount = 0;
        const logs: string[] = [];

        // 2. Loop over GIDs
        for (const gid of GIDS) {
            const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
            const response = await fetch(url, { cache: 'no-store' });

            if (!response.ok) {
                logs.push(`⚠️ Impossible de lire l'onglet (GID: ${gid}) - ${response.statusText}`);
                continue;
            }

            const text = await response.text();
            const lines = text.split(/\r?\n/);
            const headerLine = lines[0];
            const dataLines = lines.slice(1);

            // Dynamic Column Mapping
            const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
            const getIndex = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

            const idxDate = getIndex(['date', 'signature']);
            const idxAddress = getIndex(['adresse', 'bien', 'localisation']);
            const idxZip = getIndex(['code postal', 'cp', 'zip']);
            const idxSurface = getIndex(['surface']);
            const idxFee = getIndex(['honoraires', 'ht', 'montant']);
            const idxType = getIndex(['type', 'transaction']);
            const idxSource = getIndex(['source', 'origine']);

            // Fallbacks if not found (based on old fixed indices: 0, 1, 2, 3, 6, 8, 9)
            const iDate = idxDate !== -1 ? idxDate : 0;
            const iAddr = idxAddress !== -1 ? idxAddress : 1;
            const iZip = idxZip !== -1 ? idxZip : 2;
            const iSurf = idxSurface !== -1 ? idxSurface : 3;
            const iFee = idxFee !== -1 ? idxFee : 6;
            const iType = idxType !== -1 ? idxType : 8;
            const iSource = idxSource !== -1 ? idxSource : 9;

            for (const line of dataLines) {
                // Handle CSV split (robust regex for comma inside quotes)
                const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

                if (cols.length < 5) continue; // Basic check

                const dateStr = cols[iDate]?.trim().replace(/"/g, '');
                const address = cols[iAddr]?.trim().replace(/"/g, '');
                const zip = cols[iZip]?.trim().replace(/"/g, '');
                const surfaceStr = cols[iSurf]?.trim().replace(/"/g, '');
                const montantStr = cols[iFee]?.trim().replace(/"/g, '');
                const typeStr = cols[iType]?.trim().replace(/"/g, '');
                const sourceStr = cols[iSource]?.trim().replace(/"/g, '');

                if (!address || !typeStr) continue;

                let normalizedType = "AUTRE";
                const t = typeStr.toUpperCase();
                if (t.includes("LOCATION")) normalizedType = "LOCATION";
                else if (t.includes("VENTE")) normalizedType = "VENTE";
                else normalizedType = "AUTRE";

                // Deduce Zone
                const zone = deduceZone(zip);

                // Create Property
                const property = await prisma.property.create({
                    data: {
                        addressFull: address,
                        zipCode: zip || "",
                        city: deduceCity(zip) || "Grand Lyon",
                        zone: zone,
                    }
                });

                // Create Deal
                await prisma.deal.create({
                    data: {
                        propertyId: property.id,
                        type: normalizedType,
                        signatureDate: parseDate(dateStr),
                        surfaceM2: parseFrenchNumber(surfaceStr),
                        agencyFee: parseFrenchNumber(montantStr),
                        source: sourceStr || "Non renseigné",
                        visitsCount: 1,
                        notes: `Type: ${typeStr} | GID: ${gid}`
                    }
                });

                totalCount++;
            }
        }

        return { success: true, count: totalCount, logs };
    } catch (e: any) {
        console.error(e);
        return { success: false, error: e.message };
    }
}
