/**
 * Point d’accès unique aux données 1PACT.
 * Si SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis → Supabase (PostgreSQL).
 * Sinon → stockage JSON (fichiers dans data/).
 * Toutes les méthodes exposées sont asynchrones (retournent une Promise).
 */
import { db as jsonDb, initStore as initJsonStore } from './store.js';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseStore } from './store-supabase.js';

function wrapSync(db) {
  const wrap = (obj) => {
    const out = {};
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === 'function') {
        out[k] = (...args) => Promise.resolve(v(...args));
      } else if (v && typeof v === 'object') {
        out[k] = wrap(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  };
  return wrap(db);
}

let db;
let initStoreFn;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim()) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  db = createSupabaseStore(supabase);
  initStoreFn = async () => { /* Supabase : pas de seed automatique, les tables sont créées via la migration SQL */ };
} else {
  db = wrapSync(jsonDb);
  initStoreFn = initJsonStore;
}

export { db, initStoreFn as initStore };
