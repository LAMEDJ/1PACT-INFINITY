# Checklist Supabase – tout brancher

Projet Supabase : **https://vdhkmyrscwjsnebkzdnx.supabase.co**

L’URL est déjà dans `backend/.env` et `frontend/.env`. Il reste les étapes ci‑dessous.

---

## 1. Créer les tables dans Supabase

1. Va sur **https://supabase.com** → ton projet → **SQL Editor** → **New query**.
2. Ouvre le fichier **`supabase/migrations/001_1pact_schema.sql`** du repo, copie tout le contenu, colle dans l’éditeur, clique **Run**.
3. **Important** : exécute **`backend/supabase-fix-impact-columns.sql`** pour ajouter les colonnes Impact sur `users` (évite l'erreur « colonne niveau impact »).
4. (Optionnel) Même chose avec **`supabase/migrations/002_seed_demo.sql`** pour insérer les 3 associations démo et leurs publications (connexion : contact@solidaritejeunes.fr / contact@culturepartage.fr / contact@sportpourtous.fr, mot de passe **demo123**).

---

## 2. Ajouter les clés API

1. Dans Supabase : **Settings** (engrenage) → **API**.
2. Ouvre **`backend/.env`** et colle la clé **service_role** (secret) sur la ligne :
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
3. Ouvre **`frontend/.env`** et colle la clé **anon** (publique) sur la ligne :
   ```env
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

---

## 3. Redémarrer l’app

1. Arrête le backend (Ctrl+C) puis relance : dans le dossier **backend**, `npm run dev`.
2. Tu dois voir au démarrage : **`[DB: Supabase (PostgreSQL)]`**.
3. Ouvre le frontend (ex. http://localhost:5173). Tu peux te connecter avec un compte démo (si tu as exécuté `002_seed_demo.sql`) ou t’inscrire.

---

## Option : migrer les données JSON au lieu du seed SQL

Si tu préfères importer le contenu actuel de **`backend/data/*.json`** (au lieu du seed SQL) :

1. Exécute **`001_1pact_schema.sql`** (pas 002).
2. Exécute **`backend/supabase-fix-impact-columns.sql`** pour ajouter les colonnes Impact sur `users`.
3. Renseigne **`SUPABASE_SERVICE_ROLE_KEY`** dans `backend/.env`.
4. Dans le dossier **backend** : `npm run migrate:supabase`.

---

## Dépannage

- **Erreur « colonne de niveau impact / cache du schema »** sur un compte utilisateur → exécute **`backend/supabase-fix-impact-columns.sql`** dans le SQL Editor Supabase. Voir **`backend/ERREUR_NIVEAU_IMPACT.md`** pour le détail.

---

Quand tout est fait : le site utilise Supabase, les tables sont créées, et (si tu as fait le seed ou la migration) les comptes démo sont disponibles.
