/**
 * Widget Notifications intelligentes (remplace le Portefeuille sur le Fil).
 * Connecté à l'API /notifications : likes, commentaires, points Impact, messages, demandes de participation.
 * Même design visuel que l’ancien bloc (carte arrondie, icône cloche, hover).
 */
import { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import './SmartNotificationWidget.css';

export default function SmartNotificationWidget({ hasNew = true }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = () => {
      if (!user) {
        setItems([]);
        return;
      }
      setLoading(true);
      api.notifications
        .list()
        .then((rows) => {
        const mapped = rows.map((n) => {
          const created = n.created_at ? new Date(n.created_at) : null;
          const time = created ? created.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
          let title = 'Notification';
          let subtitle = '';
          switch (n.type) {
            case 'like':
              title = 'Nouveau like';
              subtitle = `${n.payload?.from_user_name || 'Un utilisateur'} a aimé une de vos publications.`;
              break;
            case 'comment':
              title = 'Nouveau commentaire';
              subtitle = `${n.payload?.from_name || 'Un utilisateur'} a commenté : "${n.payload?.text || ''}"`;
              break;
            case 'impact_points':
              title = 'Points Impact gagnés';
              subtitle = `+${n.payload?.pointsAdded || 0} Points Impact (total ${n.payload?.totalPoints || 0}).`;
              break;
            case 'impact_level_up':
              title = 'Niveau Impact augmenté';
              subtitle = `Bravo ! Vous êtes maintenant niveau ${n.payload?.level}.`;
              break;
            case 'message':
              title = 'Nouveau message';
              subtitle = `${n.payload?.from_name || 'Nouveau message'} : "${n.payload?.text || ''}"`;
              break;
            default:
              title = 'Activité récente';
              subtitle = '';
          }
          return {
            id: n.id,
            type: n.type,
            title,
            subtitle,
            time,
            new: !n.is_read,
          };
        });
        setItems(mapped);
      })
        .catch(() => {
          setItems([]);
        })
        .finally(() => setLoading(false));
    };

    load();
  }, [user]);

  const newCount = items.filter((i) => i.new).length;

  return (
    <motion.section
      className="smart-notif-widget"
      initial={false}
      animate={{ boxShadow: expanded ? 'var(--shadow-soft-lg)' : 'var(--shadow-card)' }}
      transition={{ duration: 0.2 }}
      onTap={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      aria-expanded={expanded}
      aria-label="Notifications de proximité"
    >
      <div className="smart-notif-widget__head">
        <div className="smart-notif-widget__icon-wrap">
          <span className="smart-notif-widget__icon">🔔</span>
          {hasNew && newCount > 0 && (
            <span className="smart-notif-widget__badge" aria-hidden="true">
              {newCount}
            </span>
          )}
        </div>
        <div className="smart-notif-widget__title-wrap">
          <h3 className="smart-notif-widget__title">Notifications</h3>
          <p className="smart-notif-widget__subtitle">
            Quêtes proches · Missions · Besoins urgents · Activité locale
          </p>
        </div>
      </div>

      {expanded && (
        <motion.ul
          className="smart-notif-widget__list"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
        >
          {loading && <li className="smart-notif-widget__item">Chargement...</li>}
          {!loading && items.length === 0 && (
            <li className="smart-notif-widget__item">Aucune nouvelle notification.</li>
          )}
          {!loading &&
            items.map((item) => (
              <li key={item.id} className={`smart-notif-widget__item ${item.new ? 'is-new' : ''}`}>
                <div>
                  <strong>{item.title}</strong>
                  <span className="smart-notif-widget__item-sub">{item.subtitle}</span>
                  <span className="smart-notif-widget__item-time">{item.time}</span>
                </div>
              </li>
            ))}
        </motion.ul>
      )}
    </motion.section>
  );
}
