/**
 * Bloc marque header : logo (poisson avec 1) juste au-dessus du titre 1PACT.
 * Image : public/header-logo.png
 */
export default function HeaderBrand() {
  return (
    <div className="layout-brand">
      <div className="layout-brand-logo-wrap">
        <img
          src="/header-logo.png"
          alt=""
          className="layout-brand-logo layout-brand-photo"
          width="80"
          height="48"
        />
      </div>
      <h1 className="layout-logo">1PACT</h1>
    </div>
  );
}
