/**
 * Ajoute les colonnes Impact (impact_points, impact_level, etc.) à la table users.
 * Utilise DATABASE_URL (connexion Postgres directe) si définie, sinon affiche le SQL à exécuter dans Supabase.
 *
 * Usage: node scripts/run-fix-impact-columns.js
 * Ou:    npm run fix:impact
 *
 * DATABASE_URL : Supabase > Settings > Database > Connection string > URI
 *                (remplace [YOUR-PASSWORD] par le mot de passe de la base)
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SQL = `
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS impact_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impact_level INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_valid_actions INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_rewarded_action_count INT DEFAULT 0;
`.trim();

async function runWithPg() {
  const { default: pg } = await import('pg');
  const url = process.env.DATABASE_URL;
  if (!url || !url.includes('postgres')) {
    console.log('Variable DATABASE_URL non définie ou invalide.');
    console.log('');
    console.log('Pour exécuter la correction automatiquement :');
    console.log('  1. Supabase > Settings > Database > Connection string > URI');
    console.log('  2. Copie l’URL et remplace [YOUR-PASSWORD] par ton mot de passe');
    console.log('  3. Dans backend/.env ajoute : DATABASE_URL=postgresql://...');
    console.log('  4. Relance : npm run fix:impact');
    console.log('');
    console.log('--- Ou exécute ce SQL dans Supabase > SQL Editor > New query ---');
    console.log(SQL);
    console.log('---');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    await client.query(SQL);
    console.log('Colonnes Impact ajoutées à la table users.');
  } catch (e) {
    console.error('Erreur:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runWithPg().catch((e) => {
  if (e.code === 'MODULE_NOT_FOUND' && e.message.includes('pg')) {
    console.log('Le module "pg" est requis. Installe-le avec : npm install pg');
    console.log('');
    console.log('--- En attendant, exécute ce SQL dans Supabase > SQL Editor ---');
    console.log(SQL);
    console.log('---');
    process.exit(1);
  }
  throw e;
});
