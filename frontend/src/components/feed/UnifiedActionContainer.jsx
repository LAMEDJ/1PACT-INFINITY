/**
 * Conteneur unifié : sélecteur d'action (Publier / Proposer / Chercher)
 * + panneau déployé dynamiquement selon le mode sélectionné.
 * Animation accordéon smooth (200–300ms), reset automatique des champs au changement de mode.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActionModeSelector from './ActionModeSelector';
import PublishPanel from './PublishPanel';
import ProposePanel from './ProposePanel';
import SearchPanel from './SearchPanel';
import './UnifiedAction.css';

export default function UnifiedActionContainer({
  initialMode = null,
  onSearch,
  onPropose,
  onPublished,
  subscriptionLevel,
  user,
  isAssociation,
  initialSearchQuery = '',
  initialSearchCategory = '',
  initialSearchCategories = [],
  initialSearchPublicCible = '',
  initialSearchTypeRecherche = '',
  initialSearchLocationPlace = '',
  proposalLoading = false,
}) {
  const [actionMode, setActionMode] = useState(initialMode || null);
  const [panelOpen, setPanelOpen] = useState(!!initialMode);

  // Si initialMode est fourni (via navigation state), ouvrir le panneau automatiquement
  useEffect(() => {
    if (initialMode && ['publier', 'proposer', 'chercher'].includes(initialMode)) {
      setActionMode(initialMode);
      setPanelOpen(true);
    }
  }, [initialMode]);

  const handleModeChange = (mode) => {
    if (actionMode === mode && panelOpen) {
      // Fermer si on reclique sur le même mode
      setPanelOpen(false);
      setActionMode(null);
    } else {
      // Ouvrir le nouveau mode
      setActionMode(mode);
      setPanelOpen(true);
    }
  };

  const handlePublished = () => {
    onPublished?.();
    // Optionnel : fermer le panneau après publication
    // setPanelOpen(false);
    // setActionMode(null);
  };

  return (
    <div className="unified-action">
      <ActionModeSelector value={actionMode || ''} onChange={handleModeChange} />
      <AnimatePresence initial={false}>
        {panelOpen && actionMode && (
          <motion.div
            className="unified-action__panel-wrap"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {actionMode === 'publier' && (
              <PublishPanel
                user={user}
                isAssociation={isAssociation}
                onPublished={handlePublished}
              />
            )}
            {actionMode === 'proposer' && (
              <ProposePanel
                onPropose={onPropose}
                subscriptionLevel={subscriptionLevel}
                loading={proposalLoading}
              />
            )}
            {actionMode === 'chercher' && (
              <SearchPanel
                initialQuery={initialSearchQuery}
                initialCategory={initialSearchCategory}
                initialCategories={initialSearchCategories}
                initialPublicCible={initialSearchPublicCible}
                initialTypeRecherche={initialSearchTypeRecherche}
                initialLocationPlace={initialSearchLocationPlace}
                onSearch={onSearch}
                subscriptionLevel={subscriptionLevel}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
