/**
 * Client Supabase pour le projet 1PACT.
 * Utilise les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.
 * Crée un projet sur https://supabase.com et copie .env.example vers .env avec tes clés.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '1PACT Supabase : VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquants. ' +
    'Copie .env.example vers .env et remplis les valeurs depuis ton projet Supabase.'
  );
}

/** Client Supabase (côté navigateur). Utilisable pour Auth, Realtime, Storage, requêtes DB. */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default supabase;
