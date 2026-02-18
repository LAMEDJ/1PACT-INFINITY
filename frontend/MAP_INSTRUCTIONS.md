# Carte interactive 1PACT – configuration et déploiement

## Ce qui est en place

- **Backend** : la route `GET /api/quests` renvoie les quêtes (stockage JSON dans `backend/data/quests.json` ou Supabase). Au premier démarrage du backend, 3 quêtes de démo sont créées si la table est vide.
- **Carte** : fond Plan (OpenStreetMap) et Satellite (ESRI World Imagery), sans clé API.
- **Géolocalisation** : suivi GPS toutes les 2 secondes quand « Activer ma position » est activé.
- **Quêtes** : chargées depuis Supabase (table `quests`) ou données de démo si Supabase absent.
- **Itinéraires** : calcul via OSRM (marche, vélo, voiture), tracé en polyline verte sur la carte.
- **Overlay** : onglets Quêtes / Profil / Score / Inventaire (style type Pokémon Go).

## Google Maps (optionnel)

Pour utiliser **Google Maps** en fond (Satellite / Hybride) à la place d’ESRI/OSM :

1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com/) et activer « Maps JavaScript API » et « Maps Static API » si besoin.
2. Créer une clé API et la restreindre (HTTP referrers pour le site).
3. Ajouter dans `.env` : `VITE_GOOGLE_MAPS_API_KEY=ta_cle`.
4. Dans le code, remplacer le `TileLayer` Satellite par un composant qui charge le SDK Google et utilise `google.maps.Map` (ou une librairie type `@react-google-maps/api`). La carte actuelle utilise Leaflet ; pour du Google pur il faudrait une refonte du composant carte.

**Actuellement** : pas de clé nécessaire, la carte fonctionne avec OSM + ESRI.

## Supabase – table des quêtes

Exécuter dans l’éditeur SQL Supabase (Dashboard → SQL Editor) :

```sql
create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  lat double precision not null,
  lng double precision not null,
  radius_m integer default 50,
  reward text,
  icon_url text,
  progression integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.quests enable row level security (RLS);

create policy "Quests are public read"
  on public.quests for select
  using (true);
```

Variables d’environnement à définir (ex. `.env`) :

- `VITE_SUPABASE_URL` : URL du projet Supabase
- `VITE_SUPABASE_ANON_KEY` : clé anonyme (publique)

## Déploiement

1. Build : `npm run build` dans `frontend/`.
2. Héberger le contenu de `frontend/dist/` sur ton hébergeur (Vercel, Netlify, etc.).
3. En production, activer HTTPS (requis pour la géolocalisation dans beaucoup de navigateurs).
4. RGPD : afficher un bandeau ou une page d’info sur l’utilisation de la position (quêtes, itinéraires) et ne l’activer qu’après consentement (bouton « Activer ma position » joue ce rôle).

## Réglages utiles

- **Rayon de déclenchement des quêtes** : 50 m par défaut, modifiable dans `frontend/src/lib/quests.js` (`DEFAULT_QUEST_RADIUS_M`) et dans chaque quête (`radius_m`).
- **Rafraîchissement GPS** : 2 secondes dans `frontend/src/pages/MapPage.jsx` (`intervalMs: 2000` dans `useGeolocation`). Tu peux passer à 1000 ou 3000.
- **Couleurs et style** : variables CSS dans `frontend/src/pages/MapPage.css` (`--map-route-color`, `--map-user-dot`, `--map-quest-dot`, etc.).
