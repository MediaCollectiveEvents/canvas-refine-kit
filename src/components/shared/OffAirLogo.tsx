import logo from '@/assets/off-air-logo-transparent.png';
// The viewBox removes empty canvas around the supplied artwork, with space around every chrome edge.
// Layout stays proportional at narrow widths; no absolute image offsets or overflow clipping.
export default function OffAirLogo(){return <svg role="img" aria-label="OFF AIR" viewBox="24 60 439 200" width="439" height="200" preserveAspectRatio="xMidYMid meet" className="block h-auto w-full overflow-visible"><image href={logo} width="487" height="325"/></svg>;}
