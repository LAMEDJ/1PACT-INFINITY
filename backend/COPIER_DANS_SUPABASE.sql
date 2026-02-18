-- ============================================
-- 1. Ouvre : https://supabase.com → ton projet
-- 2. SQL Editor → New query
-- 3. Copie TOUT ce fichier (Ctrl+A, Ctrl+C) et colle dans l'éditeur
-- 4. Clique Run
-- 5. Recharge ton app
-- ============================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS impact_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impact_level INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_valid_actions INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_rewarded_action_count INT DEFAULT 0;
