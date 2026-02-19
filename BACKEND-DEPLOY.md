# Backend pour l’URL Vercel – suite (déploiement terminé côté code)

Le code est sur **GitHub** ([LAMEDJ/1PACT-INFINITY](https://github.com/LAMEDJ/1PACT-INFINITY)) et le **frontend** est déployé sur **Vercel**. Il reste à déployer le **backend** sur Render puis à brancher son URL sur Vercel.

---

## Ce qui est déjà fait

- Code poussé sur **https://github.com/LAMEDJ/1PACT-INFINITY**
- Frontend déployé en production sur **Vercel** (dernier déploiement effectué)
- Fichier **render.yaml** à la racine pour le backend

---

## 1. Déployer le backend sur Render (à faire une fois)

1. Ouvre : **https://dashboard.render.com/blueprints**
2. **New** → **Blueprint**.
3. Connecte **GitHub** si demandé, puis choisis le dépôt **LAMEDJ/1PACT-INFINITY**.
4. Render détecte **render.yaml**. Clique sur **Apply** / **Deploy Blueprint**.
5. Une fois le service **1pact-api** créé, ouvre-le → onglet **Environment**.
6. Ajoute :
   - **SUPABASE_URL** = ton URL Supabase (Supabase → Settings → API)
   - **SUPABASE_SERVICE_ROLE_KEY** = ta clé service_role (Supabase → Settings → API)
7. Sauvegarde (Render redéploiera). **Note l’URL du service**, ex. **https://1pact-api-xxxx.onrender.com**.

---

## 2. Brancher l’URL du backend sur Vercel et redéployer

Quand le backend Render est en ligne, lance dans PowerShell à la racine du projet :

```powershell
.\scripts\set-backend-url-and-redeploy.ps1 "https://1pact-api-xxxx.onrender.com"
```

(Remplace par l’URL réelle de ton service Render, **sans** `/api` à la fin.)

Le script ajoute **VITE_API_URL** sur Vercel et redéploie le frontend. Après ça, le site Vercel utilisera le backend Render.

---

## 3. (Optionnel) Déploiements automatiques

- **Vercel** : dans [Paramètres → Git](https://vercel.com/bryans-projects-b3834990/frontend/settings/git), connecte le dépôt **LAMEDJ/1PACT-INFINITY** et mets **Root Directory** = `frontend`. Chaque push sur `main` redéploiera le frontend.
- **Render** : les pushes sur le dépôt connecté peuvent déclencher un redéploiement du backend (selon la config Render).

---

**Résumé** : déploiement frontend terminé. Il reste à créer le service backend sur Render (Blueprint), à ajouter les variables Supabase, puis à lancer le script avec l’URL du backend pour finaliser.
