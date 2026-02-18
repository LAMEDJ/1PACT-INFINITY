# Rapport d'audit – 1PACT INFINITY

**Date :** Février 2025  
**Objectif :** Rendre le site entièrement fonctionnel, sécurisé et prêt pour la production.

---

## ✔ Fonctionnel

### Boutons et actions opérationnels

| Élément | Statut | Détail |
|--------|--------|--------|
| **Proposer** (Fil) | ✔ | Envoi réel vers `POST /api/propositions`, feedback succès/erreur, loading sur le bouton |
| **Publier** | ✔ | Réservé associations, relié à l’API publications, redirection dashboard |
| **Chercher** | ✔ | Filtres appliqués au fil (catégorie, public, recherche, géo) |
| **S’abonner / Abonné** (profil asso) | ✔ | `follows` API, loading, erreur via toast |
| **Avis / Message** (profil asso) | ✔ | Création conversation + redirection messagerie |
| **Participer** (carte fil) | ✔ | Création conversation + message automatique |
| **Like / Commenter** | ✔ | API publications, mise à jour UI et points Impact |
| **Tableau de bord** | ✔ | Protégé (association), stats et publications |
| **Paramètres / Profil** | ✔ | Accessibles via profil (page 4), réglages dans tiroir |
| **Déconnexion** | ✔ | AuthContext, suppression token, redirection |
| **Stripe (paiement)** | ✔ | Route backend ; nécessite `STRIPE_SECRET_KEY` en prod |

### Données et persistance

- **Propositions :** Nouvelle ressource côté backend (store JSON + route `POST /api/propositions`). En mode Supabase, créer la table `propositions` (voir section Supabase ci‑dessous).
- **Projets (profil association) :** Données mock supprimées ; affichage « Aucun projet pour le moment » + invitation à contacter l’association.
- **Quêtes :** En production, si l’API et Supabase ne renvoient rien, plus de fallback mock : liste vide (comportement voulu pour prod).

### Routes et navigation

- Toutes les routes déclarées dans `main.jsx` existent et pointent vers des pages réelles.
- `/profile` → redirection vers `/?page=4`.
- `/publish` et `/dashboard` protégés par `ProtectedRoute` (redirection vers `/login?redirect=...` si non connecté).
- Aucun lien mort identifié dans les `Link` / `navigate()` audités.

---

## ⚠ Points à surveiller

1. **Toasts**  
   Système de toasts global en place (`ToastContext` + composant `Toast`) : tous les anciens `alert()` ont été remplacés par des toasts (succès / erreur / info). Confirmations : publication supprimée, modifiée, publiée ; erreurs sur commentaire, follow, messagerie, paiement.

2. **JWT en production**  
   Le backend utilise `JWT_SECRET` avec une valeur par défaut de développement. **En production, définir obligatoirement `JWT_SECRET`** dans les variables d’environnement (backend).

3. **Stripe**  
   Paiements opérationnels uniquement si `STRIPE_SECRET_KEY` (et éventuellement clés publiques) sont configurés. Sinon, le bouton peut afficher un message du type « Paiement non configuré ».

4. **Supabase – table `propositions`**  
   Si le backend tourne avec Supabase, créer la table pour les propositions, par exemple :
   ```sql
   create table if not exists public.propositions (
     id bigserial primary key,
     user_id bigint references public.users(id),
     association_id bigint references public.associations(id),
     category text,
     public_cible text,
     titre text,
     description text,
     created_at timestamptz default now()
   );
   alter table public.propositions enable row level security (RLS);
   -- Exemple : lecture par les associations sur leurs propositions, écriture par les users connectés
   create policy "Users can insert" on public.propositions for insert to authenticated with check (true);
   create policy "Associations can read own" on public.propositions for select using (association_id = auth.uid() or association_id is null);
   ```
   Adapter les policies selon votre modèle (auth.uid() vs id association/user).

5. **Console**  
   - Backend : `console.log` au démarrage et `console.error` en cas d’erreur init – acceptables.  
   - Frontend : `console.warn` dans `lib/supabase.js` est désormais conditionné par `import.meta.env.DEV` (affiché uniquement en développement).

---

## 🔐 Sécurité validée

- **Routes privées (frontend) :** `ProtectedRoute` exige un utilisateur connecté pour `/publish` et `/dashboard` ; `requireAssociation` restreint le dashboard aux associations.
- **API :** Les routes sensibles (publications, follows, conversations, notifications, dashboard, stripe, upload, propositions) sont protégées par le middleware `authUser` (JWT).
- **Propositions :** Champs limités en longueur côté backend (`category`, `public_cible`, `titre`, `description`) pour limiter les abus.
- **Pas de requête non protégée** pour les actions qui modifient des données ou exposent des infos utilisateur.

Recommandations supplémentaires pour la prod : définir `JWT_SECRET`, vérifier CORS (`CORS_ORIGIN`), et si Supabase est utilisé, revoir les policies RLS sur toutes les tables concernées.

---

## 🚀 Prêt pour déploiement

- Aucun bouton « fictif » : les actions déclenchées ont une logique backend ou un message clair (ex. « Connectez-vous pour proposer »).
- Systèmes principaux reliés au backend : auth, associations, publications, conversations, follows, notifications, dashboard, propositions, quêtes (list), upload.
- Données mock retirées ou limitées au dev (projets profil asso = vide ; quêtes = pas de mock en prod).
- Design cohérent avec le reste de l’app (toasts succès/erreur, loaders, boutons désactivés pendant chargement ou si formulaire invalide).
- UX : toasts de confirmation (suppression, modification, publication), bouton « Publier » désactivé si texte vide, bouton « Supprimer » désactivé pendant la suppression avec libellé « Suppression... ».
- Responsive : structure et navigation déjà adaptées (navbar, bottom nav, grilles).

**Checklist avant mise en ligne :**

- [ ] Définir `JWT_SECRET` (backend).
- [ ] Configurer Stripe si les paiements sont requis.
- [ ] Si Supabase : créer la table `propositions` et appliquer les migrations/RLS.
- [ ] Vérifier `VITE_API_URL` (frontend) pour pointer vers l’API en production.

---

*Rapport généré à l’issue de l’audit global (boutons, routes, mock, sécurité, persistance, production).*
