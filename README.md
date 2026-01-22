# Lyon Offices Dashboard

Un outil de pilotage de performance privé pour broker en immobilier d'entreprise (Bureaux - Lyon).

## Architecture Technique

Le projet est conçu comme une application "Self-Contained" (Monolithe modulaire) pour simplifier la maintenance et le déploiement, tout en offrant des performances maximales.

### Stack
- **Frontend**: Next.js 14 (App Router)
  - **Rendu**: Server Components (RSC) par défaut pour la rapidité et le SEO (interne).
  - **Styling**: CSS Modules + Variables CSS (Design Token System) pour un look "DeFiLlama" léger et sombre.
  - **Visualisation**: Recharts pour les graphiques analytiques.
- **Backend**: Next.js Server Actions
  - Pas d'API externe complexe : les composants React appellent directement la base de données via Prisma (type-safety de bout en bout).
- **Base de Données**: PostgreSQL
  - Schéma relationnel strict pour garantir l'intégrité des calculs financiers.
- **Authentification**: NextAuth.js (recommandé) ou gestion session simple.

### Structure du Projet (`src/`)
- `app/` : Routes et Pages (Overview, Analytiques).
- `components/` : Composants UI réutilisables (Charts, KPI Cards, Tables).
- `lib/` : Utilitaires et instance Prisma.
- `styles/` : Thème global et reset CSS.

## Fonctionnalités Clés
1. **Overview**: Vue d'ensemble des KPIs (CA, Surfaces, Deals).
2. **Import Data**: Script d'ingestion pour transformer les exports Numbers/Excel en données SQL.
3. **Analytiques**:
   - **Géographique**: Performance par secteur (Est/Ouest/Centre).
   - **Commerciale**: Taux de transformation et efficacité des sources (SeLoger vs Prospection).

## Installation

1. Pré-requis : Node.js 18+ et PostgreSQL.
2. Cloner le repo.
3. Installer les dépendances :
   ```bash
   npm install
   ```
4. Configurer la base de données dans `.env` :
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/lyon_offices"
   ```
5. Synchroniser le schéma :
   ```bash
   npx prisma db push
   ```
6. Lancer le serveur :
   ```bash
   npm run dev
   ```
