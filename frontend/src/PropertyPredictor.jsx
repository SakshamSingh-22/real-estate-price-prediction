import { useState, useRef, useEffect } from 'react';
import './propertypredictor.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/predict';

const BANGALORE_LOCALITIES = [
  { name: 'Central Bangalore (Indiranagar, MG Road)', lat: 12.9723, lon: 77.5962, tier: 'Premium' },
  { name: 'Koramangala & HSR Layout', lat: 12.9277, lon: 77.6193, tier: 'Premium' },
  { name: 'Hebbal & Manyata Tech Park', lat: 13.0435, lon: 77.5897, tier: 'Mid' },
  { name: 'Jayanagar & JP Nagar', lat: 12.9072, lon: 77.5809, tier: 'Mid' },
  { name: 'Malleshwaram & Rajajinagar', lat: 12.978, lon: 77.5368, tier: 'Mid' },
  { name: 'Whitefield & ITPL', lat: 12.984, lon: 77.7189, tier: 'Mid' },
  { name: 'Sarjapur Road & Bellandur', lat: 12.9325, lon: 77.6899, tier: 'Mid' },
  { name: 'Kalyan Nagar & HRBR Layout', lat: 13.058, lon: 77.6571, tier: 'Mid' },
  { name: 'Rajarajeshwari Nagar & Kengeri', lat: 12.915, lon: 77.5232, tier: 'Mid' },
  { name: 'Bannerghatta Road', lat: 12.8432, lon: 77.5856, tier: 'Budget' },
  { name: 'Electronic City', lat: 12.8566, lon: 77.6685, tier: 'Budget' },
  { name: 'Yelahanka & Airport Road', lat: 13.1359, lon: 77.5908, tier: 'Budget' },
];

const FURNISHING_OPTIONS = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];

const INITIAL_FORM = {
  BHK: 3,
  Bathrooms: 2,
  Super_Area_sqft: '1200',
  Floor_No: '5',
  Total_Floors: '12',
  Property_Age_years: '5',
  Parking: 1,
  Furnishing: 'Semi-Furnished',
  Lift: 1,
  Gated_Society: 1,
  Distance_to_Metro_km: '1.5',
  Nearby_School_km: '2.0',
  Nearby_Hospital_km: '1.8',
};

/* ---------- icons (inline SVG, no dependency) ---------- */

const ICON_PATHS = {
  building: (
    <>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  home: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </>
  ),
  layers: (
    <>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12Z" />
    </>
  ),
  bed: (
    <>
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </>
  ),
  bath: (
    <>
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <path d="M2 12h20" />
      <path d="M7 19v2M17 19v2" />
    </>
  ),
  ruler: (
    <>
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  sofa: (
    <>
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
      <path d="M4 18v2M20 18v2M12 4v9" />
    </>
  ),
  car: (
    <>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  lift: (
    <>
      <path d="m21 16-4 4-4-4" />
      <path d="M17 20V4" />
      <path d="m3 8 4-4 4 4" />
      <path d="M7 4v16" />
    </>
  ),
  shield: (
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  ),
  train: (
    <>
      <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1" />
      <path d="m9 15-1-1M15 15l1-1" />
      <path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z" />
      <path d="m8 19-2 3M16 19l2 3" />
    </>
  ),
  school: (
    <>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </>
  ),
  hospital: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  rupee: (
    <>
      <path d="M6 3h12M6 8h12" />
      <path d="m6 13 8.5 8" />
      <path d="M6 13h3" />
      <path d="M9 13c6.667 0 6.667-10 0-10" />
    </>
  ),
  trend: (
    <>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </>
  ),
  reset: (
    <>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
};

function Icon({ name, size = 18, className = '' }) {
  return (
    <svg
      className={`pp-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/* ---------- backdrop (morning Bengaluru skyline) ---------- */

// Deterministic pseudo-random so the artwork never changes between renders
const seeded = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
};

function makeSkyline(seed, minW, maxW, minH, maxH) {
  const rnd = seeded(seed);
  const out = [];
  let x = -20;
  while (x < 1460) {
    const w = minW + rnd() * (maxW - minW);
    const h = minH + rnd() * (maxH - minH);
    out.push({ x, w, h });
    x += w + 2 + rnd() * 6;
  }
  return out;
}

function makeTrees(seed) {
  const rnd = seeded(seed);
  const out = [];
  let x = -10;
  while (x < 1460) {
    const r = 12 + rnd() * 16;
    out.push({ cx: x, r });
    x += r * 1.1 + rnd() * 10;
  }
  return out;
}

const VB_H = 300;
const SKY_FAR = makeSkyline(7, 36, 80, 90, 230);
const SKY_NEAR = makeSkyline(13, 44, 96, 50, 170);
const TREES_BACK = makeTrees(41);
const TREES_FRONT = makeTrees(29);
const CRANES = [300, 1400];

function Crane({ x }) {
  const top = 70;
  return (
    <g className="pp-crane">
      <path d={`M${x} ${VB_H} V${top}`} />
      <path d={`M${x - 44} ${top} H${x + 118}`} />
      <path d={`M${x - 7} ${top} L${x} ${top - 26} L${x + 7} ${top}`} />
      <path d={`M${x} ${top - 26} L${x + 118} ${top} M${x} ${top - 26} L${x - 44} ${top}`} />
      <path d={`M${x + 86} ${top} V${top + 46}`} />
      <rect x={x - 54} y={top - 2} width="12" height="10" />
    </g>
  );
}

/* Vidhana Soudha, Bengaluru's state legislature: central dome, portico, flanking wings */
function VidhanaSoudha({ cx }) {
  const b = VB_H;
  const columns = Array.from({ length: 9 }, (_, i) => cx - 50 + i * 12.5);
  const wingWindows = Array.from({ length: 5 }, (_, i) => i * 11);
  return (
    <g className="pp-landmark">
      <rect x={cx - 150} y={b - 62} width="300" height="62" />
      <rect x={cx - 150} y={b - 70} width="62" height="8" />
      <rect x={cx + 88} y={b - 70} width="62" height="8" />
      <rect x={cx - 58} y={b - 92} width="116" height="30" />
      <path d={`M${cx - 64} ${b - 92} L${cx} ${b - 110} L${cx + 64} ${b - 92} Z`} />
      <rect x={cx - 26} y={b - 128} width="52" height="22" />
      <path d={`M${cx - 30} ${b - 128} A30 26 0 0 1 ${cx + 30} ${b - 128} Z`} />
      <rect x={cx - 1.5} y={b - 186} width="3" height="32" />
      {[-104, 104].map((dx) => (
        <g key={dx}>
          <rect x={cx + dx - 11} y={b - 84} width="22" height="14" />
          <path d={`M${cx + dx - 12} ${b - 84} A12 11 0 0 1 ${cx + dx + 12} ${b - 84} Z`} />
        </g>
      ))}
      <g className="pp-landmark-detail">
        {columns.map((x) => (
          <rect key={x} x={x} y={b - 90} width="4" height="28" />
        ))}
        {wingWindows.map((dx) => (
          <rect key={`l${dx}`} x={cx - 140 + dx} y={b - 52} width="6" height="16" />
        ))}
        {wingWindows.map((dx) => (
          <rect key={`r${dx}`} x={cx + 90 + dx} y={b - 52} width="6" height="16" />
        ))}
      </g>
    </g>
  );
}

/* Namma Metro: elevated viaduct with a purple-line train */
function Metro() {
  const deckY = VB_H - 70;
  const pillars = Array.from({ length: 7 }, (_, i) => -10 + i * 80);
  return (
    <g>
      <rect className="pp-viaduct" x="-20" y={deckY} width="520" height="7" />
      {pillars.map((x) => (
        <rect key={x} className="pp-viaduct" x={x} y={deckY + 7} width="7" height="63" />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect className="pp-train" x={30 + i * 84} y={deckY - 22} width="80" height="21" rx="5" />
          <rect className="pp-train-win" x={38 + i * 84} y={deckY - 17} width="64" height="6" rx="2" />
        </g>
      ))}
    </g>
  );
}

/* Fixed full-page backdrop: morning sky, clouds and the Bengaluru skyline */
function Scene() {
  return (
    <div className="pp-scene" aria-hidden="true">
      <div className="pp-hero-photo" />
      <div className="pp-cloud pp-cloud-a" />
      <div className="pp-cloud pp-cloud-b" />
      <div className="pp-cloud pp-cloud-c" />
      <svg
        className="pp-skyline"
        viewBox={`0 0 1440 ${VB_H}`}
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
      >
        <defs>
          <pattern id="pp-win-a" width="14" height="18" patternUnits="userSpaceOnUse">
            <rect x="4" y="5" width="4" height="7" rx="0.8" className="pp-window-a" />
          </pattern>
          <pattern id="pp-win-b" width="22" height="26" patternUnits="userSpaceOnUse">
            <rect x="9" y="8" width="4" height="7" rx="0.8" className="pp-window-b" />
          </pattern>
        </defs>

        <g className="pp-sky-far">
          {SKY_FAR.map((b, i) => (
            <rect key={i} x={b.x} y={VB_H - b.h} width={b.w} height={b.h} />
          ))}
        </g>

        {CRANES.map((x) => (
          <Crane key={x} x={x} />
        ))}

        <g className="pp-sky-near">
          {SKY_NEAR.map((b, i) => (
            <rect key={i} x={b.x} y={VB_H - b.h} width={b.w} height={b.h} />
          ))}
        </g>
        <g fill="url(#pp-win-a)">
          {SKY_NEAR.map((b, i) => (
            <rect key={i} x={b.x} y={VB_H - b.h} width={b.w} height={b.h} />
          ))}
        </g>
        <g fill="url(#pp-win-b)">
          {SKY_NEAR.map((b, i) => (
            <rect key={i} x={b.x} y={VB_H - b.h} width={b.w} height={b.h} />
          ))}
        </g>

        <Metro />
        <VidhanaSoudha cx={1180} />

        <g className="pp-trees-back">
          {TREES_BACK.map((t, i) => (
            <circle key={i} cx={t.cx} cy={VB_H - t.r * 0.95} r={t.r} />
          ))}
        </g>
        <g className="pp-trees">
          {TREES_FRONT.map((t, i) => (
            <circle key={i} cx={t.cx} cy={VB_H - t.r * 0.45} r={t.r} />
          ))}
        </g>
      </svg>
    </div>
  );
}

function HeroHeader() {
  return (
    <header className="pp-hero">
      <div className="pp-hero-inner">
        <span className="pp-logo">
          <Icon name="building" size={26} />
        </span>
        <div>
          <h1>Bengaluru Property Price Estimator</h1>
          <p>Describe the property and get an indicative market value.</p>
          <span className="pp-pill">
            <Icon name="pin" size={14} />
            Covers {BANGALORE_LOCALITIES.length} localities across the city
          </span>
        </div>
      </div>
    </header>
  );
}

/* ---------- helpers ---------- */

const toNum = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));

function formatPriceShort(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} Lakh`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function validate(f) {
  const errors = {};
  const check = (key, label, { min, max, integer = false }) => {
    const n = toNum(f[key]);
    if (Number.isNaN(n)) errors[key] = `${label} is required.`;
    else if (integer && !Number.isInteger(n)) errors[key] = `${label} must be a whole number.`;
    else if (n < min) errors[key] = `${label} must be at least ${min}.`;
    else if (n > max) errors[key] = `${label} must be at most ${max}.`;
  };

  check('BHK', 'BHK', { min: 1, max: 10, integer: true });
  check('Bathrooms', 'Bathrooms', { min: 1, max: 10, integer: true });
  check('Super_Area_sqft', 'Super area', { min: 100, max: 20000 });
  check('Property_Age_years', 'Property age', { min: 0, max: 100 });
  check('Total_Floors', 'Total floors', { min: 1, max: 100, integer: true });
  check('Floor_No', 'Floor number', { min: 0, max: 100, integer: true });
  check('Distance_to_Metro_km', 'Metro distance', { min: 0, max: 50 });
  check('Nearby_School_km', 'School distance', { min: 0, max: 50 });
  check('Nearby_Hospital_km', 'Hospital distance', { min: 0, max: 50 });

  if (!errors.Floor_No && !errors.Total_Floors && toNum(f.Floor_No) > toNum(f.Total_Floors)) {
    errors.Floor_No = `Floor (${f.Floor_No}) can't be above the building's total floors (${f.Total_Floors}).`;
  }
  return errors;
}

/* ---------- small UI pieces (defined outside to keep input focus stable) ---------- */

function Section({ title, icon, children }) {
  return (
    <fieldset className="pp-section">
      <legend>
        {icon && <Icon name={icon} size={16} />}
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, icon, htmlFor, hint, error, children }) {
  return (
    <div className={`pp-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={htmlFor}>
        {icon && <Icon name={icon} size={16} />}
        {label}
      </label>
      {children}
      {error ? (
        <p className="pp-field-msg pp-field-error" role="alert">{error}</p>
      ) : hint ? (
        <p className="pp-field-msg">{hint}</p>
      ) : null}
    </div>
  );
}

function NumberField({ id, label, icon, unit, hint, error, value, onChange, ...rest }) {
  return (
    <Field label={label} icon={icon} htmlFor={id} hint={hint} error={error}>
      <div className="pp-input-wrap">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          {...rest}
        />
        {unit && <span className="pp-unit">{unit}</span>}
      </div>
    </Field>
  );
}

function Stepper({ id, label, icon, value, min = 1, max = 10, onChange }) {
  const n = Number(value) || min;
  return (
    <Field label={label} icon={icon} htmlFor={id}>
      <div className="pp-stepper">
        <button type="button" onClick={() => onChange(Math.max(min, n - 1))} disabled={n <= min} aria-label={`Decrease ${label}`}>
          −
        </button>
        <output id={id} aria-live="polite">{n}</output>
        <button type="button" onClick={() => onChange(Math.min(max, n + 1))} disabled={n >= max} aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
    </Field>
  );
}

function Segmented({ label, icon, options, value, onChange }) {
  return (
    <Field label={label} icon={icon}>
      <div className="pp-segmented" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            className={value === opt ? 'active' : ''}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </Field>
  );
}

function Toggle({ label, icon, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`pp-toggle ${checked ? 'on' : ''}`}
      onClick={() => onChange(checked ? 0 : 1)}
    >
      <span className="pp-toggle-label">
        {icon && <Icon name={icon} size={17} />}
        {label}
      </span>
      <span className="pp-toggle-track" aria-hidden="true">
        <span className="pp-toggle-thumb" />
      </span>
    </button>
  );
}

/* ---------- main component ---------- */

export default function PropertyPredictor() {
  const [selectedLocality, setSelectedLocality] = useState(BANGALORE_LOCALITIES[0]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [lastInput, setLastInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    if (predictedPrice !== null && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [predictedPrice]);

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    if (errorMsg) setErrorMsg('');
  };

  const handleLocalityChange = (e) => {
    const loc = BANGALORE_LOCALITIES.find((l) => l.name === e.target.value);
    if (loc) setSelectedLocality(loc);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setSelectedLocality(BANGALORE_LOCALITIES[0]);
    setFieldErrors({});
    setErrorMsg('');
    setPredictedPrice(null);
    setLastInput(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please fix the highlighted fields and try again.');
      setPredictedPrice(null);
      return;
    }

    setFieldErrors({});
    setErrorMsg('');
    setLoading(true);

    const payload = {
      latitude: selectedLocality.lat,
      longitude: selectedLocality.lon,
      Locality_Tier: selectedLocality.tier,
      BHK: toNum(formData.BHK),
      Bathrooms: toNum(formData.Bathrooms),
      Super_Area_sqft: toNum(formData.Super_Area_sqft),
      Floor_No: toNum(formData.Floor_No),
      Total_Floors: toNum(formData.Total_Floors),
      Property_Age_years: toNum(formData.Property_Age_years),
      Parking: toNum(formData.Parking),
      Furnishing: formData.Furnishing,
      Lift: toNum(formData.Lift),
      Gated_Society: toNum(formData.Gated_Society),
      Distance_to_Metro_km: toNum(formData.Distance_to_Metro_km),
      Nearby_School_km: toNum(formData.Nearby_School_km),
      Nearby_Hospital_km: toNum(formData.Nearby_Hospital_km),
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        /* non-JSON response, handled below */
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server responded with status ${response.status}.`);
      }
      if (typeof data?.predicted_price !== 'number' || Number.isNaN(data.predicted_price)) {
        throw new Error('The server returned an unexpected response.');
      }

      setPredictedPrice(data.predicted_price);
      setLastInput({
        locality: selectedLocality.name,
        tier: selectedLocality.tier,
        bhk: payload.BHK,
        area: payload.Super_Area_sqft,
      });
    } catch (err) {
      setPredictedPrice(null);
      setErrorMsg(
        err instanceof TypeError
          ? "Couldn't reach the prediction server. Check that the backend is running and try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const f = formData;
  const area = toNum(f.Super_Area_sqft);
  const sliderValue = Number.isNaN(area) ? 1200 : Math.min(5000, Math.max(300, area));

  return (
    <main className="pp-page">
      <Scene />
      <HeroHeader />

      <div className="pp-card">
        {errorMsg && (
          <div className="pp-alert" role="alert">
            <Icon name="alert" size={18} />
            <span>
              <strong>Something's off.</strong> {errorMsg}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Section title="Location" icon="pin">
            <Field label="Locality" icon="pin" htmlFor="locality">
              <select id="locality" value={selectedLocality.name} onChange={handleLocalityChange}>
                {BANGALORE_LOCALITIES.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <span className={`pp-tier pp-tier-${selectedLocality.tier.toLowerCase()}`}>
                {selectedLocality.tier} tier
              </span>
            </Field>
          </Section>

          <Section title="Property" icon="home">
            <div className="pp-grid">
              <Stepper id="bhk" label="BHK" icon="bed" value={f.BHK} onChange={(v) => setField('BHK', v)} />
              <Stepper id="bath" label="Bathrooms" icon="bath" value={f.Bathrooms} onChange={(v) => setField('Bathrooms', v)} />
            </div>

            <NumberField
              id="area"
              label="Super area"
              icon="ruler"
              unit="sq ft"
              min="100"
              step="10"
              value={f.Super_Area_sqft}
              error={fieldErrors.Super_Area_sqft}
              onChange={(v) => setField('Super_Area_sqft', v)}
            />
            <input
              className="pp-slider"
              type="range"
              min="300"
              max="5000"
              step="50"
              value={sliderValue}
              onChange={(e) => setField('Super_Area_sqft', e.target.value)}
              aria-label="Super area slider"
            />

            <div className="pp-grid">
              <NumberField
                id="age"
                label="Property age"
                icon="calendar"
                unit="years"
                min="0"
                value={f.Property_Age_years}
                error={fieldErrors.Property_Age_years}
                onChange={(v) => setField('Property_Age_years', v)}
              />
              <div />
            </div>

            <Segmented
              label="Furnishing"
              icon="sofa"
              options={FURNISHING_OPTIONS}
              value={f.Furnishing}
              onChange={(v) => setField('Furnishing', v)}
            />
          </Section>

          <Section title="Building" icon="building">
            <div className="pp-grid">
              <NumberField
                id="floor"
                label="Floor number"
                icon="layers"
                hint="0 = ground floor"
                min="0"
                value={f.Floor_No}
                error={fieldErrors.Floor_No}
                onChange={(v) => setField('Floor_No', v)}
              />
              <NumberField
                id="total-floors"
                label="Total floors"
                icon="building"
                min="1"
                value={f.Total_Floors}
                error={fieldErrors.Total_Floors}
                onChange={(v) => setField('Total_Floors', v)}
              />
            </div>
            <div className="pp-toggles">
              <Toggle label="Parking" icon="car" checked={!!Number(f.Parking)} onChange={(v) => setField('Parking', v)} />
              <Toggle label="Lift" icon="lift" checked={!!Number(f.Lift)} onChange={(v) => setField('Lift', v)} />
              <Toggle label="Gated society" icon="shield" checked={!!Number(f.Gated_Society)} onChange={(v) => setField('Gated_Society', v)} />
            </div>
          </Section>

          <Section title="Nearby" icon="compass">
            <div className="pp-grid pp-grid-3">
              <NumberField
                id="metro"
                label="Metro"
                icon="train"
                unit="km"
                step="0.1"
                min="0"
                value={f.Distance_to_Metro_km}
                error={fieldErrors.Distance_to_Metro_km}
                onChange={(v) => setField('Distance_to_Metro_km', v)}
              />
              <NumberField
                id="school"
                label="School"
                icon="school"
                unit="km"
                step="0.1"
                min="0"
                value={f.Nearby_School_km}
                error={fieldErrors.Nearby_School_km}
                onChange={(v) => setField('Nearby_School_km', v)}
              />
              <NumberField
                id="hospital"
                label="Hospital"
                icon="hospital"
                unit="km"
                step="0.1"
                min="0"
                value={f.Nearby_Hospital_km}
                error={fieldErrors.Nearby_Hospital_km}
                onChange={(v) => setField('Nearby_Hospital_km', v)}
              />
            </div>
          </Section>

          <div className="pp-actions">
            <button type="button" className="pp-btn pp-btn-ghost" onClick={handleReset} disabled={loading}>
              <Icon name="reset" size={17} /> Reset
            </button>
            <button type="submit" className="pp-btn pp-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="pp-spinner" aria-hidden="true" /> Calculating…
                </>
              ) : (
                <>
                  <Icon name="trend" size={19} /> Get estimated price
                </>
              )}
            </button>
          </div>
        </form>

        <div aria-live="polite" ref={resultRef}>
          {predictedPrice !== null && lastInput && (
            <section className="pp-result">
              <p className="pp-result-label">
                <Icon name="trend" size={15} /> Estimated market value
              </p>
              <p className="pp-result-price">{formatPriceShort(predictedPrice)}</p>
              <p className="pp-result-full">₹{Math.round(predictedPrice).toLocaleString('en-IN')}</p>

              <dl className="pp-result-stats">
                <div>
                  <dt>
                    <Icon name="rupee" size={14} /> Rate
                  </dt>
                  <dd>₹{Math.round(predictedPrice / lastInput.area).toLocaleString('en-IN')} / sq ft</dd>
                </div>
                <div>
                  <dt>
                    <Icon name="home" size={14} /> Property
                  </dt>
                  <dd>
                    {lastInput.bhk} BHK · {lastInput.area.toLocaleString('en-IN')} sq ft
                  </dd>
                </div>
                <div>
                  <dt>
                    <Icon name="pin" size={14} /> Locality
                  </dt>
                  <dd>{lastInput.locality}</dd>
                </div>
              </dl>

              <p className="pp-disclaimer">
                <Icon name="info" size={14} />
                <span>
                  This is a model-based estimate for guidance only, not a valuation. Actual prices vary with
                  negotiation, exact micro-location and property condition.
                </span>
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}