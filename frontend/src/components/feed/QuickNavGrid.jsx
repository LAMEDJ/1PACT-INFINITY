/**
 * Grille d’accès rapides (Carte, Fil, Messages, Profil) – transférée depuis Accueil.
 * Reçu en props : onGoToPage(index) pour la navigation dans le carrousel (0=Accueil, 1=Carte, 2=Fil, 3=Messages, 4=Profil).
 */
import './QuickNavGrid.css';

const ITEMS = [
  { index: 1, icon: '🗺️', label: 'Carte', desc: 'Associations près de toi', ariaLabel: 'Ouvrir la carte des associations' },
  { index: 2, icon: '📰', label: 'Fil', desc: 'Publications et actualités', ariaLabel: 'Ouvrir le fil d\'actualité' },
  { index: 3, icon: '💬', label: 'Messages', desc: 'Contacter les associations', ariaLabel: 'Ouvrir la messagerie' },
  { index: 4, icon: '👤', label: 'Profil', desc: 'Mon compte et mes suivis', ariaLabel: 'Ouvrir mon profil' },
];

export default function QuickNavGrid({ onGoToPage }) {
  const goTo = (index) => {
    if (typeof onGoToPage === 'function') onGoToPage(index);
  };

  return (
    <section className="quick-nav" aria-label="Accès rapides">
      <h3 className="quick-nav__title">Explorer</h3>
      <div className="quick-nav__grid">
        {ITEMS.map((item) => (
          <button
            key={item.index}
            type="button"
            className="quick-nav__card"
            onClick={() => goTo(item.index)}
            aria-label={item.ariaLabel}
          >
            <span className="quick-nav__icon">{item.icon}</span>
            <span className="quick-nav__label">{item.label}</span>
            <span className="quick-nav__desc">{item.desc}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
