# Protection de la page Profil

## Comportement

- **Utilisateur connecté** → la page Profil s’affiche normalement.
- **Utilisateur non connecté** → redirection immédiate vers `/login` (ou `/auth`).  
  Impossible d’accéder au contenu Profil via l’URL directe (`/?page=4` ou `/profile`).

## Implémentation (React + Vite)

Ce projet est une **SPA React avec Vite**, pas Next.js. Il n’y a donc **pas de middleware côté serveur** (pas de `middleware.ts`).

La protection repose sur :

1. **AuthGuard** (`src/components/AuthGuard.jsx`)  
   - Utilise `useAuth()` (session via l’API existante).  
   - Affiche un loader « Vérification de session… » pendant la vérification.  
   - Si pas de session → `Navigate` vers `/login` (ou `/auth`) avec `replace`.  
   - Sinon → affiche les `children`.

2. **ProtectedProfile** (`src/components/ProtectedProfile.jsx`)  
   - Enveloppe le contenu Profil avec `AuthGuard`.  
   - Préserve l’URL de retour (`?redirect=...`) pour renvoyer sur le Profil après connexion.

3. **Routes**  
   - `/profile` → redirige vers `/?page=4`.  
   - `/auth` → redirige vers `/login`.  
   - La page Profil est le panneau 4 dans `App` ; l’accès est contrôlé par `ProtectedProfile` + `AuthGuard`.

## Sécurité

- **URL directe** : l’utilisateur est redirigé vers `/login`.  
- **Rafraîchissement** : même comportement.  
- **Nouvel onglet** : même comportement.  
- **Session expirée** : au prochain chargement ou navigation, `user` est vide → redirection.

La vérification de session est **côté client** (token + `api.auth.me()`). Pour une sécurité renforcée, le **backend doit valider le token** sur chaque requête protégée.

## Utilisation

Envelopper toute page protégée avec `AuthGuard` :

```jsx
<AuthGuard redirectTo="/login">
  <MaPageProtegee />
</AuthGuard>
```

Ou utiliser `ProtectedProfile` pour le Profil (déjà en place dans `ProfilePage.jsx`).
