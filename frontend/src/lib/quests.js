/**
 * Données des quêtes géolocalisées – Supabase ou mock.
 * Structure prête pour table Supabase avec RLS et RGPD.
 */
import { api } from '../api';
import { supabase } from './supabase';

function normalize(q) {
  return { ...q, id: String(q.id) };
}

/** Rayon par défaut (m) pour déclencher une quête quand le joueur entre dans la zone */
export const DEFAULT_QUEST_RADIUS_M = 50;

/**
 * Schéma Supabase suggéré (à exécuter dans l’éditeur SQL Supabase) :
 *
 * create table if not exists public.quests (
 *   id uuid primary key default gen_random_uuid(),
 *   title text not null,
 *   description text,
 *   lat double precision not null,
 *   lng double precision not null,
 *   radius_m integer default 50,
 *   reward text,
 *   icon_url text,
 *   progression integer default 0,
 *   created_at timestamptz default now(),
 *   updated_at timestamptz default now()
 * );
 * alter table public.quests enable row level security (RLS);
 * create policy "Quests are public read" on public.quests for select using (true);
 * create policy "Only service role can insert/update" on public.quests for all using (false);
 *
 * Pour la progression utilisateur (RGPD) : stocker dans une table user_quest_progress
 * (user_id, quest_id, progress, completed_at) avec RLS par user_id.
 */

/** Quêtes de démo si Supabase non configuré ou table vide */
const MOCK_QUESTS = [
  {
    id: 'q1',
    title: 'Point d’accueil centre-ville',
    description: 'Rendez-vous au kiosque pour valider la quête.',
    lat: 46.603354,
    lng: 2.381132,
    radius_m: 50,
    reward: 'Badge Explorateur',
    icon_url: '',
    progression: 0,
  },
  {
    id: 'q2',
    title: 'Parc des associations',
    description: 'Trouvez le totem 1PACT dans le parc.',
    lat: 46.612,
    lng: 2.39,
    radius_m: 80,
    reward: '100 points',
    icon_url: '',
    progression: 0,
  },
  {
    id: 'q3',
    title: 'Gare – stand partenaire',
    description: 'Scannez le QR code au stand.',
    lat: 46.598,
    lng: 2.375,
    radius_m: 50,
    reward: 'Badge Voyageur',
    icon_url: '',
    progression: 0,
  },
];

/**
 * Récupère la liste des quêtes : API backend → Supabase → mock.
 * @returns {Promise<Array<{ id: string, title: string, ... }>>}
 */
export async function getQuests() {
  try {
    const data = await api.quests.list();
    if (data && data.length > 0) return data.map(normalize);
  } catch (_) {}
  if (supabase) {
    const { data, error } = await supabase
      .from('quests')
      .select('id, title, description, lat, lng, radius_m, reward, icon_url, progression')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data.map(normalize);
  }
  // En production : ne pas afficher de données fictives si l'API/Supabase n'a rien renvoyé
  if (import.meta.env.PROD) return [];
  return MOCK_QUESTS;
}
