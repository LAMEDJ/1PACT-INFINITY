# Correction navigation bottom nav – 1PACT

## Contexte technique

Le projet utilise **React + Vite + react-router-dom** (pas Next.js). La page d’accueil `/` affiche **5 panneaux en défilement horizontal** (style Snapchat). La barre du bas permet de changer d’onglet par **clic** ou par **swipe** sur le contenu.

---

## Diagnostic (Phase 1)

### 1. Routing

- Les 5 onglets ne sont **pas** des routes distinctes : tout est sur la route `/`.
- L’état d’onglet était géré uniquement par `useState(currentPageIndex)` sans lien avec l’URL.
- Conséquences : pas d’URL à partager, et après un refresh on retombait toujours sur le même onglet (Fil).

### 2. Layout / enfants

- Le layout affiche bien `{children}` (les 5 pages).
- Le scroll était déclenché dans un `useEffect`, donc après le paint : risque de délai ou de race avec le scroll manuel.

### 3. State / scroll

- Pendant le scroll **programmatique** (après un clic), l’événement `onScroll` était aussi déclenché.
- `handleScroll` appelait `onPageChange(index)` avec des index intermédiaires (0, 1, 2…) pendant l’animation, ce qui pouvait faire clignoter l’onglet actif ou perturber l’état.

### 4. Clics

- Les boutons étaient bien en `type="button"`, sans `preventDefault` bloquant.
- Les correctifs précédents (z-index, suppression de `pointer-events: none`) restent en place dans le nouveau composant.

### 5. Pas d’erreur d’hydratation

- Pas de Next.js donc pas de SSR ; pas de mismatch hydratation identifié.

---

## Causes retenues

1. **Scroll programmatique** : `useEffect` + scroll smooth pouvait être en conflit avec `onScroll` et donner l’impression que la page ne changeait pas ou clignotait.
2. **Pas de sync URL** : l’état n’était pas reflété dans l’URL, ce qui pouvait déstabiliser le comportement perçu (refresh, onglet actif).
3. **Pas de garde pendant le scroll programmatique** : les événements de scroll pendant l’animation mettaient à jour l’index inutilement.

---

## Corrections (Phase 2)

### 1. Composant dédié `BottomNav`

- **Fichier** : `src/components/BottomNav.jsx`
- Rôle : afficher les 5 items, recevoir `currentIndex` et `onSelect`, pas de logique de route.
- Chaque item est un **bouton** `type="button"` qui appelle `onSelect(index)`.
- État actif : `currentIndex === index` → classe `active` + `aria-current="page"`.
- Styles : `src/components/BottomNav.css` (fixe en bas, z-index 100, safe area iOS).

### 2. Layout

- **Fichier** : `src/components/Layout.jsx`
- Utilise **`useLayoutEffect`** pour le scroll (au lieu de `useEffect`) : le scroll se fait juste après la mise à jour du DOM, avant le paint, ce qui rend le changement d’onglet plus fiable et immédiat.
- **Ref `isProgrammaticScrollRef`** : mise à `true` avant `scrollTo`, remise à `false` après ~400 ms. Pendant ce délai, `handleScroll` **ne fait rien** (return immédiat), ce qui évite les mises à jour d’index pendant l’animation.
- `handleScroll` n’appelle `onPageChange(index)` que si `index !== currentPageIndex`, pour éviter des mises à jour inutiles.
- La nav en bas est remplacée par le composant `<BottomNav currentIndex={...} onSelect={...} />`.

### 3. App – synchronisation avec l’URL

- **Fichier** : `src/App.jsx`
- **Lecture** : l’index initial vient de l’URL via `useSearchParams()` et `?page=0` à `?page=4`. Si absent ou invalide, défaut = `2` (Fil).
- **Écriture** : au clic sur un onglet, `setCurrentPageIndex(index)` met à jour l’état **et** l’URL :
  - index `2` (Fil) → URL sans query (`/`).
  - index 0, 1, 3, 4 → `/?page=0`, `/?page=1`, etc.
- Un **`useEffect`** réagit aux changements de `searchParams` (ex. bouton retour du navigateur) et met à jour l’état, ce qui déclenche le scroll vers le bon panneau.

---

## Structure des fichiers

```
frontend/src/
  App.jsx              # État + sync URL (?page=), passe currentPageIndex + onPageChange au Layout
  components/
    Layout.jsx         # Header + main (scroll) + BottomNav ; useLayoutEffect + ref scroll programmatique
    Layout.css         # Header + .layout-pages (plus de styles nav)
    BottomNav.jsx      # Barre du bas, boutons, active selon currentIndex
    BottomNav.css      # Styles bottom nav (fixe, z-index, safe area)
```

---

## Comportement attendu

- **Clic sur un item** : mise à jour de l’état + de l’URL, scroll immédiat vers le bon panneau, onglet actif visible.
- **Swipe horizontal** : le scroll manuel met à jour l’index (et l’URL) via `handleScroll`, sans conflit avec le scroll programmatique grâce à la ref.
- **Rafraîchissement** : l’onglet ouvert est conservé grâce à `?page=N`.
- **Bouton retour du navigateur** : l’URL change, l’effet dans App met à jour l’index, le Layout scroll au bon panneau.

---

## Éviter que le problème revienne

1. Ne pas désactiver les clics sur la bottom nav (pas de `pointer-events: none` sur le conteneur).
2. Garder le scroll programmatique dans un **`useLayoutEffect`** (ou au moins un `useEffect` avec la même logique de ref).
3. Toujours ignorer les événements `onScroll` pendant le scroll déclenché par le code (ref + timeout).
4. Conserver la synchronisation URL ↔ index pour un comportement prévisible au refresh et au back/forward.
