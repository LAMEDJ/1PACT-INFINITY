-- Optionnel : si vous utilisez Supabase, exécutez ce script pour ajouter
-- les colonnes du profil utilisateur (bouton Modifier profil) + système Impact.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'public';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true;
-- Colonnes Impact (niveau, points) – évite l'erreur "colonne niveau impact dans le cache du schema"
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS impact_points int DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS impact_level int DEFAULT 1;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_valid_actions int DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_rewarded_action_count int DEFAULT 0;
