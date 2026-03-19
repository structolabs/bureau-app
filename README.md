# Bureau Nanette

App de gestion du bureau partagé — 12 rue de l'Aimable Nanette, La Rochelle

## Accès

- URL : https://bureau-nanette.vercel.app
- PIN : 1234 (Simon / Franck / Flo)

## Fonctionnalités

- Réservation du bureau via Google Calendar (BUREAU Aimable Nanette)
- Suivi des dépenses communes avec calcul automatique 1/3
- Solde indicatif par personne (À récupérer / À régler)
- Modifier et supprimer ses propres dépenses

## Stack

- React + Vite + Tailwind CSS
- Supabase (PostgreSQL) — projet bureau-app
- Déployé sur Vercel

## Développement local

1. Clone le repo
2. Crée un fichier `.env` :
   ```
   VITE_SUPABASE_URL=https://uapsfemdlqslnxxkgkte.supabase.co
   VITE_SUPABASE_ANON_KEY=ta-clé-anon
   ```
3. `npm install`
4. `npm run dev` → http://localhost:5173
