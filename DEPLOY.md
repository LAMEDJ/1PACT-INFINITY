# Déployer 1PACT sur GitHub et Vercel

## 1. GitHub

### Créer le dépôt sur GitHub
1. Va sur [github.com/new](https://github.com/new).
2. Nom du dépôt : `1pact-infinity` (ou autre).
3. Ne coche pas "Initialize with README" (le projet a déjà des fichiers).
4. Clique sur **Create repository**.

### Pousser le code
Dans PowerShell, à la racine du projet :

```powershell
cd "c:\Users\bryan\Documents\1PACT INFINITY"
git remote add origin https://github.com/TON_USERNAME/1pact-infinity.git
git branch -M main
git push -u origin main
```

Remplace `TON_USERNAME` et `1pact-infinity` par ton compte GitHub et le nom du dépôt.

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
