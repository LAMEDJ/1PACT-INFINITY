# Déployer 1PACT sur GitHub et Vercel

Le projet est prêt : Git (branche `main`), `.gitignore`, CI (`.github/workflows/vercel-deploy.yml`), `frontend/vercel.json`.

## Option rapide (script)

Une fois connecté (une seule fois) : `gh auth login` et `npx vercel login` (depuis `frontend`).

```powershell
cd "c:\Users\bryan\Documents\1PACT INFINITY"
.\scripts\deploy-github-vercel.ps1
```

Avec token GitHub : `$env:GH_TOKEN = "ghp_xxx"; .\scripts\deploy-github-vercel.ps1`

## 1. GitHub

### Créer le dépôt et pousser (avec GitHub CLI)
```powershell
gh auth login   # une seule fois
gh repo create 1pact-infinity --public --source=. --remote=origin --push
```

### Ou manuellement
1. Crée le dépôt sur [github.com/new](https://github.com/new) (ex. `1pact-infinity`, sans README).
2. À la racine du projet :
```powershell
git remote add origin https://github.com/TON_USERNAME/1pact-infinity.git
git push -u origin main
```

---

## 2. Vercel (frontend)

### Connecter le dépôt
1. Va sur [vercel.com](https://vercel.com) et connecte-toi (avec GitHub si possible).
2. **Add New** → **Project**.
3. **Import** le dépôt GitHub `1pact-infinity`.
4. **Important** : dans les paramètres du projet, définis **Root Directory** sur `frontend` (clic sur **Edit** à côté de Root Directory, saisis `frontend`).
5. Vercel détecte Vite automatiquement. Build Command : `npm run build`, Output : `dist`.
6. Ajoute les variables d’environnement (Settings → Environment Variables) :
   - `VITE_API_URL` = l’URL de ton API en production (ex. `https://ton-backend.railway.app/api` ou autre).
   - `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` si tu utilises Supabase côté frontend.
7. Clique sur **Deploy**.

Le site sera en ligne sur une URL du type `https://1pact-infinity-xxx.vercel.app`.

### Backend (API)
Le backend Node (dossier `backend`) ne tourne pas sur Vercel. Pour le mettre en production, utilise par exemple **Railway**, **Render** ou **Fly.io**, puis indique son URL dans `VITE_API_URL` sur Vercel.
