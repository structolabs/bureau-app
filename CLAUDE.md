## Contexte partagé Structo
Contexte détaillé : ~/Documents/Structo/Context/ — voir INDEX.md
Mémoire partagée : Acheron MCP
Scraping : Firecrawl MCP

# CLAUDE.md — Bureau Nanette
> Application de gestion de bureau partagé
> Projet React + Vite + Tailwind + Supabase
> Client : Simon Caland + sous-locataires (Flo, Franck)
> Développeur : Simon, Structo / SC-Consult SASU
> URL : bureau-app.vercel.app → bureau.structolabs.fr
> Repo : structolabs/bureau-app

---

## 1. CONTEXTE

Application interne pour le bureau partagé de Structo au 12 rue de l'Aimable Nanette, 17000 La Rochelle.
3 occupants : Simon (Structo), Flo (PENGUINVEST), Franck (F&F STUDIO).
Dashboard unique avec agenda partagé, réservation de bureau, et suivi des dépenses communes.

---

## 2. STACK TECHNIQUE

```
React 19 + Vite + Tailwind CSS
Supabase (ID: uapsfemdlqslnxxkgte) — auth + base de données
Deploy : Vercel (bureau-app.vercel.app → bureau.structolabs.fr)
DNS : A record bureau.structolabs.fr → 76.76.21.21 (chez o2switch)
```

---

## 3. FONCTIONNALITÉS V1 (livrée 19/03/2026)

- PIN d'accès : 1234 (même PIN pour tous)
- Google Calendar iframe : agenda partagé "BUREAU Aimable Nanette"
- Bouton Réserver (lien vers agenda)
- Dépenses communes : saisie, modification et suppression de ses propres dépenses
- Solde indicatif entre occupants

---

## 4. OCCUPANTS

| Nom | Société | Email |
|-----|---------|-------|
| Simon | Structo / SC CONSULT SAS | simon@structolabs.fr |
| Flo (Florian Bayard) | PENGUINVEST | contact@penguinvest.fr |
| Franck Socha | F&F STUDIO | franck@francksocha.com |

---

## 5. RÈGLES

- Email public Structo : contact@structolabs.fr
- Les sous-locataires ne font PAS partie de l'équipe Structo
- Ne jamais les mentionner dans les plans ou documents Structo
- PIN unique pour simplifier (pas de gestion multi-utilisateurs)

---

## 6. FICHIERS CONTEXT CENTRALISÉS

Fichiers détaillés dans ~/Documents/Structo/Context/ :
- CONTEXT.md — contexte général Structo
- CONTEXT_CLIENTS.md — tous les clients actifs
- CONTEXT_DEV.md — règles dev, Claude Code, stack technique
- INDEX.md — table des matières et mapping repos → fichiers

---

*Structo / SC-Consult SASU — contact@structolabs.fr*
*Mis à jour le 26/03/2026*
