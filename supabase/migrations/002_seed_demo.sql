-- Données démo 1PACT (associations + publications)
-- À exécuter dans le SQL Editor Supabase après 001_1pact_schema.sql
-- Comptes association : mot de passe demo123

INSERT INTO associations (email, password_hash, name, bio, category, public_cible, location, contact, profile_views, latitude, longitude, impact_points)
VALUES
  ('contact@solidaritejeunes.fr', '$2a$10$Ct9zCiScGOeWmS4LUd02uePCYWnrgWhcRythhNEIK3HqSz1MCils6', 'Solidarité Jeunes', 'Association d''entraide pour les jeunes.', 'Humanitaire', 'Ados, Adultes', 'Paris 15e', 'contact@solidaritejeunes.fr', 0, 48.8422, 2.3003, 120),
  ('contact@culturepartage.fr', '$2a$10$Ct9zCiScGOeWmS4LUd02uePCYWnrgWhcRythhNEIK3HqSz1MCils6', 'Culture & Partage', 'Ateliers culturels et artistiques.', 'Culturel', 'Ados, Adultes', 'Lyon', 'contact@culturepartage.fr', 0, 45.7640, 4.8357, 85),
  ('contact@sportpourtous.fr', '$2a$10$Ct9zCiScGOeWmS4LUd02uePCYWnrgWhcRythhNEIK3HqSz1MCils6', 'Sport pour tous', 'Running et sport en groupe.', 'Sport', 'Adultes', 'Marseille', 'contact@sportpourtous.fr', 0, 43.2965, 5.3698, 150)
ON CONFLICT (email) DO NOTHING;

-- Publications (association_id 1, 2, 3 = les 3 associations insérées ci-dessus)
INSERT INTO publications (association_id, text, visibility, impact_points)
SELECT id, 'Nous cherchons des bénévoles pour notre collecte alimentaire ce samedi. Inscription sur le lien ci-dessous !', 'public', 12 FROM associations WHERE email = 'contact@solidaritejeunes.fr' LIMIT 1;

INSERT INTO publications (association_id, text, visibility, impact_points)
SELECT id, 'Atelier peinture gratuit pour les 12-18 ans, mercredi 15h. Places limitées.', 'public', 8 FROM associations WHERE email = 'contact@culturepartage.fr' LIMIT 1;

INSERT INTO publications (association_id, text, visibility, impact_points)
SELECT id, 'Nouvelle session de running collectif chaque mardi 18h. Débutants bienvenus.', 'public', 15 FROM associations WHERE email = 'contact@sportpourtous.fr' LIMIT 1;
