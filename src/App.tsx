import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { commonCurrency, countries, difficultyLevels, type CompanyPreview, type Country } from "./data/world";

type Screen = "auth" | "mode" | "country" | "difficulty" | "game";
type GameTab = "overview" | "exchange" | "portfolio" | "companies" | "life" | "map" | "news";
type Transaction = { day:number; type:"BUY"|"SELL"; ticker:string; quantity:number; price:number };

const jobs = [
  { id: "analyst", title: "Помощник аналитика", pay: 18000, time: "2 часа", text: "Разбор отчётов и исследование компаний." },
  { id: "logistics", title: "Курьер / логистика", pay: 12500, time: "3 часа", text: "Стабильный доход в транспортной отрасли." },
  { id: "freelance", title: "Фриланс-специалист", pay: 24000, time: "4 часа", text: "Высокий доход, но спрос зависит от экономики." }
];

function companyProfile(company: CompanyPreview, country: Country) {
  const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);
  const materialMap:Record<string,string>={"Металлы":"железная руда, уголь, цветные концентраты","Энергетика":"газ, вода, сетевые мощности и топливо","Финансы":"капитал, депозиты и корпоративный кредит","Машиностроение":"сталь, электроника и промышленное оборудование","Судоходство":"топливо, контейнеры и портовая инфраструктура","Страхование":"капитал, перестрахование и данные о рисках","Порты":"земля, склады, контейнерные мощности","Нефть":"нефть, газ и нефтехимическое сырьё","Логистика":"топливо, вагоны, дороги и складские площади","Биотех":"лабораторное оборудование, реагенты и научные кадры","Технологии":"серверы, электроника и инженерные кадры","Электроника":"кремний, медь и высокоточные компоненты","Робототехника":"электроника, приводы и промышленное ПО","Агро":"зерно, удобрения, вода и сельхозземля","Ритейл":"продукты, логистика и потребительский спрос"};
  const sectorNarrative:Record<string,string>={"Металлы":"Производит базовые материалы для строительства, транспорта и тяжёлой промышленности, поэтому чувствительна к ценам сырья и экспортному спросу.","Энергетика":"Управляет критической инфраструктурой и генерирующими активами. Денежный поток устойчив, но капитальные затраты велики.","Финансы":"Зарабатывает на кредитовании, комиссиях и управлении капиталом. Ключевые риски — стоимость денег и качество кредитного портфеля.","Машиностроение":"Поставляет оборудование для заводов и инфраструктуры. Рост инвестиций ускоряет заказы, а рецессия сокращает backlog.","Судоходство":"Зарабатывает на международных перевозках. Ставки фрахта, цены топлива и загрузка портов определяют маржу.","Страхование":"Монетизирует управление риском через премии и инвестиционный портфель. Результаты зависят от убытков и доходности резервов.","Порты":"Владеет терминалами и складской инфраструктурой. Торговый поток определяет загрузку активов и операционную маржу.","Нефть":"Вертикально связана с добычей и переработкой. Прибыль меняется вместе с ценами на энергоносители и экспортными квотами.","Логистика":"Организует движение грузов между ресурсными регионами, портами и промышленными центрами. Сильнее рынка реагирует на торговые объёмы.","Биотех":"Финансирует долгий цикл исследований и коммерциализации. Потенциал роста высок, но сроки создают волатильность.","Технологии":"Строит цифровую инфраструктуру для бизнеса. Рост клиентов поддерживает маржу, а конкуренция требует постоянных инвестиций.","Электроника":"Производит высокоточные компоненты. Цикл запасов и доступность компонентов критичны для прибыли.","Робототехника":"Автоматизирует производство и склады. Главный драйвер — инвестиционный цикл предприятий.","Агро":"Контролирует переработку и сбыт продовольствия. Урожай, погода и цены на удобрения формируют волатильность.","Ритейл":"Работает с большим оборотом и тонкой маржой. Спрос, инфляция и логистика напрямую отражаются в прибыли."};
  return {founded:1974+(seed%39),employees:(1.2+(seed%88)/10).toFixed(1).replace(".",",")+" тыс.",headquarters:country.capital,revenue:(4.8+(seed%120)/10).toFixed(1).replace(".",",")+" млрд VLR",netProfit:(0.42+(seed%38)/20).toFixed(2).replace(".",",")+" млрд VLR",marketCap:(18+seed%140).toFixed(0)+" млрд VLR",pe:(7+seed%24).toFixed(1)+"×",pb:(0.8+(seed%19)/10).toFixed(1)+"×",dividendYield:(1.6+(seed%32)/10).toFixed(1).replace(".",",")+"%",materials:materialMap[company.sector]??"капитал, энергия и квалифицированный труд",strategy:"Рост выручки через расширение мощностей, цифровизацию операций и дисциплину капитала.",description:company.name+" — публичный игрок "+country.name+" с фокусом на сектор «"+company.sector+"». "+(sectorNarrative[company.sector]??"Компания работает внутри ключевых экономических цепочек страны и союза.")};
}
function eventLabel(company:CompanyPreview,day:number){const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);const events=["подписала новый экспортный контракт и повысила прогноз выручки","зафиксировала рост себестоимости и пересмотрела прогноз маржи","объявила расширение мощностей и программу капитальных инвестиций","увидела замедление спроса на ключевых рынках","получила регуляторное одобрение стратегического проекта","столкнулась с перебоями поставок и временным ростом издержек","опубликовала результаты выше ожиданий аналитиков","столкнулась с фиксацией прибыли после сильного роста котировок"];return events[Math.floor((day+seed)/3)%events.length];}

function Flag({ country }: { country: Country }) {
  return <span className={`flag flag-${country.id}`} aria-label={`Флаг ${country.name}`}><i /></span>;
}

function Terrain({ detailed = false }: { detailed?: boolean }) {
  return <g className="terrain-layer"><path className="terrain-lowland" d="M42 218 C92 190 134 201 174 223 C216 247 257 247 298 226 C345 202 394 207 454 225 L454 312 L42 312 Z"/><path className="terrain-shadow" d="M70 151 C104 118 140 120 169 145 C196 168 223 174 252 152 C283 128 317 130 347 151 C379 174 404 165 434 143 L444 185 C408 204 377 207 343 190 C310 173 282 176 251 197 C216 220 188 210 158 190 C126 168 101 170 73 188 Z"/><path className="ridge major" d="M73 104 C91 78 107 75 123 98 C138 73 154 72 171 99 C188 67 209 69 226 98 C243 78 257 80 271 104"/><path className="ridge major second" d="M274 111 C292 77 309 75 327 103 C343 70 360 73 376 105 C392 82 407 87 426 116"/><path className="ridge light" d="M88 117 C101 99 112 98 124 115 M138 116 C150 95 160 97 171 117 M292 122 C306 99 316 100 327 119 M344 121 C356 99 366 102 378 120"/><path className="contour" d="M55 132 C89 108 126 110 155 129 C187 151 214 159 245 142 C276 124 304 124 337 141 C370 158 401 153 439 130"/><path className="contour" d="M52 154 C89 131 123 135 151 153 C184 175 214 183 247 165 C279 146 307 148 338 164 C369 180 400 177 442 153"/><path className="contour" d="M57 178 C94 155 125 160 157 178 C189 197 218 205 250 186 C283 167 311 170 343 186 C374 202 402 199 435 179"/><path className="river" d="M221 74 C218 100 228 113 218 138 C207 163 199 183 207 203 C215 223 231 232 239 251 C245 267 241 282 231 296"/><path className="river" d="M302 79 C293 105 298 126 313 146 C327 164 341 175 348 194 C355 213 351 231 342 248"/><path className="river thin" d="M156 108 C173 127 178 143 170 164 C163 181 168 198 181 214"/><ellipse className="lake" cx="145" cy="226" rx="19" ry="8"/><ellipse className="lake" cx="376" cy="214" rx="14" ry="6"/><path className="snow" d="M178 73 L191 59 L205 73 L194 79 Z M317 75 L329 60 L343 75 L333 81 Z"/>{detailed&&<g className="terrain-detail"><path d="M91 244 C119 231 141 231 164 244 M182 257 C211 246 232 247 254 259 M282 241 C311 229 337 230 360 243 M366 261 C390 250 411 251 430 260"/><path d="M108 199 C126 190 143 191 158 201 M344 201 C362 190 379 191 394 201"/></g>}</g>;
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


function CountryMap({ country, onCompany }: { country: Country; onCompany?: (company: CompanyPreview) => void }) {
  const scale = 2.15;
  const tx = 250 - country.capitalX * scale;
  const ty = 175 - country.capitalY * scale;
  return <div className="map-static country-map atlas">
    <div className="atlas-head"><span>ФИЗИЧЕСКАЯ КАРТА · {country.name.toUpperCase()}</span><span>СЕВЕР ↑</span></div>
    <svg viewBox="0 0 500 350" className="atlas-svg country-atlas-svg" role="img" aria-label={"Рельефная карта страны " + country.name + " с компаниями"}>
      <defs>
        <linearGradient id={"countryOcean-" + country.id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#164a63"/><stop offset="1" stopColor="#061b2b"/></linearGradient>
        <linearGradient id={"countryLand-" + country.id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d7c59f"/><stop offset=".5" stopColor="#a9a37f"/><stop offset="1" stopColor="#62745f"/></linearGradient>
        <filter id={"countryShadow-" + country.id}><feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity=".42"/></filter>
      </defs>
      <rect width="500" height="350" fill={"url(#countryOcean-" + country.id + ")"}/>
      <g transform={"translate(" + tx + " " + ty + ") scale(" + scale + ")"} filter={"url(#countryShadow-" + country.id + ")"}>
        <path d={country.mapPath} className="country-land-fill" style={{ fill: "url(#countryLand-" + country.id + ")" }}/>
        <path d={country.mapPath} className="country-coastline"/>
        <g className="terrain-layer"><path className="ridge" d="M76 89 C95 72 111 76 126 91 C141 70 159 73 174 91 C190 64 211 67 228 89 M275 90 C292 66 312 69 328 91 C344 63 365 68 380 92"/><path className="ridge light" d="M86 105 C101 88 114 92 126 105 M287 106 C302 88 315 91 328 105"/><path className="river" d="M220 73 C218 99 228 113 218 137 C208 161 199 182 207 202 C214 220 231 231 239 249 C245 264 241 279 232 293"/><path className="river" d="M303 76 C294 105 299 126 313 145 C327 164 341 174 348 193 C355 212 351 230 342 246"/><path className="river thin" d="M156 107 C174 126 178 143 170 163 C163 180 168 197 181 213"/></g>
        {country.companies.map(company => <g key={company.ticker} className="company-marker country-company-marker" onClick={e => { e.stopPropagation(); onCompany?.(company); }}><circle cx={company.x} cy={company.y} r="7"/><circle cx={company.x} cy={company.y} r="2.2"/><text x={company.x+9} y={company.y+3}>{company.ticker}</text></g>)}
        <g className="capital capital-active"><circle cx={country.capitalX} cy={country.capitalY} r="7"/><circle cx={country.capitalX} cy={country.capitalY} r="2.4"/><text x={country.capitalX+10} y={country.capitalY-9}>{country.capital}</text></g>
      </g>
      <g className="map-overlay-label"><text x="18" y="28">{country.region}</text><text x="18" y="48">ГОРЫ · РЕКИ · ГОРОДА · КОМПАНИИ</text></g>
    </svg>
    <div className="map-key"><span><b className="dot"/> столица</span><span><b className="mount"/> рельеф</span><span><b className="company-dot"/> публичная компания · нажми</span></div>
  </div>;
}

function WorldPreview() {
  return <div className="map-static world-preview atlas">
    <div className="atlas-head"><span>ЭКОНОМИЧЕСКАЯ КАРТА МИРА</span><span>5 СТРАН · 1 ВАЛЮТА</span></div>
    <svg viewBox="0 0 500 350" className="atlas-svg">
      <defs><linearGradient id="worldOcean" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#15506b"/><stop offset="1" stopColor="#051a2a"/></linearGradient></defs>
      <rect width="500" height="350" fill="url(#worldOcean)"/>
      {countries.map(c => <path key={c.id} d={c.mapPath} style={{ fill: c.color }} className="world-country"/>)}
      {countries.map(c => <g key={c.id} className="world-label"><circle cx={c.capitalX} cy={c.capitalY} r="5"/><text x={c.capitalX+8} y={c.capitalY+3}>{c.name}</text></g>)}
      <path className="trade-route" d="M91 130 C151 126 191 151 222 168 C266 193 305 197 344 181 C376 168 401 156 421 165"/>
      <path className="trade-route alt" d="M117 252 C168 242 205 250 239 265 C282 284 322 278 370 249"/>
    </svg>
    <div className="world-preview-footer"><span>Славория · Лирания · Дарваст · Эстравия · Саверния</span><b>VLR · валор</b></div>
  </div>;
}
function AuthScreen({ onContinue }: { onContinue:(name:string)=>void }) {
  const [name,setName]=useState("");
  const [register,setRegister]=useState(true);
  return <div className="auth-screen">
    <div className="auth-panel">
      <div className="brand large"><div className="brand-mark">MA</div><div><b>MarketArena</b><small>ECONOMIC LIFE & MARKET SIMULATOR</small></div></div>
      <div className="auth-copy"><span className="eyebrow">НАЧАЛО ИГРЫ</span><h1>Построй капитал<br/><em>с нуля.</em></h1><p>Работа, расходы, накопления, компании и рынок — одна игровая система, в которой твои решения постепенно меняют финансовую историю.</p></div>
      <div className="auth-tabs"><button className={register?"active":""} onClick={()=>setRegister(true)}>Регистрация</button><button className={!register?"active":""} onClick={()=>setRegister(false)}>Войти</button></div>
      <label className="field"><span>Имя игрока</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Например, Алексей"/></label>
      <button className="primary" disabled={!name.trim()} onClick={()=>onContinue(name.trim())}>{register?"Создать профиль":"Продолжить"} <b>→</b></button>
      <div className="auth-note">Профиль офлайн-режима хранится локально. Online будет добавлен отдельным этапом.</div>
    </div>
    <div className="auth-art"><WorldPreview/></div>
  </div>;
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

function MiniChart({points}:{points:number[]}) {
  const min=Math.min(...points),max=Math.max(...points),range=Math.max(1,max-min);
  const path=points.map((p,i)=>(i/(points.length-1))*500+","+(116-((p-min)/range)*98)).join(" ");
  return <svg className="mini-chart" viewBox="0 0 500 130" preserveAspectRatio="none"><path d="M0 116H500M0 86H500M0 56H500M0 26H500" className="grid-line"/><polyline points={path} fill="none" stroke="currentColor" strokeWidth="3" vectorEffect="non-scaling-stroke"/></svg>;
}

function CompanyChart({company,points}:{company:CompanyPreview;points:number[]}) {
  const min=Math.min(...points), max=Math.max(...points), range=Math.max(1,max-min);
  const path=points.map((p,i)=>`${(i/(points.length-1))*500},${112-((p-min)/range)*92}`).join(" ");
  return <div className="company-chart">
    <div className="chart-range"><span>90 ИГРОВЫХ ДНЕЙ</span><b>{points[points.length-1].toLocaleString("ru-RU")} VLR</b></div>
    <svg viewBox="0 0 500 130" preserveAspectRatio="none" aria-label={`История котировки ${company.ticker}`}>
      <path d="M0 112H500M0 82H500M0 52H500M0 22H500" className="grid-line"/>
      <polyline points={path} fill="none" stroke="currentColor" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
    </svg>
  </div>;
}

function Panel({title,eyebrow,children}:{title:string;eyebrow:string;children:ReactNode}){return <div className="game-panel"><div className="panel-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>{children}</div>;}

function GameScreen({player,country,difficulty,onRestart}:{player:string;country:Country;difficulty:string;onRestart:()=>void}) {
  const [tab,setTab]=useState<GameTab>("overview");
  const [cash,setCash]=useState(difficulty==="easy"?5000000:difficulty==="hard"?50000:500000);
  const [holdings,setHoldings]=useState<Record<string,number>>({});
  const [day,setDay]=useState(1);
  const [notice,setNotice]=useState("Сегодня доступны работа, рынок и первые инвестиции.");
  const [selectedCompany,setSelectedCompany]=useState<CompanyPreview|null>(null);
  const [jobCooldown,setJobCooldown]=useState<string|null>(null);
  const [transactions,setTransactions]=useState<Transaction[]>([]);

  const marketEvent=(company:CompanyPreview, atDay:number)=>{
    const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);
    const events=[
      {headline:"новый экспортный контракт улучшил прогноз выручки",impact:0.032},
      {headline:"рост стоимости сырья усилил давление на маржу",impact:-0.027},
      {headline:"компания объявила программу расширения мощностей",impact:0.021},
      {headline:"слабый спрос заставил рынок пересмотреть прогнозы",impact:-0.024},
      {headline:"регулятор одобрил важный отраслевой проект",impact:0.017},
      {headline:"перебои в цепочке поставок увеличили издержки",impact:-0.019},
      {headline:"инвесторы позитивно оценили результаты квартала",impact:0.028},
      {headline:"рынок зафиксировал прибыль после сильного роста",impact:-0.014}
    ];
    const index=Math.floor((atDay+seed)/3)%events.length;
    const event=events[index];
    const sectorBias=company.sector.includes("Нефть")||company.sector.includes("Металлы") ? Math.sin((atDay+seed)*0.09)*0.012 : Math.sin((atDay+seed)*0.07)*0.009;
    return {headline:event.headline,impact:event.impact+sectorBias};
  };
  const priceFor=(company:CompanyPreview, atDay=day)=>{
    const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);
    const base=6500+(seed%18)*850;
    const wave=Math.sin((atDay+seed)*0.37)*0.045+Math.cos((atDay+seed)*0.13)*0.025;
    const trend=Math.sin((atDay+seed)*0.021)*0.08;
    const event=marketEvent(company,atDay).impact;
    return Math.max(2500,Math.round(base*(1+wave+trend+event)/50)*50);
  };
  const priceChange=(company:CompanyPreview)=>{
    const oldDay=Math.max(1,day-1);
    const old=priceFor(company,oldDay);
    return ((priceFor(company,day)-old)/old)*100;
  };
  const history=(company:CompanyPreview)=>Array.from({length:90},(_,i)=>priceFor(company,Math.max(1,day-89+i)));
  const portfolioValue=useMemo(()=>country.companies.reduce((sum,c)=>sum+(holdings[c.ticker]||0)*priceFor(c),0),[country.companies,holdings,day]);
  const totalWealth=cash+portfolioValue;
  const buy=(company:CompanyPreview,quantity=1)=>{
    const price=priceFor(company),cost=price*quantity;
    if(cash<cost){setNotice("Недостаточно денег: нужно "+cost.toLocaleString("ru-RU")+" VLR.");return;}
    setCash(v=>v-cost);setHoldings(v=>({...v,[company.ticker]:(v[company.ticker]||0)+quantity}));
    setTransactions(v=>[{day,type:"BUY" as const,ticker:company.ticker,quantity,price},...v].slice(0,30));
    setNotice("Куплено "+quantity+" "+company.ticker+" по "+price.toLocaleString("ru-RU")+" VLR. Баланс списан: -"+cost.toLocaleString("ru-RU")+" VLR.");
  };
  const sell=(company:CompanyPreview,quantity=1)=>{
    const owned=holdings[company.ticker]||0;
    if(owned<quantity){setNotice("У тебя нет "+quantity+" акций "+company.ticker+" для продажи.");return;}
    const price=priceFor(company),proceeds=price*quantity;setCash(v=>v+proceeds);setHoldings(v=>({...v,[company.ticker]:owned-quantity}));
    setTransactions(v=>[{day,type:"SELL" as const,ticker:company.ticker,quantity,price},...v].slice(0,30));
    setNotice("Продано "+quantity+" "+company.ticker+" по "+price.toLocaleString("ru-RU")+" VLR. Баланс зачислен: +"+proceeds.toLocaleString("ru-RU")+" VLR.");
  };
  const work=(id:string,pay:number)=>{setCash(v=>v+pay);setJobCooldown(id);setNotice("Работа завершена: +"+pay.toLocaleString("ru-RU")+" VLR.");setTimeout(()=>setJobCooldown(null),700);};
  const advance=()=>{setDay(v=>v+1);setNotice("Новый игровой день: котировки, новости и стоимость портфеля обновились.");};
  const tabs:[GameTab,string][]=[["overview","Обзор"],["exchange","Биржа"],["portfolio","Портфель"],["companies","Компании"],["life","Жизнь"],["map","Карта"],["news","Новости"]];
  const cashPct=Math.min(100,Math.max(8,cash/(totalWealth||1)*100));

  return <div className="game-shell">
    <header className="game-topbar"><button className="game-brand" onClick={()=>setTab("overview")}><span>MA</span><b>MarketArena</b></button><nav>{tabs.map(([id,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}>{label}</button>)}</nav><div className="game-right"><span className="offline-pill">OFFLINE</span><span>ДЕНЬ {day}</span><b>{totalWealth.toLocaleString("ru-RU")} VLR</b></div></header>
    <div className="game-body">
      <aside className="game-sidebar"><div className="player-card"><span className="avatar">{player.slice(0,1).toUpperCase()}</span><div><b>{player}</b><small>Частный инвестор</small></div></div><div className="country-mini"><Flag country={country}/><div><b>{country.name}</b><small>{country.capital} · {commonCurrency.symbol}</small></div></div><div className="side-title">ИГРА</div>{tabs.map(([id,label])=><button key={id} className={tab===id?"side-active":""} onClick={()=>setTab(id)}>{label}<span>›</span></button>)}<div className="side-bottom"><small>КЛАСС</small><b>{difficultyLevels.find(x=>x.id===difficulty)?.name}</b><button onClick={onRestart}>Новая игра</button></div></aside>
      <main className="game-main">
        {tab==="overview"&&<><div className="game-heading"><div><span className="eyebrow">ДЕНЬ {day} · {country.name.toUpperCase()}</span><h1>{country.name}: экономический центр</h1><p>{notice}</p></div><button className="day-button" onClick={advance}>Следующий день →</button></div>
          <div className="hero-map-grid">
            <section className="market-map-card"><div className="card-head"><div><span>РЕЛЬЕФ · ЭКОНОМИКА · КОМПАНИИ</span><h2>Карта {country.name}</h2></div><b className="positive">{priceChange(country.companies[0])>=0?"+":""}{priceChange(country.companies[0]).toFixed(2)}%</b></div><CountryMap country={country} onCompany={setSelectedCompany}/></section>
            <section className="capital-card"><span>ОБЩИЙ КАПИТАЛ</span><strong>{totalWealth.toLocaleString("ru-RU")} VLR</strong><small>Свободные деньги · {cash.toLocaleString("ru-RU")} VLR</small><div className="money-bar"><i style={{width:cashPct+"%"}}/></div><div className="capital-actions"><button onClick={()=>setTab("life")}>Заработать</button><button onClick={()=>setTab("exchange")}>Инвестировать</button></div></section>
            <section className="jobs-card"><div className="card-head"><div><span>РАБОТА И ДОХОД</span><h2>Заработать на следующие сделки</h2></div><button onClick={()=>setTab("life")}>Все →</button></div>{jobs.map(j=><div className="job-row" key={j.id}><div><b>{j.title}</b><small>{j.time} · {j.text}</small></div><button disabled={jobCooldown===j.id} onClick={()=>work(j.id,j.pay)}>+{j.pay.toLocaleString("ru-RU")} VLR</button></div>)}</section>
            <section className="companies-card"><div className="card-head"><div><span>ПУБЛИЧНЫЕ КОМПАНИИ</span><h2>Компании на карте {country.name}</h2></div><button onClick={()=>setTab("companies")}>Открыть все →</button></div><div className="ticker-grid">{country.companies.map(c=><button className="ticker-row" key={c.ticker} onClick={()=>setSelectedCompany(c)}><b>{c.ticker}</b><span>{c.name}<small>{c.sector}</small></span><strong className={priceChange(c)>=0?"gain":"loss"}>{priceChange(c)>=0?"+":""}{priceChange(c).toFixed(2)}%</strong></button>)}</div></section>
          <section className="home-news-card"><div className="card-head"><div><span>ЛЕНТА РЫНКА · ДЕНЬ {day}</span><h2>Что происходит в экономике</h2></div><button onClick={()=>setTab("news")}>Все новости →</button></div><div className="home-news-list">{country.companies.slice(0,3).map(c=>{const e=marketEvent(c,day);return <button key={c.ticker} onClick={()=>setSelectedCompany(c)}><span className={e.impact>=0?"news-signal positive":"news-signal negative"}>{e.impact>=0?"▲":"▼"}</span><div><b>{c.name}</b><p>{e.headline}</p></div><strong className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"+":""}{(e.impact*100).toFixed(1)}%</strong></button>})}</div></section>
          </div></>}
        {tab==="exchange"&&<Panel title={"Биржа · "+country.name} eyebrow="MARKET"><p className="panel-lead">Рабочий терминал рынка: выбери тикер, изучи график, мультипликаторы и последний информационный импульс, затем совершай сделку.</p><div className="exchange-overview"><div><span>ИНДЕКС РЫНКА</span><b>{(1000+country.companies.reduce((s,c)=>s+priceChange(c),0)*3).toFixed(1)}</b><small>динамика за день</small></div><div><span>КОМПАНИЙ</span><b>{country.companies.length}</b><small>публичный рынок</small></div><div><span>СЕГОДНЯ</span><b>ДЕНЬ {day}</b><small>следующий тик →</small></div><div><span>СВОБОДНЫЕ ДЕНЬГИ</span><b>{cash.toLocaleString("ru-RU")} VLR</b><small>доступно для сделок</small></div></div><div className="exchange-spotlight">{(()=>{const focus=selectedCompany??country.companies[0];const m=companyProfile(focus,country);return <><div className="spotlight-head"><div><span className="ticker">{focus.ticker}</span><h2>{focus.name}</h2><p>{focus.sector} · {m.headquarters}</p></div><div className="spotlight-price"><b>{priceFor(focus).toLocaleString("ru-RU")} VLR</b><span className={priceChange(focus)>=0?"gain":"loss"}>{priceChange(focus)>=0?"+":""}{priceChange(focus).toFixed(2)}%</span></div></div><CompanyChart company={focus} points={history(focus)}/><div className="spotlight-bottom"><div><span>P / E</span><b>{m.pe}</b></div><div><span>P / B</span><b>{m.pb}</b></div><div><span>ДИВИДЕНД</span><b>{m.dividendYield}</b></div><div className="spotlight-news"><span>ПОСЛЕДНИЙ ФАКТОР</span><b>{eventLabel(focus,day)}</b></div><div className="spotlight-actions"><button onClick={()=>sell(focus)} disabled={!holdings[focus.ticker]}>Продать</button><button className="primary small" onClick={()=>buy(focus)}>Купить</button></div></div></>})()}</div><MiniChart points={history(country.companies[0])}/><div className="table-card"><div className="table-row table-head"><b>ТИКЕР</b><span>КОМПАНИЯ</span><span>ОТРАСЛЬ</span><strong>КОТИРОВКА</strong><em>СДЕЛКА</em></div>{country.companies.map(c=>{const p=priceFor(c),ch=priceChange(c),qty=holdings[c.ticker]||0;return <div className="table-row" key={c.ticker}><button className="ticker-link" onClick={()=>setSelectedCompany(c)}>{c.ticker}</button><span>{c.name}</span><span>{c.sector}</span><strong>{p.toLocaleString("ru-RU")} VLR <small className={ch>=0?"gain":"loss"}>{ch>=0?"+":""}{ch.toFixed(2)}%</small></strong><div className="trade-actions"><button onClick={()=>buy(c)}>Купить</button><button onClick={()=>sell(c)} disabled={!qty}>Продать</button><b>{qty} шт.</b></div></div>})}</div></Panel>}
        {tab==="portfolio"&&<Panel title="Портфель" eyebrow="YOUR CAPITAL"><div className="portfolio-summary"><div><span>СТОИМОСТЬ АКТИВОВ</span><b>{portfolioValue.toLocaleString("ru-RU")} VLR</b></div><div><span>СВОБОДНЫЕ ДЕНЬГИ</span><b>{cash.toLocaleString("ru-RU")} VLR</b></div><div><span>ВСЕГО</span><b>{totalWealth.toLocaleString("ru-RU")} VLR</b></div></div><div className="table-card portfolio-table">{country.companies.filter(c=>(holdings[c.ticker]||0)>0).map(c=><div className="table-row" key={c.ticker}><button className="ticker-link" onClick={()=>setSelectedCompany(c)}>{c.ticker}</button><span>{c.name}</span><span>{holdings[c.ticker]} акций</span><strong>{(holdings[c.ticker]*priceFor(c)).toLocaleString("ru-RU")} VLR</strong><div className="trade-actions"><button onClick={()=>buy(c)}>+ Купить</button><button onClick={()=>sell(c)}>- Продать</button></div></div>)}{portfolioValue===0&&<div className="empty-state">Портфель пуст. Открой «Биржу» и купи первую акцию.</div>}</div></Panel>}
        {tab==="companies"&&<Panel title={"Компании · "+country.name} eyebrow="PUBLIC COMPANIES"><p className="panel-lead">Каждая компания получает собственную карточку, котировку и профиль CEO. Нажми на карточку для подробностей.</p><div className="company-grid">{country.companies.map(c=><article className="company-focus-card" key={c.ticker} onClick={()=>setSelectedCompany(c)}><div className="company-focus-top"><span className="ticker">{c.ticker}</span><span className="sector-chip">{c.sector}</span></div><h3>{c.name}</h3><p>{c.note}</p><div className="company-ceo"><CEOAvatar company={c}/><div><span className="eyebrow">CEO · {c.ceoRole}</span><b>{c.ceo}</b><small>{c.ceoAge} лет</small></div></div><div className="company-focus-footer"><span>Котировка <b>{priceFor(c).toLocaleString("ru-RU")} VLR</b></span><button onClick={e=>{e.stopPropagation();buy(c)}}>Купить 1 акцию</button></div></article>)}</div></Panel>}
        {tab==="life"&&<Panel title="Жизнь" eyebrow="CAREER & LIFE"><p className="panel-lead">До большого капитала можно дойти через работу: каждый игровой день ты выбираешь, где заработать деньги для следующих инвестиций.</p>{jobs.map(j=><div className="life-job" key={j.id}><div><b>{j.title}</b><span>{j.text}</span></div><strong>{j.pay.toLocaleString("ru-RU")} VLR</strong><button disabled={jobCooldown===j.id} onClick={()=>work(j.id,j.pay)}>Работать</button></div>)}</Panel>}
        {tab==="map"&&<Panel title={"Карта "+country.name} eyebrow="ATLAS"><p className="panel-lead">Здесь показана именно выбранная страна: её рельеф, реки, столица и расположение публичных компаний.</p><CountryMap country={country} onCompany={setSelectedCompany}/></Panel>}
        {tab==="news"&&<Panel title="Новости" eyebrow="ECONOMIC NEWS"><p className="panel-lead">Новости генерируются из игрового дня и напрямую входят в модель котировок. Поэтому события на рынке — не декоративный текст.</p><div className="news-list">{country.companies.slice(0,3).map((c,i)=>{const e=marketEvent(c,day);return <article key={c.ticker}><span>{String(8+i*3).padStart(2,"0")}:30</span><div><b>{c.name}: {e.headline}</b><p>Котировка {c.ticker}: <strong className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"+":""}{(e.impact*100).toFixed(2)}%</strong> фактор события. Итоговая цена учитывает тренд, волатильность и этот информационный импульс.</p></div><strong>{c.sector.toUpperCase()}</strong></article>})}</div><div className="news-transactions"><span className="eyebrow">ИСТОРИЯ СДЕЛОК</span>{transactions.slice(0,6).map((t,i)=><div key={i}><b className={t.type==="BUY"?"loss":"gain"}>{t.type}</b><span>День {t.day} · {t.ticker} · {t.quantity} шт.</span><strong>{(t.price*t.quantity).toLocaleString("ru-RU")} VLR</strong></div>)}{transactions.length===0&&<p>Сделок пока нет. Первая покупка появится здесь сразу после подтверждения.</p>}</div></Panel>}
      </main>
    </div>
    {selectedCompany&&<div className="company-modal-backdrop" onClick={()=>setSelectedCompany(null)}><div className="company-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelectedCompany(null)}>×</button><div className="modal-company-head"><CEOAvatar company={selectedCompany}/><div><span className="ticker">{selectedCompany.ticker}</span><h2>{selectedCompany.name}</h2><p>{selectedCompany.sector} · публичная компания · {country.name}</p></div></div><div className="modal-grid"><div><span className="eyebrow">О КОМПАНИИ</span><p className="company-description">{companyProfile(selectedCompany,country).description}</p><div className="company-metrics">{[["КАПИТАЛИЗАЦИЯ",companyProfile(selectedCompany,country).marketCap],["ВЫРУЧКА",companyProfile(selectedCompany,country).revenue],["ЧИСТАЯ ПРИБЫЛЬ",companyProfile(selectedCompany,country).netProfit],["P / E",companyProfile(selectedCompany,country).pe],["P / B",companyProfile(selectedCompany,country).pb],["ДИВИДЕНД",companyProfile(selectedCompany,country).dividendYield]].map(([label,value])=><div key={label}><span>{label}</span><b>{value}</b></div>)}</div><CompanyChart company={selectedCompany} points={history(selectedCompany)}/><div className="quote-box"><span>ТЕКУЩАЯ КОТИРОВКА</span><b>{priceFor(selectedCompany).toLocaleString("ru-RU")} VLR</b><small className={priceChange(selectedCompany)>=0?"gain":"loss"}>{priceChange(selectedCompany)>=0?"+":""}{priceChange(selectedCompany).toFixed(2)}% за день</small><small>Дивидендная доходность · {companyProfile(selectedCompany,country).dividendYield} годовых</small></div><div className="modal-buy"><span>В портфеле: <b>{holdings[selectedCompany.ticker]||0} шт.</b></span><div><button className="secondary-action" onClick={()=>sell(selectedCompany)}>Продать</button><button className="primary small" onClick={()=>buy(selectedCompany)}>Купить акцию</button></div></div></div><div className="ceo-profile"><span className="eyebrow">CEO · ПЕРСОНАЖ</span><h3>{selectedCompany.ceo}</h3><b>{selectedCompany.ceoAge} лет · {selectedCompany.ceoRole}</b><p>{selectedCompany.ceoBio}</p><p><strong>Стратегия:</strong> {companyProfile(selectedCompany,country).strategy}</p><div className="company-facts"><span>Основана</span><b>{companyProfile(selectedCompany,country).founded}</b><span>Штат</span><b>{companyProfile(selectedCompany,country).employees}</b><span>Штаб-квартира</span><b>{companyProfile(selectedCompany,country).headquarters}</b><span>Ресурсы</span><b>{companyProfile(selectedCompany,country).materials}</b></div><div className="ceo-tags"><span>Биография</span><span>Репутация</span><span>Стиль управления</span></div></div></div></div></div>}
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
