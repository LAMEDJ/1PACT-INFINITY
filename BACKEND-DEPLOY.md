# Backend pour l’URL Vercel – à faire (3 étapes)

Le projet contient déjà **render.yaml** à la racine. Il suffit de connecter le dépôt à Render puis de configurer Vercel.

---

## Étape 1 : Déployer le backend sur Render

1. Ouvre : **https://dashboard.render.com/blueprints**
2. Clique sur **New** → **Blueprint**.
3. Connecte **GitHub** si demandé, puis choisis le dépôt **1pact-infinity** (ou le repo où tu as poussé le projet).  
   → Si tu ne vois pas le repo, pousse d’abord le code sur GitHub avec `.\scripts\push-github.ps1`.
4. Render détecte **render.yaml** à la racine. Clique sur **Apply** / **Deploy Blueprint**.
5. Une fois le service créé, ouvre le service **1pact-api** → onglet **Environment**.
6. Ajoute ces variables (en plus de celles déjà présentes) :
   - **SUPABASE_URL** = ton URL Supabase (Supabase → Settings → API)
   - **SUPABASE_SERVICE_ROLE_KEY** = ta clé service_role (Supabase → Settings → API)
7. Sauvegarde. Render redéploiera. Note l’URL du service, par ex. **https://1pact-api-xxxx.onrender.com**.

---

## Étape 2 : Configurer Vercel

1. Ouvre **https://vercel.com** → projet **Frontend** → **Settings** → **Environment Variables**.
2. Ajoute (ou modifie) :
   - **Name** : `VITE_API_URL`
   - **Value** : `https://1pact-api-xxxx.onrender.com/api`  
     (remplace par l’URL Render notée à l’étape 1, avec **/api** à la fin)
3. **Save** puis **Redeploy** le frontend (Deployments → ⋮ sur le dernier déploiement → **Redeploy**).

---

## Étape 3 : Vérifier

Ouvre ton site Vercel (ex. **https://frontend-self-kappa-74.vercel.app**). Connexion, fil, etc. doivent appeler le backend sur Render.

---

**Rappel** : le backend en local (`npm start` dans `backend`) sert au développement. Pour le site en ligne (Vercel), le backend doit être déployé sur Render (ou équivalent) et `VITE_API_URL` doit pointer vers son URL.
