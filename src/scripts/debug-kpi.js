const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const start = new Date('2024-01-01');
    const end = new Date('2025-01-01');

    const deals = await prisma.deal.findMany({
        where: {
            signatureDate: {
                gte: start,
                lt: end
            }
        }
    });

    const signatures = deals.filter(d => d.type === 'LOCATION' || d.type === 'VENTE');
    const totalSignatures = signatures.length;

    const revenueFromSignatures = signatures.reduce((acc, d) => acc + d.agencyFee, 0);
    const totalRevenue = deals.reduce((acc, d) => acc + d.agencyFee, 0);

    const avgFee = totalSignatures > 0 ? revenueFromSignatures / totalSignatures : 0;
    const avgFeeHybrid = totalSignatures > 0 ? totalRevenue / totalSignatures : 0;

    console.log("2024 Analysis:");
    console.log(`Total Deals (lines): ${deals.length}`);
    console.log(`Real Signatures (Loc+Vente): ${totalSignatures}`);
    console.log(`Total Revenue (All): ${totalRevenue}`);
    console.log(`Revenue from Signatures: ${revenueFromSignatures}`);
    console.log(`Avg Fee (Signatures Only): ${avgFee}`);
    console.log(`Avg Fee Hybrid (Total Rev / Signatures): ${avgFeeHybrid}`);

    // Check if there are deals with 0 or low amounts
    const lowDeals = signatures.filter(d => d.agencyFee < 500);
    if (lowDeals.length > 0) {
        console.log("Signatures with low fees (<500):", lowDeals.map(d => d.agencyFee));
    }
}

main().catch(e => console.error(e)).finally(async () => {
    await prisma.$disconnect();
});
