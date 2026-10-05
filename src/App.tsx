import { useMemo, useState } from "react";
import { countries, difficultyLevels, type Country } from "./data/world";

type Screen = "auth" | "mode" | "country" | "difficulty" | "game";
type GameTab = "overview" | "exchange" | "portfolio" | "companies" | "life" | "map" | "news";

const jobs = [
  { id: "analyst", title: "Помощник аналитика", pay: 18000, time: "2 часа", text: "Разбирай отчёты компаний и получай оплату за точность." },
  { id: "logistics", title: "Курьер / логистика", pay: 12500, time: "3 часа", text: "Стабильная работа с невысоким риском и понятным доходом." },
  { id: "freelance", title: "Фриланс-специалист", pay: 24000, time: "4 часа", text: "Больше доход, но спрос зависит от состояния экономики." }
];

function Flag({ country }: { country: Country }) {
  return <span className={`flag flag-${country.id}`} aria-label={`Флаг ${country.name}`}><i /></span>;
}

function AtlasMap({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="atlas">
      <div className="atlas-head">
        <span>ЭКОНОМИЧЕСКАЯ КАРТА</span>
        <span>СЕВЕР ↑</span>
      </div>
      <svg viewBox="0 0 520 350" className="atlas-svg" role="img" aria-label="Карта экономических регионов">
        <defs>
          <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#122b3a" />
            <stop offset="1" stopColor="#08151f" />
          </linearGradient>
          <pattern id="graticule" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M34 0H0V34" fill="none" stroke="#b4c8d4" strokeOpacity=".06" />
          </pattern>
        </defs>
        <rect width="520" height="350" fill="url(#ocean)" />
        <rect width="520" height="350" fill="url(#graticule)" />
        <path className="continent-shadow" d="M43 91 C70 54 116 47 157 59 C196 40 244 48 278 67 C318 42 374 51 412 73 C455 99 478 139 464 179 C480 210 462 247 438 274 C404 313 352 323 310 307 C274 334 224 325 190 305 C151 314 109 293 95 260 C59 246 43 212 54 181 C31 151 27 117 43 91Z" />
        <path className="coastline" d="M43 91 C70 54 116 47 157 59 C196 40 244 48 278 67 C318 42 374 51 412 73 C455 99 478 139 464 179 C480 210 462 247 438 274 C404 313 352 323 310 307 C274 334 224 325 190 305 C151 314 109 293 95 260 C59 246 43 212 54 181 C31 151 27 117 43 91Z" />
        {countries.map(c => (
          <path
            key={c.id}
            d={c.mapPath}
            className={`atlas-country ${selected === c.id ? "selected" : ""}`}
            style={{ fill: c.color }}
            onClick={() => onSelect(c.id)}
          />
        ))}
        <path className="mountains" d="M145 93 l12 -18 12 18 13 -25 13 25 12 -16 13 16 M283 91 l12 -19 12 19 13 -27 14 27 13 -17 12 17 M177 230 l12 -18 12 18 13 -25 13 25 12 -16 13 16" />
        <path className="river" d="M265 64 C253 100 260 127 245 158 C232 183 225 202 231 226 C236 243 248 257 260 270 M302 122 C326 143 333 165 350 183 C366 200 381 211 403 222" />
        <path className="trade-route" d="M111 123 C163 139 205 154 252 190 C278 209 301 220 328 222 C352 222 378 211 409 191" />
        {countries.map(c => (
          <g key={c.id} className="capital" onClick={() => onSelect(c.id)}>
            <circle cx={c.capitalX} cy={c.capitalY} r="5" />
            <circle cx={c.capitalX} cy={c.capitalY} r="2" />
            <text x={c.capitalX + 8} y={c.capitalY - 7}>{c.capital}</text>
          </g>
        ))}
        <text className="sea-label" x="18" y="190">ЗАПАДНОЕ МОРЕ</text>
        <text className="sea-label" x="390" y="170">ВОСТОЧНОЕ МОРЕ</text>
        <text className="sea-label" x="229" y="338">ЮЖНОЕ МОРЕ</text>
        <g className="compass"><circle cx="478" cy="31" r="18" /><text x="475" y="17">N</text><path d="M478 20V42M467 31H489" /></g>
      </svg>
      <div className="map-key"><span><b className="dot" /> столица</span><span><b className="line" /> торговый маршрут</span><span><b className="mount" /> горы</span></div>
    </div>
  );
}

function AuthScreen({ onContinue }: { onContinue: (name: string) => void }) {
  const [name, setName] = useState("");
  const [register, setRegister] = useState(true);
  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="brand large"><div className="brand-mark">MA</div><div><b>MarketArena</b><small>ECONOMIC LIFE & MARKET SIMULATOR</small></div></div>
        <div className="auth-copy">
          <span className="eyebrow">НАЧАЛО ИГРЫ</span>
          <h1>Построй капитал<br /><em>с нуля.</em></h1>
          <p>Начни с профессии, зарплаты и первых накоплений. Затем выходи на рынок, покупай компании и принимай решения, которые меняют твою финансовую историю.</p>
        </div>
        <div className="auth-tabs"><button className={register ? "active" : ""} onClick={() => setRegister(true)}>Регистрация</button><button className={!register ? "active" : ""} onClick={() => setRegister(false)}>Войти</button></div>
        <label className="field"><span>{register ? "Имя игрока" : "Имя игрока / логин"}</span><input value={name} onChange={e => setName(e.target.value)} placeholder="Например, Алексей" /></label>
        <button className="primary" disabled={!name.trim()} onClick={() => onContinue(name.trim())}>{register ? "Создать профиль" : "Продолжить"} <b>→</b></button>
        <div className="auth-note">Офлайн-профиль хранится локально в браузере. Сетевая регистрация будет добавлена вместе с Online.</div>
      </div>
      <div className="auth-art">
        <div className="terminal-window">
          <div className="terminal-top"><span>MARKET / OPEN</span><span>OFFLINE</span></div>
          <div className="terminal-chart"><svg viewBox="0 0 500 220"><path d="M0 182 L52 174 L82 185 L126 142 L165 157 L203 113 L246 129 L289 91 L330 105 L365 66 L411 81 L454 42 L500 54" /><path d="M0 205H500M0 160H500M0 115H500M0 70H500M0 25H500" className="grid-line" /></svg></div>
          <div className="terminal-stats"><span><b>₽ 500 000</b><small>СТАРТОВЫЙ КАПИТАЛ</small></span><span><b>3</b><small>ПУТИ ЗАРАБОТКА</small></span><span><b>6</b><small>СТРАН НА КАРТЕ</small></span></div>
        </div>
      </div>
    </div>
  );
}

function ModeScreen({ onChoose }: { onChoose: (mode: "offline" | "online") => void }) {
  return <div className="setup-screen"><div className="setup-inner">
    <div className="step">02 / 04</div><span className="eyebrow">РЕЖИМ ИГРЫ</span><h1>Как будем играть?</h1><p className="setup-lead">Сейчас полностью доступен Offline. Он позволяет спокойно проходить карьеру и рынок в своём темпе.</p>
    <div className="mode-cards">
      <button className="mode-card selected" onClick={() => onChoose("offline")}><span className="mode-icon">◒</span><b>OFFLINE</b><strong>Твоя история</strong><p>Локальная экономика, управляемое время, сохранение прогресса и полная свобода экспериментов.</p><i>ДОСТУПНО СЕЙЧАС →</i></button>
      <button className="mode-card disabled" disabled><span className="mode-icon">◎</span><b>ONLINE</b><strong>Общий рынок</strong><p>Игроки торгуют в одной экономике, цены живут постоянно, а сервер хранит рынок.</p><i>СКОРО</i></button>
    </div>
  </div></div>;
}

function CountryScreen({ selected, setSelected, onNext }: { selected: string; setSelected: (id: string) => void; onNext: () => void }) {
  const country = countries.find(c => c.id === selected) ?? countries[0];
  return <div className="setup-screen country-setup"><div className="setup-inner wide">
    <div className="step">03 / 04</div><span className="eyebrow">ВЫБОР СТРАНЫ</span><h1>Где начнётся твоя история?</h1><p className="setup-lead">Выбери рынок, стоимость жизни и набор отраслей, в которых ты будешь строить капитал.</p>
    <div className="country-picker">
      <div><AtlasMap selected={selected} onSelect={setSelected} /></div>
      <div className="country-options">{countries.map(c => <button key={c.id} className={c.id === selected ? "country-option active" : "country-option"} onClick={() => setSelected(c.id)}><Flag country={c}/><span><b>{c.name}</b><small>{c.region} · {c.population}</small></span><strong>{c.currencySymbol}</strong></button>)}</div>
    </div>
    <div className="country-profile">
      <div className="profile-title"><Flag country={country}/><div><span className="eyebrow">ПРОФИЛЬ РЫНКА</span><h2>{country.name}</h2><p>{country.description}</p></div></div>
      <div className="profile-stats"><div><span>СТОЛИЦА</span><b>{country.capital}</b></div><div><span>ВАЛЮТА</span><b>{country.currency} · {country.currencySymbol}</b></div><div><span>БИРЖА</span><b>{country.exchange}</b></div><div><span>НАСЕЛЕНИЕ</span><b>{country.population}</b></div></div>
      <div className="company-preview"><div><span className="eyebrow">КЛЮЧЕВЫЕ КОМПАНИИ</span><h3>С чего можно начать изучение рынка</h3></div><div className="company-strip">{country.companies.map(c => <div key={c.ticker}><b>{c.ticker}</b><strong>{c.name}</strong><small>{c.sector}</small></div>)}</div></div>
    </div>
    <div className="setup-actions"><button className="back" onClick={() => window.scrollTo(0,0)}>Выбери страну на карте</button><button className="primary small" onClick={onNext}>Выбрать {country.name} <b>→</b></button></div>
  </div></div>;
}

function DifficultyScreen({ country, onStart, onBack }: { country: Country; onStart: (id: string) => void; onBack: () => void }) {
  const [selected, setSelected] = useState("normal");
  const d = difficultyLevels.find(x => x.id === selected) ?? difficultyLevels[1];
  return <div className="setup-screen"><div className="setup-inner">
    <div className="step">04 / 04</div><span className="eyebrow">СЛОЖНОСТЬ</span><h1>Насколько жёстким<br/>будет старт?</h1><p className="setup-lead">Сложность определяет стартовый капитал, давление расходов и количество помощи в первые игровые дни.</p>
    <div className="difficulty-list">{difficultyLevels.map(x => <button key={x.id} className={x.id === selected ? "difficulty active" : "difficulty"} onClick={() => setSelected(x.id)}><span className="radio"/><div><b>{x.name}</b><strong>{x.money}</strong><p>{x.description}</p><small>{x.rules}</small></div></button>)}</div>
    <div className="start-summary"><span>СТАРТ</span><b>{country.name}</b><i>·</i><b>{d.name}</b><i>·</i><b>{d.money}</b><button className="primary small" onClick={() => onStart(selected)}>Начать игру <b>→</b></button></div>
    <button className="text-back" onClick={onBack}>← Вернуться к выбору страны</button>
  </div></div>;
}

function MiniChart() {
  return <svg className="mini-chart" viewBox="0 0 500 130" preserveAspectRatio="none"><path d="M0 103 L45 96 L74 101 L112 76 L150 83 L187 69 L221 75 L263 45 L301 59 L340 38 L382 47 L419 25 L456 33 L500 12"/><path d="M0 116H500M0 86H500M0 56H500M0 26H500" className="grid-line"/></svg>;
}

function GameScreen({ player, country, difficulty, onRestart }: { player: string; country: Country; difficulty: string; onRestart: () => void }) {
  const [tab, setTab] = useState<GameTab>("overview");
  const [cash, setCash] = useState(difficulty === "easy" ? 500000 : difficulty === "hard" ? 100000 : 250000);
  const [portfolio, setPortfolio] = useState(0);
  const [day, setDay] = useState(1);
  const [notice, setNotice] = useState("Сегодня доступно 3 способа заработать деньги.");
  const [jobCooldown, setJobCooldown] = useState<string | null>(null);

  const buy = (price: number) => {
    if (cash < price) { setNotice("Недостаточно свободных денег для этой сделки."); return; }
    setCash(v => v - price); setPortfolio(v => v + price); setNotice("Позиция открыта. Стоимость добавлена в портфель.");
  };
  const work = (jobId: string, pay: number) => {
    setCash(v => v + pay); setJobCooldown(jobId); setNotice(`Работа завершена: +₽ ${pay.toLocaleString("ru-RU")}. День можно ускорить следующим действием.`);
    window.setTimeout(() => setJobCooldown(null), 1200);
  };
  const advance = () => { setDay(v => v + 1); setNotice("Новый день. Рынок и события обновлены."); };
  const tabs: [GameTab,string][] = [["overview","Обзор"],["exchange","Биржа"],["portfolio","Портфель"],["companies","Компании"],["life","Жизнь"],["map","Карта"],["news","Новости"]];

  return <div className="game-shell">
    <header className="game-topbar">
      <button className="game-brand" onClick={() => setTab("overview")}><span>MA</span><b>MarketArena</b></button>
      <nav>{tabs.map(([id,label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}</nav>
      <div className="game-right"><span className="offline-pill">OFFLINE</span><span>ДЕНЬ {day}</span><b>₽ {cash.toLocaleString("ru-RU")}</b></div>
    </header>
    <div className="game-body">
      <aside className="game-sidebar">
        <div className="player-card"><span className="avatar">{player.slice(0,1).toUpperCase()}</span><div><b>{player}</b><small>Частный инвестор</small></div></div>
        <div className="country-mini"><Flag country={country}/><div><b>{country.name}</b><small>{country.capital} · {country.currencySymbol}</small></div></div>
        <div className="side-title">ИГРА</div>
        {tabs.map(([id,label]) => <button key={id} className={tab === id ? "side-active" : ""} onClick={() => setTab(id)}>{label}<span>›</span></button>)}
        <div className="side-bottom"><small>СЛОЖНОСТЬ</small><b>{difficultyLevels.find(x=>x.id===difficulty)?.name}</b><button onClick={onRestart}>Новая игра</button></div>
      </aside>
      <main className="game-main">
        {tab === "overview" && <><div className="game-heading"><div><span className="eyebrow">ДЕНЬ {day} · {country.name.toUpperCase()}</span><h1>Добро пожаловать, {player}.</h1><p>{notice}</p></div><button className="day-button" onClick={advance}>Следующий день →</button></div>
          <div className="dashboard-grid">
            <section className="market-card big"><div className="card-head"><div><span>РЫНОК {country.currencySymbol}</span><h2>Индекс местного рынка</h2></div><b className="positive">+1,84%</b></div><MiniChart/><div className="market-foot"><span>Сегодня <b>+1,84%</b></span><span>Объём <b>₽ 8,42 млрд</b></span><span>Волатильность <b>средняя</b></span></div></section>
            <section className="money-card"><span>СВОБОДНЫЕ ДЕНЬГИ</span><strong>₽ {cash.toLocaleString("ru-RU")}</strong><small>Портфель · ₽ {portfolio.toLocaleString("ru-RU")}</small><div className="money-bar"><i style={{width: `${Math.min(100, Math.max(8, cash / (cash + portfolio || 1) * 100))}%`}}/></div></section>
            <section className="jobs-card"><div className="card-head"><div><span>РАБОТА И ДОХОД</span><h2>Заработать на первые сделки</h2></div><button onClick={() => setTab("life")}>Все →</button></div>{jobs.map(j => <div className="job-row" key={j.id}><div><b>{j.title}</b><small>{j.time} · {j.text}</small></div><button disabled={jobCooldown === j.id} onClick={() => work(j.id,j.pay)}>+₽ {j.pay.toLocaleString("ru-RU")}</button></div>)}</section>
            <section className="companies-card"><div className="card-head"><div><span>КОМПАНИИ</span><h2>Что сегодня в фокусе</h2></div><button onClick={() => setTab("companies")}>Все →</button></div>{country.companies.slice(0,3).map(c => <div className="ticker-row" key={c.ticker}><b>{c.ticker}</b><span>{c.name}<small>{c.sector}</small></span><strong>+{(1.2 + c.ticker.length / 10).toFixed(2)}%</strong><button onClick={() => buy(15000)}>Купить</button></div>)}</section>
          </div>
        </>}
        {tab === "exchange" && <Panel title="Биржа" eyebrow="MARKET"><p>Здесь будет полноценный стакан, график, заявки, облигации, валюты и позже — фьючерсы и опционы.</p><MiniChart/><div className="table-card">{country.companies.map(c=><div className="table-row" key={c.ticker}><b>{c.ticker}</b><span>{c.name}</span><span>{c.sector}</span><strong>₽ 15 000</strong><button onClick={()=>buy(15000)}>Купить</button></div>)}</div></Panel>}
        {tab === "portfolio" && <Panel title="Портфель" eyebrow="YOUR CAPITAL"><div className="big-number">₽ {portfolio.toLocaleString("ru-RU")}</div><p>Свободные деньги: ₽ {cash.toLocaleString("ru-RU")}. Сейчас это учебный офлайн-портфель.</p><div className="empty-state">Покупай активы на вкладке «Биржа» — позиции появятся здесь.</div></Panel>}
        {tab === "companies" && <Panel title="Компании" eyebrow="PUBLIC COMPANIES"><p>У каждой компании появятся отчётность, CEO, совет директоров, конкуренты, события и финансовая история.</p><div className="company-grid">{country.companies.map(c=><article key={c.ticker}><b>{c.ticker}</b><h3>{c.name}</h3><span>{c.sector}</span><p>{c.note}</p><button onClick={()=>buy(15000)}>Купить ₽15 000</button></article>)}</div></Panel>}
        {tab === "life" && <Panel title="Жизнь" eyebrow="CAREER & LIFE"><p>Работа — не отдельный экран ради декора. Это источник капитала, который игрок постепенно превращает в инвестиции.</p>{jobs.map(j=><div className="life-job" key={j.id}><div><b>{j.title}</b><span>{j.text}</span></div><strong>₽ {j.pay.toLocaleString("ru-RU")}</strong><button onClick={()=>work(j.id,j.pay)}>Выйти на смену</button></div>)}</Panel>}
        {tab === "map" && <Panel title="Карта страны и рынка" eyebrow="ECONOMIC MAP"><p>Карта связывает регионы, города, порты и отрасли. Позже на ней будут отображаться экономические события и цепочки поставок.</p><AtlasMap selected={country.id} onSelect={()=>setTab("companies")}/></Panel>}
        {tab === "news" && <Panel title="Новости" eyebrow="MARKET NEWS"><div className="news-list"><article><span>09:15</span><div><b>Производственный сектор показал рост заказов</b><p>Компании промышленного индекса получают поддержку от увеличения внутреннего спроса.</p></div><strong>ПОЛОЖИТЕЛЬНО</strong></article><article><span>08:40</span><div><b>Центральный банк сохранил ставку</b><p>Рынок оценивает решение как нейтральное. Банковские акции реагируют спокойно.</p></div><strong>НЕЙТРАЛЬНО</strong></article><article><span>07:55</span><div><b>Логистический оператор сообщил о новом контракте</b><p>Ожидается рост грузопотока в течение следующих игровых недель.</p></div><strong>ПОЛОЖИТЕЛЬНО</strong></article></div></Panel>}
      </main>
    </div>
  </div>;
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <div className="game-panel"><div className="panel-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div></div>{children}</div>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("auth");
  const [player, setPlayer] = useState("Игрок");
  const [countryId, setCountryId] = useState("slovenia");
  const [difficulty, setDifficulty] = useState("normal");
  const country = useMemo(() => countries.find(c => c.id === countryId) ?? countries[0], [countryId]);

  if (screen === "auth") return <AuthScreen onContinue={name => { setPlayer(name); setScreen("mode"); }} />;
  if (screen === "mode") return <ModeScreen onChoose={() => setScreen("country")} />;
  if (screen === "country") return <CountryScreen selected={countryId} setSelected={setCountryId} onNext={() => setScreen("difficulty")} />;
  if (screen === "difficulty") return <DifficultyScreen country={country} onStart={id => { setDifficulty(id); setScreen("game"); }} onBack={() => setScreen("country")} />;
  return <GameScreen player={player} country={country} difficulty={difficulty} onRestart={() => setScreen("auth")} />;
}
