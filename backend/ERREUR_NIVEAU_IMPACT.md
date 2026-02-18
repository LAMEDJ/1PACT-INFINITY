# Erreur « Colonne niveau impact dans le cache du schema »

Si tu vois cette erreur pour un **compte utilisateur**, la table `users` dans Supabase n’a pas les colonnes du système Impact.

## Correction en 1 étape

1. Ouvre **Supabase** → ton projet → **SQL Editor** → **New query**.
2. Copie tout le contenu du fichier **`supabase-fix-impact-columns.sql`** (dans ce dossier).
3. Colle dans l’éditeur et clique **Run**.
4. Recharge l’app (ou déconnecte-toi puis reconnecte-toi).

Les colonnes `impact_points`, `impact_level`, `total_valid_actions` et `last_rewarded_action_count` seront ajoutées à la table `users`. L’erreur disparaîtra.
