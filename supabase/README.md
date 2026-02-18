# Tables Supabase pour 1PACT

**Projet Supabase 1PACT** : `https://vdhkmyrscwjsnebkzdnx.supabase.co`

## Créer les tables

1. Ouvre ton projet sur [supabase.com](https://supabase.com) → **SQL Editor** → **New query**.
2. Copie tout le contenu de `supabase/migrations/001_1pact_schema.sql`.
3. Colle dans l’éditeur et exécute (Run).

Cela crée les tables :

- `users` – utilisateurs (membres)
- `associations` – associations
- `publications` – publications des associations
- `publication_likes` – likes (utilisateur → publication)
- `publication_comments` – commentaires
- `follows` – abonnements (utilisateur → association)
- `conversations` – conversations messagerie
- `conversation_participants` – participants (user / association)
- `messages` – messages

**Données démo** : exécute aussi `002_seed_demo.sql` pour insérer 3 associations et leurs publications (connexion : contact@solidaritejeunes.fr etc., mot de passe `demo123`).

## Connecter le backend

1. Dans le dossier **backend**, crée un fichier `.env` (tu peux copier `backend/.env.example`).
2. Ajoute (avec les valeurs de ton projet Supabase → Settings → API) :
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = clé **service_role**
3. Redémarre le backend (`npm run dev`). Au démarrage tu dois voir : `[DB: Supabase (PostgreSQL)]`.

Pour importer les données des fichiers JSON vers Supabase : exécute le schéma SQL, ajoute la clé, puis depuis le dossier backend lance `node scripts/migrate-json-to-supabase.js`.

Sans ces variables, le backend utilise le stockage JSON (fichiers dans `backend/data/`). Avec Supabase, les tables sont vides au départ : inscris-toi depuis l’app pour créer les premiers comptes.
