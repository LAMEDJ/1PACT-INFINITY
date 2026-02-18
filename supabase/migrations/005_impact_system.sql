-- ============================================
-- 1PACT – Système Points Impact + Niveau Impact
-- Champs utilisateur : impact_points, impact_level, total_valid_actions, last_rewarded_action_count
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS impact_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impact_level INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_valid_actions INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_rewarded_action_count INT DEFAULT 0;

COMMENT ON COLUMN users.impact_points IS 'Points Impact cumulés (+3 toutes les 8 actions, +3 à l''inscription)';
COMMENT ON COLUMN users.impact_level IS 'Niveau Impact : floor(impact_points/24)+1';
COMMENT ON COLUMN users.total_valid_actions IS 'Nombre d''actions validées (likes + commentaires + suivis)';
COMMENT ON COLUMN users.last_rewarded_action_count IS 'Dernier total déjà récompensé (évite double attribution)';
