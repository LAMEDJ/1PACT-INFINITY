const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'MapPage.jsx');
let text = fs.readFileSync(filePath, 'utf8');

const start = text.indexOf('      <div className="map-page__header map-page__header--float"');
const end = text.indexOf('      {/* Bandeau droit : swipe gauche');
if (start === -1 || end === -1) {
  console.log('Markers not found', start, end);
  process.exit(1);
}

const replacement = `
        <section className="map-controls">
          <h2 className="map-page__title">Carte 1PACT</h2>
          <p className="map-page__desc">
            Explorez les associations et les quêtes près de vous. Approchez d'un point pour déclencher une quête.
          </p>
          <div className="map-page__controls">
            <button
              type="button"
              className="map-page__btn map-page__btn--geo"
              onClick={() => {
                setGeoEnabled((e) => !e);
                if (!geoEnabled) requestLocation();
              }}
            >
              {userPos ? '✓ Position active' : 'Activer ma position'}
            </button>
            <div className="map-page__tile-toggle">
              <button
                type="button"
                className={mapStyle === 'street' ? 'active' : ''}
                onClick={() => setMapStyle('street')}
              >
                Plan
              </button>
              <button
                type="button"
                className={mapStyle === 'satellite' ? 'active' : ''}
                onClick={() => setMapStyle('satellite')}
              >
                Satellite
              </button>
            </div>
          </div>
          {geoError && <p className="map-page__geo-error">{geoError}</p>}
          <p className="map-page__rgpd">
            La position n'est utilisée qu'après activation et sert uniquement aux quêtes et itinéraires sur cette page.
          </p>
        </section>
      </div>
`;

text = text.slice(0, start) + replacement + text.slice(end);

const panelStart = text.indexOf('      {/* Bandeau droit');
const panelEndStr = '    </div>\n  );\n}';
const panelEnd = text.lastIndexOf(panelEndStr);
if (panelStart !== -1 && panelEnd !== -1) {
  text = text.slice(0, panelStart) + text.slice(panelEnd);
}

fs.writeFileSync(filePath, text);
console.log('Done');
