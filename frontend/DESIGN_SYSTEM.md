# 1PACT – Design System 2026

Hybride **PathFinders** (immersif, vert profond, contemplatif) × **Explore Travel** (glassmorphism, dégradés, UI épurée).

---

## Palette de couleurs

| Variable CSS | Valeur | Usage |
|--------------|--------|--------|
| `--color-deep-green` | `#0F3D3E` | Base sombre, textes principaux |
| `--color-deep-green-light` | `#145c5e` | Variante header / fonds |
| `--color-petrol` | `#146670` | Bleu pétrole, liens, actifs |
| `--color-mist` | `#e8ecf1` | Fond principal (brume) |
| `--color-mist-light` | `#f0f4f8` | Fond clair |
| `--color-off-white` | `#fafbfc` | Texte sur fond sombre |
| `--color-accent-turquoise` | `#2dd4bf` | Accent turquoise |
| `--color-accent-green` | `#34d399` | Accent vert lumineux |
| `--gradient-cta` | `linear-gradient(135deg, #2dd4bf 0%, #34d399 100%)` | Boutons CTA |

---

## Effets UI

- **Fond atmosphérique** : classe `.bg-atmospheric` (dégradés radiaux discrets).
- **Cards** : `--color-card` + `backdrop-filter: blur(12px)` + `--shadow-card`.
- **Card premium** : `--color-card-glass` + `backdrop-filter: blur(16px)`.
- **Coins** : `--radius-card` (20px), `--radius-card-lg` (28px).
- **Transitions** : `--duration-smooth` (200ms), `--ease-smooth` (cubic-bezier).

---

## Composants

### Bouton primaire (CTA)
- Classe : `.btn-primary`
- Fond : `--gradient-cta`
- Hover : `box-shadow: var(--shadow-glow)`, léger `brightness(1.05)`.

### Bouton secondaire (ghost)
- Classe : `.btn-secondary`
- Fond transparent, bordure `2px solid rgba(15, 61, 62, 0.25)`.
- Hover : bordure + fond léger.

### Card standard
- Classe : `.card-standard`
- Fond semi-opaque + `backdrop-filter: blur(12px)`.

### Card premium
- Classe : `.card-premium`
- Fond plus transparent + blur 16px.

---

## Typographie

- **Titres** : `font-weight: 700`, `letter-spacing: 0.02em` à `0.04em`.
- **Texte** : couleur `--color-deep-green`, opacité 0.8–0.9 pour secondaire.

---

## Framer Motion

- Animation d’entrée formulaire Auth : `opacity` + `y` (200–350 ms, ease personnalisé).
- À réutiliser sur d’autres blocs avec `motion.section` ou `motion.div`.

---

## Responsive

- Breakpoint principal : `600px` (media queries existantes).
- Layout : mobile-first ; la nav en pilule et le scroll horizontal sont déjà adaptés.

---

## Fichiers clés

- `src/index.css` : variables, `.bg-atmospheric`, `.btn-primary`, `.btn-secondary`, `.card-*`.
- `src/components/Layout.css` : header vert profond, nav glassmorphism.
- `src/pages/AuthPage.css` : formulaire en card, CTA dégradé.
- `tailwind.config.js` : couleurs et ombres étendues (optionnel).
