/**
 * Système Points Impact + Niveau Impact (backend).
 * - Points Impact : cumul numérique ; +3 toutes les 8 actions validées, +3 à la première inscription.
 * - Niveau Impact : floor(impact_points / 24) + 1. Pas de double attribution.
 */
import { db } from './db.js';

const POINTS_PER_LEVEL = 24;
const BONUS_PER_8_ACTIONS = 3;

/**
 * Compte le nombre d'actions validées pour un utilisateur (likes + commentaires + suivis).
 * @param {number} userId
 * @returns {Promise<number>}
 */
async function countValidActions(userId) {
  const likesCount = db.publicationLikes.countByUser ? await db.publicationLikes.countByUser(userId) : 0;
  const commentsCount = db.publicationComments.countByUser ? await db.publicationComments.countByUser(userId) : 0;
  const followList = await db.follows.getByUser(userId);
  const followsCount = Array.isArray(followList) ? followList.length : 0;
  return likesCount + commentsCount + followsCount;
}

/**
 * Met à jour le système Impact pour un utilisateur (uniquement type user).
 * Compte les actions validées, attribue +3 pts toutes les 8 actions (sans doublon),
 * recalcule le niveau (floor(points/24)+1).
 * @param {number} userId - ID utilisateur (user, pas association)
 * @returns {Promise<{ pointsAdded: number, newLevel: boolean }>}
 */
export async function updateImpactSystem(userId) {
  const user = await db.users.get(userId);
  if (!user) return { pointsAdded: 0, newLevel: false };

  const impactPoints = Math.max(0, user.impact_points ?? 0);
  const lastRewarded = Math.max(0, user.last_rewarded_action_count ?? 0);

  const totalValidActions = await countValidActions(userId);
  const blocksEarned = Math.floor(totalValidActions / 8);
  const blocksAlreadyRewarded = Math.floor(lastRewarded / 8);
  const newBlocks = Math.max(0, blocksEarned - blocksAlreadyRewarded);
  const pointsToAdd = newBlocks * BONUS_PER_8_ACTIONS;

  const newPoints = impactPoints + pointsToAdd;
  const oldLevel = Math.max(1, Math.floor(impactPoints / POINTS_PER_LEVEL) + 1);
  const newLevel = Math.max(1, Math.floor(newPoints / POINTS_PER_LEVEL) + 1);

  const nextLastRewarded = newBlocks > 0 ? totalValidActions : lastRewarded;

  await db.users.update(userId, {
    impact_points: newPoints,
    impact_level: newLevel,
    total_valid_actions: totalValidActions,
    last_rewarded_action_count: nextLastRewarded,
  });

  // Notification Points Impact / niveau
  try {
    if (pointsToAdd > 0) {
      await db.notifications.add({
        user_id: userId,
        association_id: null,
        type: 'impact_points',
        payload: { pointsAdded: pointsToAdd, totalPoints: newPoints },
      });
    }
    if (newLevel > oldLevel) {
      await db.notifications.add({
        user_id: userId,
        association_id: null,
        type: 'impact_level_up',
        payload: { level: newLevel },
      });
    }
  } catch {
    // Les notifications ne doivent pas empêcher l'attribution de points
  }

  return {
    pointsAdded: pointsToAdd,
    newLevel: newLevel > oldLevel,
  };
}

/**
 * Attribue le bonus de première inscription (+3 Points Impact).
 * À appeler une seule fois après création du compte user.
 * @param {number} userId
 */
export async function applyRegistrationBonus(userId) {
  const user = await db.users.get(userId);
  if (!user) return;
  const current = Math.max(0, user.impact_points ?? 0);
  const points = current + 3;
  const level = Math.max(1, Math.floor(points / POINTS_PER_LEVEL) + 1);
  await db.users.update(userId, {
    impact_points: points,
    impact_level: level,
    total_valid_actions: user.total_valid_actions ?? 0,
    last_rewarded_action_count: user.last_rewarded_action_count ?? 0,
  });
}
