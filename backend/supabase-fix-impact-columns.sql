-- ============================================
-- 1PACT – Ajout des colonnes Impact sur la table users
-- À exécuter dans Supabase : SQL Editor → New query → Coller → Run
-- Corrige l'erreur : "impossible de trouver la colonne de niveau impact..."
-- ============================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS impact_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impact_level INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_valid_actions INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_rewarded_action_count INT DEFAULT 0;

COMMENT ON COLUMN public.users.impact_points IS 'Points Impact cumulés';
COMMENT ON COLUMN public.users.impact_level IS 'Niveau Impact (badge)';
