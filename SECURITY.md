# Sécurité 1PACT

## Clés et variables d'environnement

### Backend (`backend/.env`)

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `PORT` | Non (défaut 3000) | Port du serveur |
| `JWT_SECRET` | **Oui en production** | Secret pour signer les tokens JWT. Min. 24 caractères aléatoires. Générer : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CORS_ORIGIN` | Non | Origine autorisée (ex. `http://localhost:5173`) ou `true` en dev |
| `SUPABASE_URL` | Si tu utilises Supabase | URL du projet (Settings > API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Si tu utilises Supabase | Clé **secrète** service_role (Settings > API). Ne jamais exposer côté frontend |
| `DATABASE_URL` | Optionnel | Connexion Postgres (pour `npm run fix:impact`) |

### Frontend (`frontend/.env` ou `.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL de l’API backend en production |
| `VITE_SUPABASE_URL` | URL projet Supabase (publique) |
| `VITE_SUPABASE_ANON_KEY` | Clé **anon** (publique) uniquement. Jamais la service_role |

Les variables `VITE_*` sont incluses dans le build : n’y mets que des clés **publiques**.

---

## Bonnes pratiques

1. **Ne jamais commiter** `.env`, `backend/.env`, `frontend/.env` (ils sont dans `.gitignore`).
2. **Copier** `backend/.env.example` et `frontend/.env.example` en `.env` puis remplir les valeurs.
3. **En production** : définir `NODE_ENV=production` et un `JWT_SECRET` fort.
4. **Supabase** : la clé `service_role` bypass RLS ; ne l’utiliser que côté backend, jamais dans le frontend.

---

## Mesures en place

- En-têtes de sécurité (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Limite de taille du body JSON (512 Ko)
- Rate limit sur login/register : 10 tentatives / 15 min / IP
- Vérification JWT sur les routes protégées
- Refus de démarrer en production si `JWT_SECRET` faible ou absent
