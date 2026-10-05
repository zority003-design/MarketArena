import { useMemo, useState } from "react";
import { countries, type Country, worldStats } from "./data/world";

function Map({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="map-shell">
      <div className="map-grid" />
      <svg className="world-map" viewBox="0 0 430 350" role="img" aria-label="Карта мира MarketArena">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d="M12 176 C44 158 54 120 91 86 C133 47 196 48 232 68 C272 40 332 48 369 81 C405 113 411 163 401 205 C391 247 405 286 370 322 C333 351 275 338 239 325 C199 343 143 339 103 318 C60 296 34 259 26 226 C18 207 3 193 12 176Z" className="continent-outline" />
        {countries.map((country) => (
          <path
            key={country.id}
            d={country.mapPath}
            onClick={() => onSelect(country.id)}
            className={`country-shape ${selected === country.id ? "selected" : ""}`}
            style={{ ["--country" as string]: country.color }}
          />
        ))}
        {countries.map((country, index) => {
          const positions = [
            [151, 151], [294, 144], [213, 259], [91, 260], [337, 263]
          ];
          const [x, y] = positions[index];
          return (
            <g key={country.id} className="capital-marker" onClick={() => onSelect(country.id)}>
              <circle cx={x} cy={y} r="5" />
              <circle cx={x} cy={y} r="11" />
            </g>
          );
        })}
      </svg>
      <div className="map-caption">
        <span>МИР MARKETARENA</span>
        <span>СИМУЛЯЦИЯ · 01 / 05</span>
      </div>
    </div>
  );
}

function CountryCard({ country, active, onClick }: { country: Country; active: boolean; onClick: () => void }) {
  return (
    <button className={`country-card ${active ? "active" : ""}`} onClick={onClick}>
      <span className="country-code" style={{ color: country.color }}>{country.flag}</span>
      <span className="country-main">
        <strong>{country.name}</strong>
        <small>{country.capital} · {country.currencySymbol}</small>
      </span>
      <span className="country-arrow">↗</span>
    </button>
  );
}

export default function App() {
  const [selectedId, setSelectedId] = useState(countries[0].id);
  const [mode, setMode] = useState<"offline" | "online">("offline");

  const selected = useMemo<Country>(
    () => countries.find((country) => country.id === selectedId) ?? countries[0],
    [selectedId]
  );

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">MA</div>
          <div>
            <div className="brand-name">MarketArena</div>
            <div className="brand-sub">ECONOMIC SIMULATION</div>
          </div>
        </div>

        <div className="top-status">
          <span className="live-dot" />
          PROTOTYPE 0.1
          <span className="divider" />
          WORLD SEED <b>2042-A</b>
        </div>

        <button className="settings">⚙</button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">GLOBAL ECONOMIC SANDBOX</div>
          <h1>Твой капитал.<br /><span>Твой рынок.</span><br />Твоя история.</h1>
          <p>
            Выбери страну, начни карьеру, выйди на биржу и наблюдай,
            как решения миллионов участников меняют экономику мира.
          </p>

          <div className="mode-switch">
            <button className={mode === "offline" ? "selected" : ""} onClick={() => setMode("offline")}>
              <span>◉</span>
              OFFLINE
              <small>Песочница</small>
            </button>
            <button className={mode === "online" ? "selected" : ""} onClick={() => setMode("online")}>
              <span>◌</span>
              ONLINE
              <small>Общий мир</small>
            </button>
          </div>
        </div>

        <div className="hero-map">
          <Map selected={selected.id} onSelect={setSelectedId} />
        </div>
      </section>

      <section className="country-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SELECT REGION</span>
            <h2>Выбери рынок</h2>
          </div>
          <div className="world-stats">
            <span><b>{worldStats.totalCountries}</b> стран</span>
            <span><b>{worldStats.publicCompanies}</b> компаний</span>
            <span><b>{worldStats.currencies}</b> валют</span>
          </div>
        </div>

        <div className="country-layout">
          <div className="country-list">
            {countries.map((country) => (
              <CountryCard
                key={country.id}
                country={country}
                active={country.id === selected.id}
                onClick={() => setSelectedId(country.id)}
              />
            ))}
          </div>

          <aside className="country-detail">
            <div className="detail-top">
              <div>
                <span className="eyebrow">MARKET PROFILE</span>
                <h3>{selected.name}</h3>
              </div>
              <span className="large-code" style={{ color: selected.color }}>{selected.flag}</span>
            </div>

            <div className="detail-grid">
              <div><span>СТОЛИЦА</span><b>{selected.capital}</b></div>
              <div><span>ВАЛЮТА</span><b>{selected.currency}</b></div>
              <div><span>БИРЖА</span><b>{selected.exchange}</b></div>
              <div><span>НАСЕЛЕНИЕ</span><b>{selected.population}</b></div>
            </div>

            <div className="sector-box">
              <span>КЛЮЧЕВЫЕ СЕКТОРЫ</span>
              <strong>{selected.economy}</strong>
            </div>

            <button className="continue-button">
              ПРОДОЛЖИТЬ В {selected.name.toUpperCase()}
              <span>→</span>
            </button>
          </aside>
        </div>
      </section>

      <footer>
        <span>MARKETARENA © 2026 · WORLD PROTOTYPE</span>
        <span>Все государства, компании и события вымышлены.</span>
      </footer>
    </main>
  );
}
