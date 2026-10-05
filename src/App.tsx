import { useMemo, useState } from "react";
import { countries, type Country, worldStats } from "./data/world";

function Flag({ country }: { country: Country }) {
  return (
    <span className={`flag flag-${country.id}`} aria-label={`Флаг ${country.name}`}>
      <span className="flag-symbol">{country.flag}</span>
    </span>
  );
}

function Map({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const capitals = [
    { id: "liraniya", x: 126, y: 126 },
    { id: "darvast", x: 372, y: 130 },
    { id: "slavoriya", x: 220, y: 211 },
    { id: "estraviya", x: 272, y: 329 },
    { id: "saverniya", x: 398, y: 278 }
  ];

  return (
    <div className="map-shell">
      <div className="map-toolbar">
        <span>СЕВЕРНЫЙ ОКЕАН</span>
        <span>МАСШТАБ 1 : 18 000 000</span>
      </div>

      <svg className="world-map" viewBox="0 0 520 410" role="img" aria-label="Политическая карта вымышленного мира MarketArena">
        <defs>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity=".38" />
          </filter>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#102c43" />
            <stop offset="100%" stopColor="#071722" />
          </linearGradient>
          <pattern id="map-lines" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M36 0H0V36" fill="none" stroke="#8aa4bd" strokeOpacity=".055" />
          </pattern>
        </defs>

        <rect width="520" height="410" fill="url(#sea)" />
        <rect width="520" height="410" fill="url(#map-lines)" />

        <g className="terrain-labels">
          <text x="32" y="208">ЗАПАДНЫЙ ОКЕАН</text>
          <text x="402" y="208">ВОСТОЧНОЕ МОРЕ</text>
          <text x="238" y="398">ЮЖНОЕ МОРЕ</text>
        </g>

        <path
          d="M55 105 C82 67 126 58 170 74 C208 47 257 55 289 77 C327 51 380 58 418 82 C458 108 478 149 461 189 C449 215 463 244 449 278 C433 318 397 354 353 364 C320 372 291 387 251 376 C218 367 187 381 153 362 C119 344 97 318 91 284 C65 259 48 225 57 191 C44 163 40 133 55 105Z"
          className="land-shadow"
          filter="url(#soft-shadow)"
        />

        {countries.map((country) => (
          <path
            key={country.id}
            d={country.mapPath}
            onClick={() => onSelect(country.id)}
            className={`country-shape ${selected === country.id ? "selected" : ""}`}
            style={{ ["--country" as string]: country.color }}
          />
        ))}

        <g className="mountain-range" aria-label="горный хребет">
          <path d="M292 105 l13 -18 12 18 12 -27 14 27 14 -18 12 18" />
          <path d="M315 151 l12 -20 12 20 12 -25 13 25 13 -16 11 16" />
          <path d="M228 282 l12 -18 12 18 13 -22 13 22 12 -16 13 16" />
        </g>

        <g className="river-lines" aria-label="реки">
          <path d="M327 88 C311 126 304 159 286 190 C270 216 261 242 252 270 C246 288 250 301 260 314" />
          <path d="M331 174 C352 193 363 214 381 232 C397 249 409 263 425 278" />
          <path d="M184 151 C197 170 207 186 221 201 C234 215 242 230 247 247" />
        </g>

        <g className="road-lines">
          <path d="M126 126 C177 151 222 182 282 197 C331 209 366 226 398 278" />
          <path d="M220 211 C238 243 254 279 272 329" />
        </g>

        {capitals.map((capital) => {
          const country = countries.find((item) => item.id === capital.id)!;
          return (
            <g key={capital.id} className="capital-marker" onClick={() => onSelect(capital.id)}>
              <circle cx={capital.x} cy={capital.y} r="8" />
              <circle cx={capital.x} cy={capital.y} r="3" />
              <text x={capital.x + 10} y={capital.y - 8}>{country.capital}</text>
            </g>
          );
        })}

        <g className="port-markers">
          <path d="M86 147v14m-7-8h14" />
          <path d="M438 171v14m-7-8h14" />
          <path d="M328 339v14m-7-8h14" />
          <path d="M157 350v14m-7-8h14" />
        </g>

        <g className="map-compass">
          <circle cx="472" cy="35" r="20" />
          <path d="M472 20v30M457 35h30" />
          <text x="469" y="15">N</text>
        </g>
      </svg>

      <div className="map-legend">
        <span><i className="legend-capital" /> Столица</span>
        <span><i className="legend-port" /> Порт</span>
        <span><i className="legend-mountain" /> Горный хребет</span>
        <span><i className="legend-road" /> Торговый путь</span>
      </div>
    </div>
  );
}

function CountryCard({ country, active, onClick }: { country: Country; active: boolean; onClick: () => void }) {
  return (
    <button className={`country-card ${active ? "active" : ""}`} onClick={onClick}>
      <Flag country={country} />
      <span className="country-main">
        <strong>{country.name}</strong>
        <small>{country.capital} · {country.currencySymbol}</small>
      </span>
      <span className="country-arrow">→</span>
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

        <div className="top-nav">
          <span className="active">Карта</span>
          <span>Биржа</span>
          <span>Портфель</span>
          <span>Компании</span>
          <span>Персонаж</span>
          <span>Задания</span>
          <span>Новости</span>
        </div>

        <div className="top-status">
          <span className="live-dot" />
          ПРОТОТИП
          <span className="divider" />
          МИР <b>2042-A</b>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">GLOBAL ECONOMIC SANDBOX</div>
          <h1>Мир, в котором<br /><span>рынок живёт.</span></h1>
          <p>
            Начни с работы и первых накоплений, выйди на биржу,
            создай капитал и наблюдай, как решения государств,
            компаний и игроков меняют экономику мира.
          </p>

          <div className="mode-switch">
            <button className={mode === "offline" ? "selected" : ""} onClick={() => setMode("offline")}>
              <span>●</span> OFFLINE <small>Своя история</small>
            </button>
            <button className={mode === "online" ? "selected" : ""} onClick={() => setMode("online")}>
              <span>●</span> ONLINE <small>Общий рынок</small>
            </button>
          </div>

          <div className="hero-metrics">
            <div><b>{worldStats.totalCountries}</b><span>стран</span></div>
            <div><b>{worldStats.publicCompanies}</b><span>компаний</span></div>
            <div><b>{worldStats.currencies}</b><span>валют</span></div>
          </div>
        </div>

        <div className="hero-map">
          <Map selected={selected.id} onSelect={setSelectedId} />
        </div>
      </section>

      <section className="country-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">POLITICAL & ECONOMIC MAP</span>
            <h2>Страны мира</h2>
          </div>
          <div className="world-stats">
            <span>Сейчас выбрана <b>{selected.name}</b></span>
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
              <div className="detail-title">
                <Flag country={selected} />
                <div>
                  <span className="eyebrow">MARKET PROFILE</span>
                  <h3>{selected.name}</h3>
                </div>
              </div>
              <span className="large-code">{selected.currencySymbol}</span>
            </div>

            <p className="country-description">{selected.description}</p>

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
              ОТКРЫТЬ РЫНОК {selected.name.toUpperCase()}
              <span>→</span>
            </button>
          </aside>
        </div>
      </section>

      <section className="next-phase">
        <div>
          <span className="eyebrow">NEXT SYSTEM</span>
          <h2>Человек → работа → капитал → рынок</h2>
        </div>
        <div className="phase-cards">
          <article><b>01</b><strong>Жизнь</strong><span>Работа, расходы, образование и подработки.</span></article>
          <article><b>02</b><strong>Биржа</strong><span>Акции, облигации, валюты и реальные рыночные события.</span></article>
          <article><b>03</b><strong>Экономика</strong><span>Сырьё, компании, государства и цепочки поставок.</span></article>
        </div>
      </section>

      <footer>
        <span>MARKETARENA © 2026 · WORLD PROTOTYPE</span>
        <span>Вымышленный мир · Все государства, компании и события созданы для игры.</span>
      </footer>
    </main>
  );
}
