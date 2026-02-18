import React, { useMemo, useState, useEffect, useRef } from "react";

/* ============================= */
/*        IMPACT SYSTEM          */
/* ============================= */

function calculateImpact(userPoints) {
  const badges = [
    { name: "Explorateur", pointsPerLevel: 14, color: "#4CAF50" },
    { name: "Vagabond", pointsPerLevel: 28, color: "#2196F3" },
    { name: "Pirate", pointsPerLevel: 56, color: "#9C27B0" },
    { name: "Guerrier", pointsPerLevel: 112, color: "#FF5722" },
    { name: "Légende", pointsPerLevel: 224, color: "#FFD700" }
  ];

  const levelsPerBadge = 8;

  let remainingPoints = userPoints;
  let badgeIndex = 0;
  let totalLevels = 0;

  while (badgeIndex < badges.length) {
    const pointsPerLevel = badges[badgeIndex].pointsPerLevel;
    const badgeTotal = pointsPerLevel * levelsPerBadge;

    if (remainingPoints >= badgeTotal) {
      remainingPoints -= badgeTotal;
      totalLevels += levelsPerBadge;
      badgeIndex++;
    } else {
      const levelInBadge = Math.floor(remainingPoints / pointsPerLevel);
      const pointsIntoLevel = remainingPoints % pointsPerLevel;

      return {
        badge: badges[badgeIndex].name,
        badgeColor: badges[badgeIndex].color,
        levelInBadge: levelInBadge + 1,
        totalPoints: userPoints,
        pointsRemaining: pointsPerLevel - pointsIntoLevel,
        progressPercent: Math.round((pointsIntoLevel / pointsPerLevel) * 100)
      };
    }
  }

  const last = badges[badges.length - 1];
  return {
    badge: last.name,
    badgeColor: last.color,
    levelInBadge: 8,
    totalPoints: userPoints,
    pointsRemaining: 0,
    progressPercent: 100
  };
}

/* ============================= */
/*        COMPONENT              */
/* ============================= */

function ImpactWidget({ userPoints = 0, className = "" }) {
  const impact = useMemo(() => calculateImpact(userPoints), [userPoints]);
  const [levelUp, setLevelUp] = useState(false);
  const prevLevelRef = useRef({ badge: impact.badge, levelInBadge: impact.levelInBadge });

  useEffect(() => {
    const prev = prevLevelRef.current;
    const leveledUp =
      prev.badge !== impact.badge || prev.levelInBadge !== impact.levelInBadge;
    if (leveledUp && (prev.badge || prev.levelInBadge)) {
      setLevelUp(true);
      const t = setTimeout(() => setLevelUp(false), 800);
      prevLevelRef.current = { badge: impact.badge, levelInBadge: impact.levelInBadge };
      return () => clearTimeout(t);
    }
    prevLevelRef.current = { badge: impact.badge, levelInBadge: impact.levelInBadge };
  }, [impact.badge, impact.levelInBadge]);

  return (
    <div
      className={`impact-widget-nav ${levelUp ? "impact-widget-nav--levelup" : ""} ${className}`.trim()}
      style={styles.container}
    >
      <div style={styles.header}>
        <div style={{
          ...styles.badgeDot,
          backgroundColor: impact.badgeColor
        }} />
        <span style={styles.badgeText}>
          {impact.badge} • Niv. {impact.levelInBadge}
        </span>
      </div>

      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${impact.progressPercent}%`,
            backgroundColor: impact.badgeColor
          }}
        />
      </div>

      <div style={styles.stats}>
        <small>{impact.totalPoints} pts</small>
        <small>{impact.pointsRemaining} restants</small>
      </div>
    </div>
  );
}

export default React.memo(ImpactWidget);

/* ============================= */
/*            STYLES             */
/* ============================= */

const styles = {
  container: {
    marginTop: "12px",
    padding: "14px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    fontSize: "13px"
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "6px"
  },
  badgeDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    marginRight: "8px"
  },
  badgeText: {
    fontWeight: "600"
  },
  progressBar: {
    height: "6px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "6px"
  },
  progressFill: {
    height: "100%",
    transition: "width 0.6s ease"
  },
  stats: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    opacity: "0.8"
  }
};
