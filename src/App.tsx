import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { commonCurrency, countries, difficultyLevels, type CompanyPreview, type Country } from "./data/world";

type Screen = "auth" | "mode" | "country" | "difficulty" | "game";
type GameTab = "overview" | "exchange" | "portfolio" | "companies" | "life" | "map" | "news";

const jobs = [
  { id: "analyst", title: "Помощник аналитика", pay: 18000, time: "2 часа", text: "Разбор отчётов и исследование компаний." },
  { id: "logistics", title: "Курьер / логистика", pay: 12500, time: "3 часа", text: "Стабильный доход в транспортной отрасли." },
  { id: "freelance", title: "Фриланс-специалист", pay: 24000, time: "4 часа", text: "Высокий доход, но спрос зависит от экономики." }
];

function Flag({ country }: { country: Country }) {
  return <span className={`flag flag-${country.id}`} aria-label={`Флаг ${country.name}`}><i /></span>;
}

function Terrain({ detailed = false }: { detailed?: boolean }) {
  return <g className="terrain-layer">
    <path className="ridge" d="M76 89 C95 72 111 76 126 91 C141 70 159 73 174 91 C190 64 211 67 228 89 M275 90 C292 66 312 69 328 91 C344 63 365 68 380 92" />
    <path className="ridge light" d="M86 105 C101 88 114 92 126 105 M287 106 C302 88 315 91 328 105" />
    <path className="river" d="M220 73 C218 99 228 113 218 137 C208 161 199 182 207 202 C214 220 231 231 239 249 C245 264 241 279 232 293" />
    <path className="river" d="M303 76 C294 105 299 126 313 145 C327 164 341 174 348 193 C355 212 351 230 342 246" />
    {detailed && <><path className="river thin" d="M156 107 C174 126 178 143 170 163 C163 180 168 197 181 213" /><path className="river thin" d="M386 115 C375 133 374 149 383 165 C391 180 395 193 391 207" /></>}
  </g>;
}

function AtlasMap({ selected, onSelect, showCompanies = false, onCompany }: { selected: string; onSelect: (id: string) => void; showCompanies?: boolean; onCompany?: (company: CompanyPreview) => void }) {
  return <div className="atlas atlas-realistic">
    <div className="atlas-head"><span>АТЛАС · ЕДИНЫЙ ЭКОНОМИЧЕСКИЙ СОЮЗ</span><span>СЕВЕР ↑</span></div>
    <svg viewBox="0 0 500 350" className="atlas-svg" role="img" aria-label="Физико-политическая карта пяти вымышленных государств">
      <defs>
        <linearGradient id="oceanDeep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#103c58"/><stop offset=".55" stopColor="#0a2b42"/><stop offset="1" stopColor="#061a2b"/></linearGradient>
        <linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9c7a3"/><stop offset=".55" stopColor="#b9ad8d"/><stop offset="1" stopColor="#7e896f"/></linearGradient>
        <pattern id="waves" width="38" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 C8 5 12 15 20 10 S32 5 38 10" fill="none" stroke="#8cb9cc" strokeOpacity=".09" /></pattern>
        <filter id="mapShadow"><feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#000" floodOpacity=".32"/></filter>
        <clipPath id="continentClip"><path d="M44 93 C55 67 78 52 103 48 C126 44 144 50 161 61 C183 48 207 43 229 50 C247 54 261 68 276 76 C297 55 323 45 350 50 C377 54 399 69 416 88 C439 105 453 128 449 151 C466 170 460 197 445 214 C452 238 440 264 421 279 C405 300 379 310 354 307 C333 324 303 324 280 311 C255 327 224 326 202 312 C177 320 148 310 133 293 C106 295 80 281 69 261 C45 252 33 229 39 207 C24 185 29 160 43 143 C32 124 34 107 44 93 Z"/></clipPath>
      </defs>
      <rect width="500" height="350" fill="url(#oceanDeep)"/>
      <rect width="500" height="350" fill="url(#waves)"/>
      <g filter="url(#mapShadow)">
        <path className="continent-base" d="M44 93 C55 67 78 52 103 48 C126 44 144 50 161 61 C183 48 207 43 229 50 C247 54 261 68 276 76 C297 55 323 45 350 50 C377 54 399 69 416 88 C439 105 453 128 449 151 C466 170 460 197 445 214 C452 238 440 264 421 279 C405 300 379 310 354 307 C333 324 303 324 280 311 C255 327 224 326 202 312 C177 320 148 310 133 293 C106 295 80 281 69 261 C45 252 33 229 39 207 C24 185 29 160 43 143 C32 124 34 107 44 93 Z"/>
        <g clipPath="url(#continentClip)">
          {countries.map(c => <path key={c.id} d={c.mapPath} className={`atlas-country ${selected === c.id ? "selected" : ""}`} style={{fill:c.color}} onClick={() => onSelect(c.id)}/>)}
          <path className="terrain-wash" d="M45 220 C100 200 135 217 176 236 C217 256 246 251 289 232 C337 211 374 205 451 222 L451 350 L45 350 Z"/>
          <Terrain detailed/>
        </g>
        <path className="coastline" d="M44 93 C55 67 78 52 103 48 C126 44 144 50 161 61 C183 48 207 43 229 50 C247 54 261 68 276 76 C297 55 323 45 350 50 C377 54 399 69 416 88 C439 105 453 128 449 151 C466 170 460 197 445 214 C452 238 440 264 421 279 C405 300 379 310 354 307 C333 324 303 324 280 311 C255 327 224 326 202 312 C177 320 148 310 133 293 C106 295 80 281 69 261 C45 252 33 229 39 207 C24 185 29 160 43 143 C32 124 34 107 44 93 Z"/>
        <path className="border-line" d="M151 91 C171 69 202 62 226 71 C246 78 262 94 270 111 L258 137 C248 154 246 174 229 190 L207 207 M270 109 C283 87 306 69 332 64 C357 60 384 68 406 84 M137 183 L158 195 L181 201 L207 206 L229 194 L249 200 L267 214 M267 170 L292 173 L319 184 L342 195 L364 211 L382 232 M258 259 L270 280 L292 293 L319 304 L346 306"/>
      </g>
      <path className="trade-route" d="M91 130 C151 126 191 151 222 168 C266 193 305 197 344 181 C376 168 401 156 421 165"/>
      <path className="trade-route alt" d="M117 252 C168 242 205 250 239 265 C282 284 322 278 370 249"/>
      {countries.map(c => <g key={c.id} className={`capital ${selected===c.id?"capital-active":""}`} onClick={() => onSelect(c.id)}><circle cx={c.capitalX} cy={c.capitalY} r="7"/><circle cx={c.capitalX} cy={c.capitalY} r="2.4"/><text x={c.capitalX+9} y={c.capitalY-8}>{c.capital}</text></g>)}
      {showCompanies && countries.find(c=>c.id===selected)?.companies.map(company => <g key={company.ticker} className="company-marker" onClick={(e)=>{e.stopPropagation();onCompany?.(company)}}><circle cx={company.x} cy={company.y} r="9"/><circle cx={company.x} cy={company.y} r="3"/><text x={company.x+12} y={company.y+3}>{company.ticker}</text></g>)}
      <text className="sea-label" x="20" y="180">ЗАПАДНОЕ МОРЕ</text><text className="sea-label" x="385" y="205">ВОСТОЧНОЕ МОРЕ</text><text className="sea-label" x="205" y="338">ЮЖНЫЙ ПРОЛИВ</text>
      <g className="compass"><circle cx="466" cy="30" r="17"/><text x="463" y="16">N</text><path d="M466 19V41M455 30H477"/></g>
    </svg>
    <div className="map-key"><span><b className="dot"/> столица</span><span><b className="line"/> торговый маршрут</span><span><b className="mount"/> горный хребет</span>{showCompanies&&<span><b className="company-dot"/> публичная компания</span>}</div>
  </div>;
}

function CEOAvatar({ company }: { company: CompanyPreview }) {
  const initials = company.ceo.split(" ").map(x=>x[0]).join("").slice(0,2);
  return <div className="ceo-avatar"><div className="ceo-head"><span>{initials}</span></div><div className="ceo-shoulders"/></div>;
}

function CompanyCard({ company, onBuy }: { company: CompanyPreview; onBuy: (price:number)=>void }) {
  return <article className="company-focus-card">
    <div className="company-focus-top"><span className="ticker">{company.ticker}</span><span className="sector-chip">{company.sector}</span></div>
    <h3>{company.name}</h3><p>{company.note}</p>
    <div className="company-ceo"><CEOAvatar company={company}/><div><span className="eyebrow">CEO · {company.ceoRole}</span><b>{company.ceo}</b><small>{company.ceoAge} лет</small></div></div>
    <div className="company-focus-footer"><span>Цена <b>15 000 VLR</b></span><button onClick={()=>onBuy(15000)}>Купить акцию</button></div>
  </article>;
}

function AuthScreen({ onContinue }: { onContinue:(name:string)=>void }) {
  const [name,setName]=useState(""); const [register,setRegister]=useState(true);
  return <div className="auth-screen"><div className="auth-panel">
    <div className="brand large"><div className="brand-mark">MA</div><div><b>MarketArena</b><small>ECONOMIC LIFE & MARKET SIMULATOR</small></div></div>
    <div className="auth-copy"><span className="eyebrow">НАЧАЛО ИГРЫ</span><h1>Построй капитал<br/><em>с нуля.</em></h1><p>Работа, расходы, накопления, компании и рынок — одна игровая система, в которой твои решения постепенно меняют финансовую историю.</p></div>
    <div className="auth-tabs"><button className={register?"active":""} onClick={()=>setRegister(true)}>Регистрация</button><button className={!register?"active":""} onClick={()=>setRegister(false)}>Войти</button></div>
    <label className="field"><span>Имя игрока</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Например, Алексей"/></label>
    <button className="primary" disabled={!name.trim()} onClick={()=>onContinue(name.trim())}>{register?"Создать профиль":"Продолжить"} <b>→</b></button>
    <div className="auth-note">Профиль офлайн-режима хранится локально. Online будет добавлен отдельным этапом.</div>
  </div><div className="auth-art"><div className="terminal-window"><div className="terminal-top"><span>MARKET / OPEN</span><span>OFFLINE</span></div><div className="terminal-chart"><svg viewBox="0 0 500 220"><path d="M0 182 L52 174 L82 185 L126 142 L165 157 L203 113 L246 129 L289 91 L330 105 L365 66 L411 81 L454 42 L500 54"/><path d="M0 205H500M0 160H500M0 115H500M0 70H500M0 25H500" className="grid-line"/></svg></div><div className="terminal-stats"><span><b>5 000 000 VLR</b><small>ВЫСШИЙ КЛАСС</small></span><span><b>5</b><small>ВЫМЫШЛЕННЫХ СТРАН</small></span><span><b>1</b><small>ОБЩАЯ ВАЛЮТА</small></span></div></div></div></div>;
}

function ModeScreen({ onChoose }:{onChoose:(mode:"offline"|"online")=>void}) {
  return <div className="setup-screen"><div className="setup-inner"><div className="step">02 / 04</div><span className="eyebrow">РЕЖИМ ИГРЫ</span><h1>Выбери формат своей истории.</h1><p className="setup-lead">Сейчас разрабатываем Offline: личная экономика, управляемое время и рынок для экспериментов. Online оставлен в концепции, но ещё не запущен.</p><div className="mode-cards">
    <button className="mode-card selected" onClick={()=>onChoose("offline")}><span className="mode-icon">◒</span><b>OFFLINE</b><strong>Личная экономика</strong><p>Работаешь, тратишь, копишь, покупаешь компании и сам управляешь темпом игры.</p><i>ДОСТУПНО СЕЙЧАС →</i></button>
    <button className="mode-card disabled" disabled><span className="mode-icon">◎</span><b>ONLINE</b><strong>Общий рынок</strong><p>Единая экономика для игроков, постоянные цены и серверная история рынка.</p><i>СКОРО</i></button>
  </div></div></div>;
}

function CountryScreen({selected,setSelected,onNext}:{selected:string;setSelected:(id:string)=>void;onNext:()=>void}) {
  const country=countries.find(c=>c.id===selected)??countries[0];
  return <div className="setup-screen"><div className="setup-inner wide"><div className="step">03 / 04</div><span className="eyebrow">ВЫБОР СТРАНЫ</span><h1>Выбери свой рынок.</h1><p className="setup-lead">Пять вымышленных государств объединены общей валютой <b>{commonCurrency.name}</b>. Но экономика, отрасли и компании у каждой страны разные.</p>
    <div className="country-picker"><AtlasMap selected={selected} onSelect={setSelected}/><div className="country-options">{countries.map(c=><button key={c.id} className={c.id===selected?"country-option active":"country-option"} onClick={()=>setSelected(c.id)}><Flag country={c}/><span><b>{c.name}</b><small>{c.region} · {c.population}</small></span><strong>{c.currencySymbol}</strong></button>)}</div></div>
    <div className="country-profile"><div className="profile-title"><Flag country={country}/><div><span className="eyebrow">ПРОФИЛЬ РЫНКА</span><h2>{country.name}</h2><p>{country.description}</p></div></div>
      <div className="profile-stats"><div><span>СТОЛИЦА</span><b>{country.capital}</b></div><div><span>ЕДИНАЯ ВАЛЮТА</span><b>{country.currency} · {country.currencySymbol}</b></div><div><span>БИРЖА</span><b>{country.exchange}</b></div><div><span>НАСЕЛЕНИЕ</span><b>{country.population}</b></div></div>
      <div className="company-preview"><span className="eyebrow">КЛЮЧЕВЫЕ КОМПАНИИ</span><h3>Крупнейшие игроки рынка</h3><div className="company-strip">{country.companies.map(c=><div key={c.ticker}><b>{c.ticker}</b><strong>{c.name}</strong><small>{c.sector}</small></div>)}</div></div>
    </div>
    <div className="setup-actions"><span className="setup-hint">Карта показывает физическую географию и столицы.</span><button className="primary small" onClick={onNext}>Выбрать {country.name}<b>→</b></button></div>
  </div></div>;
}

function DifficultyScreen({country,onStart,onBack}:{country:Country;onStart:(id:string)=>void;onBack:()=>void}) {
  const [selected,setSelected]=useState("normal"); const d=difficultyLevels.find(x=>x.id===selected)??difficultyLevels[1];
  return <div className="setup-screen"><div className="setup-inner"><div className="step">04 / 04</div><span className="eyebrow">КЛАСС СТАРТА</span><h1>Каким будет твой<br/>финансовый старт?</h1><p className="setup-lead">Класс определяет стартовый капитал и давление экономики. Это не выбор «хорошо или плохо» — это выбор жизненной позиции.</p>
    <div className="difficulty-list">{difficultyLevels.map(x=><button key={x.id} className={x.id===selected?"difficulty active":"difficulty"} onClick={()=>setSelected(x.id)}><span className="radio"/><div><b>{x.name}</b><strong>{x.money}</strong><p>{x.description}</p><small>{x.rules}</small></div></button>)}</div>
    <div className="start-summary"><span>СТАРТ</span><b>{country.name}</b><i>·</i><b>{d.name}</b><i>·</i><b>{d.money}</b><button className="primary small" onClick={()=>onStart(selected)}>Начать игру<b>→</b></button></div>
    <button className="text-back" onClick={onBack}>← Вернуться к выбору страны</button>
  </div></div>;
}

function MiniChart(){return <svg className="mini-chart" viewBox="0 0 500 130" preserveAspectRatio="none"><path d="M0 103 L45 96 L74 101 L112 76 L150 83 L187 69 L221 75 L263 45 L301 59 L340 38 L382 47 L419 25 L456 33 L500 12"/><path d="M0 116H500M0 86H500M0 56H500M0 26H500" className="grid-line"/></svg>;}

function Panel({title,eyebrow,children}:{title:string;eyebrow:string;children:ReactNode}){return <div className="game-panel"><div className="panel-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>{children}</div>;}

function GameScreen({player,country,difficulty,onRestart}:{player:string;country:Country;difficulty:string;onRestart:()=>void}) {
  const [tab,setTab]=useState<GameTab>("overview"); const [cash,setCash]=useState(difficulty==="easy"?5000000:difficulty==="hard"?50000:500000); const [portfolio,setPortfolio]=useState(0); const [day,setDay]=useState(1); const [notice,setNotice]=useState("Сегодня доступны работа, рынок и первые инвестиции."); const [selectedCompany,setSelectedCompany]=useState<CompanyPreview|null>(null);
  const [jobCooldown,setJobCooldown]=useState<string|null>(null);
  const buy=(price:number)=>{if(cash<price){setNotice("Недостаточно свободных денег для этой сделки.");return;}setCash(v=>v-price);setPortfolio(v=>v+price);setNotice("Позиция открыта. Актив добавлен в портфель.");};
  const work=(id:string,pay:number)=>{setCash(v=>v+pay);setJobCooldown(id);setNotice(`Работа завершена: +${pay.toLocaleString("ru-RU")} VLR.`);setTimeout(()=>setJobCooldown(null),1000);};
  const advance=()=>{setDay(v=>v+1);setNotice("Новый игровой день. Экономика и новости обновились.");};
  const tabs:[GameTab,string][]=[["overview","Обзор"],["exchange","Биржа"],["portfolio","Портфель"],["companies","Компании"],["life","Жизнь"],["map","Карта"],["news","Новости"]];
  const cashPct=Math.min(100,Math.max(8,cash/(cash+portfolio||1)*100));
  return <div className="game-shell"><header className="game-topbar"><button className="game-brand" onClick={()=>setTab("overview")}><span>MA</span><b>MarketArena</b></button><nav>{tabs.map(([id,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}>{label}</button>)}</nav><div className="game-right"><span className="offline-pill">OFFLINE</span><span>ДЕНЬ {day}</span><b>{cash.toLocaleString("ru-RU")} VLR</b></div></header>
    <div className="game-body"><aside className="game-sidebar"><div className="player-card"><span className="avatar">{player.slice(0,1).toUpperCase()}</span><div><b>{player}</b><small>Частный инвестор</small></div></div><div className="country-mini"><Flag country={country}/><div><b>{country.name}</b><small>{country.capital} · {commonCurrency.symbol}</small></div></div><div className="side-title">ИГРА</div>{tabs.map(([id,label])=><button key={id} className={tab===id?"side-active":""} onClick={()=>setTab(id)}>{label}<span>›</span></button>)}<div className="side-bottom"><small>КЛАСС</small><b>{difficultyLevels.find(x=>x.id===difficulty)?.name}</b><button onClick={onRestart}>Новая игра</button></div></aside>
      <main className="game-main">
        {tab==="overview"&&<><div className="game-heading"><div><span className="eyebrow">ДЕНЬ {day} · {country.name.toUpperCase()}</span><h1>Твой экономический центр.</h1><p>{notice}</p></div><button className="day-button" onClick={advance}>Следующий день →</button></div>
          <div className="hero-map-grid"><section className="market-map-card"><div className="card-head"><div><span>ГЕОГРАФИЯ · ЭКОНОМИКА · КОМПАНИИ</span><h2>{country.name}: карта рынка</h2></div><b className="positive">+1,84%</b></div><AtlasMap selected={country.id} onSelect={id=>setTab("map")} showCompanies onCompany={setSelectedCompany}/></section>
          <section className="capital-card"><span>СВОБОДНЫЙ КАПИТАЛ</span><strong>{cash.toLocaleString("ru-RU")} VLR</strong><small>Портфель · {portfolio.toLocaleString("ru-RU")} VLR</small><div className="money-bar"><i style={{width:`${cashPct}%`}}/></div><div className="capital-actions"><button onClick={()=>setTab("life")}>Заработать</button><button onClick={()=>setTab("exchange")}>Инвестировать</button></div></section>
          <section className="jobs-card"><div className="card-head"><div><span>РАБОТА И ДОХОД</span><h2>Заработать на следующие сделки</h2></div><button onClick={()=>setTab("life")}>Все →</button></div>{jobs.map(j=><div className="job-row" key={j.id}><div><b>{j.title}</b><small>{j.time} · {j.text}</small></div><button disabled={jobCooldown===j.id} onClick={()=>work(j.id,j.pay)}>+{j.pay.toLocaleString("ru-RU")} VLR</button></div>)}</section>
          <section className="companies-card"><div className="card-head"><div><span>ПУБЛИЧНЫЕ КОМПАНИИ</span><h2>Кто находится прямо перед тобой</h2></div><button onClick={()=>setTab("companies")}>Открыть все →</button></div><div className="ticker-grid">{country.companies.map(c=><button className="ticker-row" key={c.ticker} onClick={()=>setSelectedCompany(c)}><b>{c.ticker}</b><span>{c.name}<small>{c.sector}</small></span><strong>+{(1.2+c.ticker.length/10).toFixed(2)}%</strong></button>)}</div></section></div>
        </>}
        {tab==="exchange"&&<Panel title="Биржа" eyebrow="MARKET"><p className="panel-lead">Все сделки считаются в единой валюте {commonCurrency.name} ({commonCurrency.symbol}). Здесь постепенно появятся стакан, отчётность, облигации и производные инструменты.</p><MiniChart/><div className="table-card">{country.companies.map(c=><div className="table-row" key={c.ticker}><b>{c.ticker}</b><span>{c.name}</span><span>{c.sector}</span><strong>15 000 VLR</strong><button onClick={()=>buy(15000)}>Купить</button></div>)}</div></Panel>}
        {tab==="portfolio"&&<Panel title="Портфель" eyebrow="YOUR CAPITAL"><div className="big-number">{portfolio.toLocaleString("ru-RU")} VLR</div><p className="panel-lead">Свободные деньги: {cash.toLocaleString("ru-RU")} VLR. Позиции куплены в офлайн-экономике.</p><div className="empty-state">Покупай активы на вкладке «Биржа». Здесь появится их количество, средняя цена и результат.</div></Panel>}
        {tab==="companies"&&<Panel title="Компании" eyebrow="PUBLIC COMPANIES"><p className="panel-lead">Нажми на компанию, чтобы открыть CEO, отрасль, историю и торговое действие.</p><div className="company-grid">{country.companies.map(c=><CompanyCard key={c.ticker} company={c} onBuy={buy}/>)}</div></Panel>}
        {tab==="life"&&<Panel title="Жизнь" eyebrow="CAREER & LIFE"><p className="panel-lead">Твой главный ресурс до большого капитала — время. Выбирай работу и превращай доход в инвестиции.</p>{jobs.map(j=><div className="life-job" key={j.id}><div><b>{j.title}</b><span>{j.text}</span></div><strong>{j.pay.toLocaleString("ru-RU")} VLR</strong><button disabled={jobCooldown===j.id} onClick={()=>work(j.id,j.pay)}>Работать</button></div>)}</Panel>}
        {tab==="map"&&<Panel title={`Карта ${country.name}`} eyebrow="ATLAS"><p className="panel-lead">Физическая география, столица, торговые маршруты и публичные компании страны.</p><AtlasMap selected={country.id} onSelect={setTab.bind(null,"map")} showCompanies onCompany={setSelectedCompany}/></Panel>}
        {tab==="news"&&<Panel title="Новости" eyebrow="ECONOMIC NEWS"><p className="panel-lead">Новости будут связывать события экономики с компаниями и котировками.</p><div className="news-list"><article><span>08:30</span><div><b>Энергетический сектор получил новый контракт</b><p>Рост экспортного спроса поддержал компании Дарваста и транспортные цепочки союза.</p></div><strong>ЭКОНОМИКА</strong></article><article><span>11:10</span><div><b>Технологические компании объявили о расширении инвестиций</b><p>Эстравийские производители увеличивают закупки оборудования и компонентов.</p></div><strong>КОМПАНИИ</strong></article><article><span>14:20</span><div><b>Индекс союза обновил дневной максимум</b><p>Финансовый сектор и логистика поддержали рынок.</p></div><strong>РЫНОК</strong></article></div></Panel>}
      </main></div>
    {selectedCompany&&<div className="company-modal-backdrop" onClick={()=>setSelectedCompany(null)}><div className="company-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelectedCompany(null)}>×</button><div className="modal-company-head"><CEOAvatar company={selectedCompany}/><div><span className="ticker">{selectedCompany.ticker}</span><h2>{selectedCompany.name}</h2><p>{selectedCompany.sector} · публичная компания</p></div></div><div className="modal-grid"><div><span className="eyebrow">О КОМПАНИИ</span><p>{selectedCompany.note}. Компания работает внутри экономической цепочки {country.name} и связана с другими секторами союза.</p><div className="modal-buy"><span>Текущая цена <b>15 000 VLR</b></span><button className="primary small" onClick={()=>{buy(15000);setSelectedCompany(null)}}>Купить акцию</button></div></div><div className="ceo-profile"><span className="eyebrow">CEO</span><h3>{selectedCompany.ceo}</h3><b>{selectedCompany.ceoAge} лет · {selectedCompany.ceoRole}</b><p>{selectedCompany.ceoBio}</p></div></div></div></div>}
  </div>;
}

function App(){
  const [screen,setScreen]=useState<Screen>("auth"); const [player,setPlayer]=useState("Игрок"); const [mode,setMode]=useState<"offline"|"online">("offline"); const [countryId,setCountryId]=useState(countries[0].id); const [difficulty,setDifficulty]=useState("normal");
  const country=useMemo(()=>countries.find(c=>c.id===countryId)??countries[0],[countryId]);
  if(screen==="auth") return <AuthScreen onContinue={name=>{setPlayer(name);setScreen("mode")}}/>;
  if(screen==="mode") return <ModeScreen onChoose={m=>{setMode(m);if(m==="offline")setScreen("country")}}/>;
  if(screen==="country") return <CountryScreen selected={countryId} setSelected={setCountryId} onNext={()=>setScreen("difficulty")}/>;
  if(screen==="difficulty") return <DifficultyScreen country={country} onStart={id=>{setDifficulty(id);setScreen("game")}} onBack={()=>setScreen("country")}/>;
  return <GameScreen player={player} country={country} difficulty={difficulty} onRestart={()=>setScreen("mode")}/>;
}

export default App;
