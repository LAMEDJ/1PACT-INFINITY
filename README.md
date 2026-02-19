# 1PACT – Explore, rencontre, vis ce qui compte !

Plateforme SaaS qui met en relation les **associations** et les **utilisateurs** (en particulier les jeunes), pour donner de la visibilité aux associations et faciliter les échanges.

---

## Lancer l'application

**1. Backend (API + Socket.io)** – dans un premier terminal :

```bash
cd backend
npm install
npm run dev
```

Le serveur écoute sur `http://localhost:3000`.

**2. Frontend (React)** – dans un second terminal :

```bash
cd frontend
npm install
npm run dev
```

Ouvre ensuite `http://localhost:5173` (ou le port indiqué, ex. 5174/5175) dans ton navigateur.

**Compte démo (association)** : email `contact@solidaritejeunes.fr` (ou `contact@culturepartage.fr`, `contact@sportpourtous.fr`), mot de passe `demo123`.

---

## Supabase (optionnel)

Le projet peut utiliser **Supabase** (base de données, auth, stockage, temps réel). Le client est installé en frontend et backend.

**1. Créer un projet Supabase pour 1PACT**

1. Va sur [supabase.com](https://supabase.com) et connecte-toi.
2. **New project** : choisis un nom (ex. `1pact`), un mot de passe pour la base, une région.
3. Une fois le projet créé : **Settings** (icône engrenage) → **API**.
4. Note :
   - **Project URL** (ex. `https://xxxxx.supabase.co`)
   - **anon public** (clé publique pour le frontend)

**2. Brancher le frontend**

Dans le dossier `frontend` :

```bash
cp .env.example .env
```

Ouvre `.env` et remplace :

- `VITE_SUPABASE_URL` = Project URL
- `VITE_SUPABASE_ANON_KEY` = anon public

Redémarre le serveur frontend (`npm run dev`). Le client Supabase est disponible via `import { supabase } from './lib/supabase'` pour Auth, Realtime, Storage ou des requêtes vers des tables Supabase.

**3. Backend (optionnel)**

Pour utiliser Supabase côté serveur (Admin / Service Role), ajoute dans `backend/.env` (en t’inspirant de `backend/.env.example`) :

- `SUPABASE_URL` = Project URL
- `SUPABASE_SERVICE_ROLE_KEY` = clé **service_role** (Settings > API ; à garder secrète). Pour créer les tables et connecter le backend, voir **supabase/README.md**. Le projet est déjà configuré avec l’URL Supabase 1PACT (`https://vdhkmyrscwjsnebkzdnx.supabase.co`) dans `backend/.env` et `frontend/.env` ; il reste à ajouter les clés API et à exécuter le schéma SQL. Voir **SUPABASE_CHECKLIST.md** pour la checklist pas à pas.

L’app fonctionne sans Supabase : l’API actuelle utilise le stockage JSON. Supabase permet ensuite d’ajouter une vraie base PostgreSQL, l’auth Supabase ou le stockage de fichiers.

---

## Structure du MVP

### Navigation type Snapchat (5 pages)

1. **Accueil** – Bienvenue, accès rapide (Carte, Fil, Messages, Profil), aperçu des quêtes.
2. **Carte** – Carte Leaflet/OpenStreetMap avec marqueurs des associations, géolocalisation optionnelle.
3. **Fil d'actualité** (centre) – Publications, recherche, filtres, likes, Participer.
4. **Messagerie** – Conversations, chat en temps réel.
5. **Profil** – Mon profil, associations suivies, historique.

### Autres pages (routes)

- `/login` – Connexion et inscription (thème maquette : en-tête + formulaire à onglets). Lien direct inscription : `/login?tab=signup`.
- `/association/:id` – Profil association (Contacter, Participer, Suivre).
- `/publish` – Nouvelle publication (associations).
- `/dashboard` – Tableau de bord association (stats, publications, Stripe).

### Couleurs

- Bleu `#146670` (header, boutons), beige `#F7B28B` (texte sur bleu), bleu foncé `#104046` (texte sur fond clair).

---

## Ce qui est en place (MVP complet)

- **Frontend** : 5 pages (Accueil, Carte, Fil, Messagerie, Profil) ; profils association, publication (création + édition), tableau de bord, page 404. **Navigation** : swipe horizontal entre les 5 pages + barre du bas (5 boutons).
- **Backend** : API REST (auth, associations, publications, conversations, follows, upload), stockage JSON (`backend/data/`), fichiers médias dans `backend/uploads/`.
- **Auth** : page dédiée `/login` (connexion / inscription) avec thème maquette (en-tête, onglets, champs soulignés, validation), JWT.
- **Fil** : publications avec **recherche et filtres** (catégorie, public cible), like, **commentaires** (voir + ajouter), médias (photo/vidéo), lien Participer.
- **Profil** : thème maquette (barre haut avec retour/recherche, avatar, nom, stats Publications/Abonnés/Suivis, onglets **Publications | Médias**, liste des posts et grille médias, bouton flottant +). **Associations suivies** (liste, ne plus suivre), messagerie. Pour les utilisateurs, l’onglet Publications affiche les posts des associations suivies.
- **Profil association** : Contacter (ouvre la messagerie), Participer (idem), **Suivre / Suivi** (follow/unfollow).
- **Messagerie** : liste des conversations, **Nouvelle conversation** (choix d’une association pour les utilisateurs), envoi de messages, **temps réel** (Socket.io).
- **Dashboard** : statistiques, **Modifier** et Supprimer les publications, **Gérer l’abonnement** (Stripe, message si non configuré).
- **Publication** : création et **édition** (depuis le dashboard), upload photo/vidéo.
- **Carte** : Leaflet/OpenStreetMap, marqueurs des associations, géolocalisation.
- **Stripe** : routes préparées ; activer avec `STRIPE_SECRET_KEY` et le SDK Stripe.

---

## Sécurité

- **Variables d'environnement** : ne jamais commiter `.env` (déjà dans `.gitignore`). Utiliser `backend/.env.example` et `frontend/.env.example` comme modèles.
- **Backend** : en production, définir un `JWT_SECRET` fort (ex. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Ne pas exposer la clé Supabase `service_role` côté frontend.
- **Authentification** : toute réponse API 401 (token expiré ou invalide) supprime le token côté client et déconnecte l'utilisateur.
- **Commentaires** : longueur limitée à 2000 caractères (frontend et backend) ; le texte est trimé et traité comme chaîne (pas de HTML injecté).

---

## Déploiement (GitHub + Vercel + Render)

- **Frontend** : voir **[DEPLOY.md](DEPLOY.md)** (GitHub, Vercel).
- **Backend (API)** : déploiement en un clic sur Render :

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/LAMEDJ/1PACT-INFINITY)

Après le déploiement Render, ajoute dans le service **1pact-api** (Environment) : `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`. Puis lance `.\scripts\set-backend-url-and-redeploy.ps1 "https://ton-backend.onrender.com"`. Détails dans **[BACKEND-DEPLOY.md](BACKEND-DEPLOY.md)**.

---

## Suite possible

- Notifications push, géocodage pour les nouvelles associations, modération des commentaires.
