/**
 * Aperçu « Quêtes à proximité » – transféré depuis Accueil.
 * Charge les quêtes via getQuests(), affiche les 3 premières.
 */
import { useState, useEffect } from 'react';
import { getQuests } from '../../lib/quests';
import './QuestsPreviewWidget.css';

export default function QuestsPreviewWidget({ onGoToPage }) {
  const [quests, setQuests] = useState([]);

  useEffect(() => {
    getQuests()
      .then((data) => setQuests(data.slice(0, 3)))
      .catch(() => setQuests([]));
  }, []);

  const goToMap = () => {
    if (typeof onGoToPage === 'function') onGoToPage(1);
  };

  if (quests.length === 0) return null;

  return (
    <section className="quests-preview" aria-label="Quêtes à découvrir">
      <h3 className="quests-preview__title">Quêtes à proximité</h3>
      <ul className="quests-preview__list">
        {quests.map((q) => (
          <li key={q.id} className="quests-preview__item">
            <span className="quests-preview__icon">🎯</span>
            <div className="quests-preview__text">
              <strong>{q.title}</strong>
              {q.reward && (
                <span className="quests-preview__reward">{q.reward}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="quests-preview__cta"
        onClick={goToMap}
      >
        Voir sur la carte
      </button>
    </section>
  );
}
