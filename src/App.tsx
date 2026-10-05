import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { commonCurrency, countries, difficultyLevels, type CompanyPreview, type Country } from "./data/world";
import { Atlas3D } from "./Atlas3D";

type Screen = "auth" | "mode" | "country" | "difficulty" | "game";
type GameTab = "overview" | "exchange" | "portfolio" | "companies" | "life" | "map" | "news" | "events" | "history" | "updates";
type Transaction = { day:number; type:"BUY"|"SELL"; ticker:string; quantity:number; price:number };
type GameSave = {
  player:string; countryId:string; difficulty:string; cash:number; holdings:Record<string,number>;
  day:number; transactions:Transaction[]; tab:GameTab; savedAt:string;
};

const PATCH_NOTES = [
  { version:"v1.0.1", date:"5 октября 2026", title:"Обновление рынка и атласа", added:["рабочая биржа и сделки","карта выбранной страны с компаниями","профили компаний и CEO"], improved:["dashboard","адаптивная сетка","графики котировок"], fixed:["клики по компаниям","переполнение чисел","сохранение офлайн-игры"] },
  { version:"v1.0.0", date:"1 октября 2026", title:"Офлайн-основа", added:["профиль игрока","выбор страны","классы старта","первые рабочие места и рынок"], improved:[], fixed:[] }
] as const;

const jobs = [
  { id: "analyst", title: "Помощник аналитика", pay: 18000, time: "2 часа", text: "Разбор отчётов и исследование компаний." },
  { id: "logistics", title: "Курьер / логистика", pay: 12500, time: "3 часа", text: "Стабильный доход в транспортной отрасли." },
  { id: "freelance", title: "Фриланс-специалист", pay: 24000, time: "4 часа", text: "Высокий доход, но спрос зависит от экономики." }
];

function companyProfile(company: CompanyPreview, country: Country) {
  const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);
  const materialMap:Record<string,string>={"Металлы":"железная руда, уголь, цветные концентраты","Энергетика":"газ, вода, сетевые мощности и топливо","Финансы":"капитал, депозиты и корпоративный кредит","Машиностроение":"сталь, электроника и промышленное оборудование","Судоходство":"топливо, контейнеры и портовая инфраструктура","Страхование":"капитал, перестрахование и данные о рисках","Порты":"земля, склады, контейнерные мощности","Нефть":"нефть, газ и нефтехимическое сырьё","Логистика":"топливо, вагоны, дороги и складские площади","Биотех":"лабораторное оборудование, реагенты и научные кадры","Технологии":"серверы, электроника и инженерные кадры","Электроника":"кремний, медь и высокоточные компоненты","Робототехника":"электроника, приводы и промышленное ПО","Агро":"зерно, удобрения, вода и сельхозземля","Ритейл":"продукты, логистика и потребительский спрос"};
  const sectorNarrative:Record<string,string>={"Металлы":"Производит базовые материалы для строительства, транспорта и тяжёлой промышленности, поэтому чувствительна к ценам сырья и экспортному спросу.","Энергетика":"Управляет критической инфраструктурой и генерирующими активами. Денежный поток устойчив, но капитальные затраты велики.","Финансы":"Зарабатывает на кредитовании, комиссиях и управлении капиталом. Ключевые риски — стоимость денег и качество кредитного портфеля.","Машиностроение":"Поставляет оборудование для заводов и инфраструктуры. Рост инвестиций ускоряет заказы, а рецессия сокращает backlog.","Судоходство":"Зарабатывает на международных перевозках. Ставки фрахта, цены топлива и загрузка портов определяют маржу.","Страхование":"Монетизирует управление риском через премии и инвестиционный портфель. Результаты зависят от убытков и доходности резервов.","Порты":"Владеет терминалами и складской инфраструктурой. Торговый поток определяет загрузку активов и операционную маржу.","Нефть":"Вертикально связана с добычей и переработкой. Прибыль меняется вместе с ценами на энергоносители и экспортными квотами.","Логистика":"Организует движение грузов между ресурсными регионами, портами и промышленными центрами. Сильнее рынка реагирует на торговые объёмы.","Биотех":"Финансирует долгий цикл исследований и коммерциализации. Потенциал роста высок, но сроки создают волатильность.","Технологии":"Строит цифровую инфраструктуру для бизнеса. Рост клиентов поддерживает маржу, а конкуренция требует постоянных инвестиций.","Электроника":"Производит высокоточные компоненты. Цикл запасов и доступность компонентов критичны для прибыли.","Робототехника":"Автоматизирует производство и склады. Главный драйвер — инвестиционный цикл предприятий.","Агро":"Контролирует переработку и сбыт продовольствия. Урожай, погода и цены на удобрения формируют волатильность.","Ритейл":"Работает с большим оборотом и тонкой маржой. Спрос, инфляция и логистика напрямую отражаются в прибыли."};
  return {founded:1974+(seed%39),employees:(1.2+(seed%88)/10).toFixed(1).replace(".",",")+" тыс.",headquarters:country.capital,revenue:(4.8+(seed%120)/10).toFixed(1).replace(".",",")+" млрд VLR",netProfit:(0.42+(seed%38)/20).toFixed(2).replace(".",",")+" млрд VLR",marketCap:(18+seed%140).toFixed(0)+" млрд VLR",pe:(7+seed%24).toFixed(1)+"×",pb:(0.8+(seed%19)/10).toFixed(1)+"×",dividendYield:(1.6+(seed%32)/10).toFixed(1).replace(".",",")+"%",materials:materialMap[company.sector]??"капитал, энергия и квалифицированный труд",strategy:"Рост выручки через расширение мощностей, цифровизацию операций и дисциплину капитала.",goals:"Увеличить выручку на 8–12%, удержать долговую нагрузку под контролем, открыть новые экспортные направления и повысить эффективность активов.",description:company.name+" — публичный игрок "+country.name+" с фокусом на сектор «"+company.sector+"». "+(sectorNarrative[company.sector]??"Компания работает внутри ключевых экономических цепочек страны и союза.")};
}
function eventLabel(company:CompanyPreview,day:number){const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);const events=["подписала новый экспортный контракт и повысила прогноз выручки","зафиксировала рост себестоимости и пересмотрела прогноз маржи","объявила расширение мощностей и программу капитальных инвестиций","увидела замедление спроса на ключевых рынках","получила регуляторное одобрение стратегического проекта","столкнулась с перебоями поставок и временным ростом издержек","опубликовала результаты выше ожиданий аналитиков","столкнулась с фиксацией прибыли после сильного роста котировок"];return events[Math.floor((day+seed)/3)%events.length];}

const countryLore:Record<string,{overview:string;geography:string;economy:string;strengths:string;risks:string;investorAdvantages:string[];investorRisks:string[]}>={
slavoriya:{overview:"Славория — крупнейшая промышленная держава материка. Высокая урбанизация и развитая банковская система поддерживают внутренний спрос, а металлургия и машиностроение связывают страну с внешними рынками.",geography:"Центральная часть материка: горный север, широкие речные долины и выход к северным морским торговым путям.",economy:"Промышленность, энергетика и финансы формируют ядро ВВП; государство активно инвестирует в инфраструктуру и модернизацию производств.",strengths:"Большой внутренний рынок, энергетическая база, квалифицированные кадры и развитая финансовая инфраструктура.",risks:"Циклический спрос на металлы, высокая капиталоёмкость промышленности и чувствительность банков к стоимости кредита.",investorAdvantages:["Сильный внутренний спрос снижает зависимость от одного экспортного рынка.","Промышленная база создаёт спрос на металлургию, энергетику и машиностроение.","Развитая финансовая система поддерживает кредитование и инвестиции.","Подходит инвестору, который ищет сочетание промышленного роста и относительно понятных денежных потоков."],investorRisks:["Металлы и машиностроение цикличны: при рецессии прибыль может снижаться быстрее рынка.","Высокие капитальные затраты делают компании чувствительными к ставкам и стоимости кредита.","Банки уязвимы к ухудшению качества кредитов при экономическом спаде."]},
lirania:{overview:"Лирания — морская торговая экономика с крупнейшими портами союза. Её благосостояние тесно связано с международной торговлей, страхованием и движением капитала.",geography:"Западное побережье с глубоководными бухтами, горными районами в центре и плотной сетью рек, ведущих к портам.",economy:"Порты, судоходство, страхование и банки образуют единый логистико-финансовый кластер.",strengths:"Доступ к мировым торговым маршрутам, сильный финансовый сектор, портовая инфраструктура и сервисная экономика.",risks:"Зависимость от мирового товарооборота, ставок фрахта и внешних финансовых условий.",investorAdvantages:["Портовая инфраструктура получает выгоду от роста международной торговли.","Судоходство и страхование дают доступ к глобальному экономическому циклу.","Финансовый сектор позволяет инвестировать в банки, страховщиков и инфраструктуру.","Подходит инвестору, который делает ставку на торговлю, логистику и финансовые услуги."],investorRisks:["Падение мировой торговли быстро сокращает объёмы перевозок и загрузку портов.","Фрахтовые ставки волатильны и могут резко менять прибыль судоходных компаний.","Внешние ставки и движение капитала сильнее влияют на местный финансовый сектор."]},
darvast:{overview:"Дарваст — ресурсная держава востока. Огромная сырьевая база обеспечивает экспортную выручку, но экономика остаётся чувствительной к мировым ценам на нефть и металлы.",geography:"Восточные плато и пустынные районы чередуются с горными хребтами и крупными бассейнами полезных ископаемых.",economy:"Нефть, металлы, энергетика и тяжёлая промышленность поддерживаются железнодорожными экспортными коридорами.",strengths:"Большие запасы сырья, дешёвая энергетическая база и развитая тяжёлая промышленность.",risks:"Цены на сырьё, высокое транспортное плечо и зависимость бюджета от экспортных доходов.",investorAdvantages:["Ресурсная база даёт компаниям конкурентное преимущество по доступу к сырью и энергии.","Рост цен на нефть и металлы способен быстро увеличивать экспортную выручку.","Инфраструктурные проекты создают спрос на логистику и тяжёлую промышленность.","Подходит инвестору, который сознательно принимает сырьевой цикл ради потенциально высокой доходности."],investorRisks:["Котировки сырьевых компаний сильно зависят от мировых цен.","Падение экспортных доходов может одновременно давить на бюджет, спрос и корпоративную прибыль.","Большие расстояния повышают логистические расходы и риск перебоев поставок."]},
estraviya:{overview:"Эстравия — технологический центр союза. Университеты и исследовательские кластеры сформировали среду для биотеха, электроники и робототехники.",geography:"Южное побережье с горными районами на западе и плодородными долинами вокруг технологических городов.",economy:"Экспорт высокотехнологичной продукции сочетается с венчурным капиталом, научными разработками и производством компонентов.",strengths:"Человеческий капитал, университеты, инновационная инфраструктура и высокая добавленная стоимость экспорта.",risks:"Длинный цикл окупаемости исследований, высокая конкуренция и зависимость от импорта отдельных компонентов.",investorAdvantages:["Высокая добавленная стоимость позволяет технологическим компаниям быстро наращивать прибыль при успешном продукте.","Университеты и кадры поддерживают поток новых технологий и стартапов.","Робототехника и электроника выигрывают от долгосрочного роста производительности.","Подходит инвестору, готовому терпеть повышенную волатильность ради роста."],investorRisks:["Биотех и глубокие технологии могут годами не приносить прибыли.","Компании зависят от дорогих компонентов и глобальных цепочек поставок.","Высокая оценка перспективных компаний делает акции чувствительными к разочарованиям в отчётности."]},
saverniya:{overview:"Саверния — агропромышленный центр с крупным потребительским рынком. Реки и сухопутные коридоры позволяют связывать сельскохозяйственные районы с городами и экспортными терминалами.",geography:"Юго-восточные равнины, широкие речные долины, плодородные земли и длинная береговая линия.",economy:"Агро, пищевая переработка, логистика и розничная торговля образуют устойчивую цепочку от поля до конечного потребителя.",strengths:"Плодородные земли, крупное население, развитая логистика и стабильный внутренний спрос.",risks:"Погода и урожайность, стоимость перевозок и инфляция потребительского спроса.",investorAdvantages:["Плодородные земли создают структурное преимущество агробизнесу и пищевой переработке.","Большой внутренний рынок поддерживает розничные компании даже при слабом экспорте.","Логистика связывает сельское хозяйство, города и экспортные терминалы.","Подходит инвестору, который предпочитает потребительский и аграрный спрос вместо сырьевого риска."],investorRisks:["Погода и урожайность способны резко менять прибыль аграрных компаний.","Инфляция продуктов питания давит на реальный спрос и маржу ритейла.","Транспортные расходы напрямую влияют на себестоимость агро- и логистических компаний."]}
};
function Flag({ country }: { country: Country }) {
  return <span className={`flag flag-${country.id}`} aria-label={`Флаг ${country.name}`}><i /></span>;
}

function CEOAvatar({company}:{company:CompanyPreview}) {
  const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);
  const hair=["short","side","wave","crop"][seed%4];
  const suit=["navy","slate","sand","black"][Math.floor(seed/4)%4];
  return <div className={`ceo-avatar modern-portrait portrait-${hair} suit-${suit} tone-${seed%4}`} aria-label={`Портрет CEO ${company.ceo}`}>
    <div className="portrait-bg"/><div className="portrait-shoulders"/><div className="portrait-neck"/>
    <div className="portrait-face"><i className="portrait-ear left"/><i className="portrait-ear right"/><b className="portrait-hair"/><i className="portrait-eye left"/><i className="portrait-eye right"/><span className="portrait-nose"/><span className="portrait-mouth"/></div>
  </div>;
}
function Terrain({ detailed = false }: { detailed?: boolean }) {
  return <g className="terrain-layer"><path className="terrain-lowland" d="M42 218 C92 190 134 201 174 223 C216 247 257 247 298 226 C345 202 394 207 454 225 L454 312 L42 312 Z"/><path className="terrain-shadow" d="M70 151 C104 118 140 120 169 145 C196 168 223 174 252 152 C283 128 317 130 347 151 C379 174 404 165 434 143 L444 185 C408 204 377 207 343 190 C310 173 282 176 251 197 C216 220 188 210 158 190 C126 168 101 170 73 188 Z"/><path className="ridge major" d="M73 104 C91 78 107 75 123 98 C138 73 154 72 171 99 C188 67 209 69 226 98 C243 78 257 80 271 104"/><path className="ridge major second" d="M274 111 C292 77 309 75 327 103 C343 70 360 73 376 105 C392 82 407 87 426 116"/><path className="ridge light" d="M88 117 C101 99 112 98 124 115 M138 116 C150 95 160 97 171 117 M292 122 C306 99 316 100 327 119 M344 121 C356 99 366 102 378 120"/><path className="contour" d="M55 132 C89 108 126 110 155 129 C187 151 214 159 245 142 C276 124 304 124 337 141 C370 158 401 153 439 130"/><path className="contour" d="M52 154 C89 131 123 135 151 153 C184 175 214 183 247 165 C279 146 307 148 338 164 C369 180 400 177 442 153"/><path className="contour" d="M57 178 C94 155 125 160 157 178 C189 197 218 205 250 186 C283 167 311 170 343 186 C374 202 402 199 435 179"/><path className="river" d="M221 74 C218 100 228 113 218 138 C207 163 199 183 207 203 C215 223 231 232 239 251 C245 267 241 282 231 296"/><path className="river" d="M302 79 C293 105 298 126 313 146 C327 164 341 175 348 194 C355 213 351 231 342 248"/><path className="river thin" d="M156 108 C173 127 178 143 170 164 C163 181 168 198 181 214"/><ellipse className="lake" cx="145" cy="226" rx="19" ry="8"/><ellipse className="lake" cx="376" cy="214" rx="14" ry="6"/><path className="snow" d="M178 73 L191 59 L205 73 L194 79 Z M317 75 L329 60 L343 75 L333 81 Z"/>{detailed&&<g className="terrain-detail"><path d="M91 244 C119 231 141 231 164 244 M182 257 C211 246 232 247 254 259 M282 241 C311 229 337 230 360 243 M366 261 C390 250 411 251 430 260"/><path d="M108 199 C126 190 143 191 158 201 M344 201 C362 190 379 191 394 201"/></g>}</g>;
}
function AtlasMap({ selected, onSelect, showCompanies = false, onCompany }: { selected: string; onSelect: (id: string) => void; showCompanies?: boolean; onCompany?: (company: CompanyPreview) => void }) {
  return <Atlas3D countries={countries} selected={selected} onSelect={onSelect} showCompanies={showCompanies} onCompany={onCompany} />;
}

const sectorTone: Record<string,string> = {
  "Финансы":"finance","Энергетика":"energy","Металлы":"metals","Машиностроение":"industrial",
  "Судоходство":"shipping","Страхование":"insurance","Порты":"ports","Нефть":"oil",
  "Логистика":"logistics","Биотех":"biotech","Технологии":"technology","Электроника":"electronics",
  "Робототехника":"robotics","Агро":"agro","Ритейл":"retail","Недвижимость":"realestate",
  "Промышленность":"industry","Химия":"chemicals"
};
function sectorClass(sector:string){return "sector-"+(sectorTone[sector]??"default");}
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
    <div className="auth-visual" aria-hidden="true">
      <div className="auth-orbit orbit-a"/><div className="auth-orbit orbit-b"/>
      <div className="auth-visual-grid"/>
      <div className="auth-visual-core"><span>MA</span><b>ТВОЯ ЭКОНОМИЧЕСКАЯ<br/>ИСТОРИЯ</b><small>РЕШЕНИЯ · КАПИТАЛ · РЫНОК</small></div>
      <div className="auth-float auth-float-a"><span>КАПИТАЛ</span><b>СТАРТ С НУЛЯ</b><small>ЗАРАБАТЫВАЙ И КОПИ</small></div>
      <div className="auth-float auth-float-b"><span>РЫНОК</span><b>60 КОМПАНИЙ</b><small>ПОКУПАЙ · ПРОДАВАЙ · АНАЛИЗИРУЙ</small></div>
      <div className="auth-float auth-float-c"><span>МИР</span><b>5 СТРАН</b><small>ВЫБЕРИ СВОЮ ЭКОНОМИКУ</small></div>
    </div>
  </div>;
}

function ModeScreen({ onChoose }:{onChoose:(mode:"offline"|"online")=>void}) {
  return <div className="setup-screen"><div className="setup-inner"><div className="step">02 / 04</div><span className="eyebrow">РЕЖИМ ИГРЫ</span><h1>Выбери формат своей истории.</h1><p className="setup-lead">Личная экономика — твои деньги, работа, расходы и инвестиционные решения. Общий рынок — живой слой компаний и новостей, который связывает личный капитал с экономикой страны. Сейчас доступна офлайн-история с симуляцией рынка; сетевой режим подключим отдельным этапом.</p><div className="mode-cards">
    <button className="mode-card selected" onClick={()=>onChoose("offline")}><span className="mode-icon">◒</span><b>OFFLINE</b><strong>Личная экономика</strong><p>Работаешь, создаёшь денежный поток, копишь резерв, покупаешь компании и сам управляешь темпом дней. Каждое решение влияет на твой капитал и доступные возможности.</p><i>ДОСТУПНО СЕЙЧАС →</i></button>
    <button className="mode-card disabled" disabled><span className="mode-icon">◎</span><b>ONLINE</b><strong>Общий рынок</strong><p>Общий рынок с синхронными котировками, новостями, событиями и историей сделок. Режим подготовлен концептуально и пока закрыт.</p><i>СКОРО</i></button>
  </div></div></div>;
}

function CountryScreen({selected,setSelected,onNext}:{selected:string;setSelected:(id:string)=>void;onNext:()=>void}) {
  const country=countries.find(c=>c.id===selected)??countries[0]; const lore=countryLore[country.id];
  return <div className="setup-screen"><div className="setup-inner wide"><div className="step">03 / 04</div><span className="eyebrow">ВЫБОР СТРАНЫ</span><h1>Выбери свой рынок.</h1><p className="setup-lead">Пять государств объединены общей валютой VLR, но у каждого — собственная география, промышленность, ресурсы, риски и биржевая культура.</p>
    <div className="country-picker"><AtlasMap selected={selected} onSelect={setSelected}/><div className="country-options">{countries.map(c=><button key={c.id} className={c.id===selected?"country-option active":"country-option"} onClick={()=>setSelected(c.id)}><Flag country={c}/><span><b>{c.name}</b><small>{c.region} · {c.population}</small></span><strong>{c.currencySymbol}</strong></button>)}</div></div>
    <div className="country-profile country-profile-rich"><div className="profile-title"><Flag country={country}/><div><span className="eyebrow">ПРОФИЛЬ РЫНКА · ДОСЬЕ</span><h2>{country.name}</h2><p>{lore.overview}</p></div></div>
      <div className="profile-stats"><div><span>СТОЛИЦА</span><b>{country.capital}</b></div><div><span>ЕДИНАЯ ВАЛЮТА</span><b>{country.currency} · {country.currencySymbol}</b></div><div><span>БИРЖА</span><b>{country.exchange}</b></div><div><span>НАСЕЛЕНИЕ</span><b>{country.population}</b></div></div>
      <div className="country-detail-grid"><div className="investor-box investor-plus investor-priority"><span>ПЛЮСЫ ДЛЯ ИНВЕСТОРА · ГЛАВНЫЕ ДРАЙВЕРЫ</span><ul>{lore.investorAdvantages.map(x=><li key={x}>{x}</li>)}</ul></div><div className="investor-box investor-minus investor-priority"><span>МИНУСЫ ДЛЯ ИНВЕСТОРА · ГЛАВНЫЕ РИСКИ</span><ul>{lore.investorRisks.map(x=><li key={x}>{x}</li>)}</ul></div><div><span>ГЕОГРАФИЯ</span><p>{lore.geography}</p></div><div><span>ЭКОНОМИКА</span><p>{lore.economy}</p></div><div><span>СИЛЬНЫЕ СТОРОНЫ</span><p>{lore.strengths}</p></div><div><span>РИСКИ РЫНКА</span><p>{lore.risks}</p></div></div>
      <div className="company-preview"><span className="eyebrow">КЛЮЧЕВЫЕ КОМПАНИИ</span><h3>Крупнейшие игроки рынка</h3><div className="company-strip">{[...country.companies].sort((a,b)=>companyProfile(b,country).marketCap.localeCompare(companyProfile(a,country).marketCap,"ru",{numeric:true})).slice(0,4).map(c=><div className={sectorClass(c.sector)} key={c.ticker}><b>{c.ticker}</b><strong>{c.name}</strong><small>{c.sector}</small></div>)}</div></div>
    </div><div className="setup-actions"><span className="setup-hint">Физическая карта показывает рельеф, водную систему, столицы и границы.</span><button className="primary small" onClick={onNext}>Выбрать {country.name}<b>→</b></button></div>
  </div></div>;
}
function DifficultyScreen({country,onStart,onBack}:{country:Country;onStart:(id:string)=>void;onBack:()=>void}) {
  const [selected,setSelected]=useState("normal"); const d=difficultyLevels.find(x=>x.id===selected)??difficultyLevels[1];
  return <div className="setup-screen"><div className="setup-inner"><div className="step">04 / 04</div><span className="eyebrow">КЛАСС СТАРТА</span><h1>Каким будет твой<br/>финансовый старт?</h1><p className="setup-lead">Класс определяет стартовый капитал и давление экономики. Это не выбор «хорошо или плохо» — это выбор жизненной позиции.</p>
    <div className="difficulty-list">{difficultyLevels.map(x=><button key={x.id} className={x.id===selected?"difficulty active":"difficulty"} onClick={()=>setSelected(x.id)}><span className="radio"/><div><b>{x.name}</b><strong>{x.money}</strong><p>{x.description}</p><small>{x.rules}</small></div></button>)}</div>
    <div className="start-summary"><span>СТАРТ</span><b>{country.name}</b><i>·</i><b>{d.name}</b><i>·</i><b>{d.money}</b><button className="primary small" onClick={()=>onStart(selected)}>Начать игру<span className="button-arrow">→</span></button></div>
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

type ChartRange="ALL"|"10Y"|"5Y"|"1Y"|"6M"|"1M"|"1W"|"1D";
const chartRangeLabels:[ChartRange,string][]=[["ALL","Всё время"],["10Y","10 лет"],["5Y","5 лет"],["1Y","1 год"],["6M","6 месяцев"],["1M","1 месяц"],["1W","1 неделя"],["1D","1 день"]];
function CandleChart({company,points,range}:{company:CompanyPreview;points:number[];range:ChartRange}) {
  const safe=points.length?points:[priceForFallback(company)];
  const min=Math.min(...safe),max=Math.max(...safe),span=Math.max(1,max-min);
  const path=safe.map((v,i)=>`${(i/Math.max(1,safe.length-1))*500},${96-((v-min)/span)*78}`).join(" ");
  const first=safe[0]??0,last=safe[safe.length-1]??0,change=first?((last-first)/first)*100:0;
  return <div className="candle-terminal">
    <div className="candle-head"><div><span>ДИНАМИКА КОТИРОВКИ · {range}</span><b>{last.toLocaleString("ru-RU")} VLR</b></div><strong className={change>=0?"gain":"loss"}>{change>=0?"+":""}{change.toFixed(2)}%</strong></div>
    <svg viewBox="0 0 500 108" preserveAspectRatio="none" aria-label={"График "+company.ticker+", период "+range}>
      <path d="M0 96H500M0 70H500M0 44H500M0 18H500" className="grid-line"/>
      <polyline points={path} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
    </svg>
    <div className="candle-axis"><span>начало периода</span><span>середина</span><span>сейчас</span></div>
  </div>;
}
function priceForFallback(company:CompanyPreview){const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);return 6500+(seed%18)*850;}

function Panel({title,eyebrow,children}:{title:string;eyebrow:string;children:ReactNode}){return <div className="game-panel"><div className="panel-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>{children}</div>;}
function PortfolioChart({points}:{points:number[]}){const max=Math.max(...points),min=Math.min(...points),span=Math.max(1,max-min);const path=points.map((v,i)=>{const x=(i/(points.length-1))*100;const y=92-((v-min)/span)*78;return (i?"L":"M")+x.toFixed(2)+" "+y.toFixed(2)}).join(" ");const delta=points.length>1?((points[points.length-1]-points[0])/Math.max(1,points[0]))*100:0;return <div className="portfolio-chart"><div className="portfolio-chart-head"><div><span>ДИНАМИКА КАПИТАЛА</span><b>30 игровых дней</b></div><strong className={delta>=0?"gain":"loss"}>{delta>=0?"+":""}{delta.toFixed(2)}%</strong></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="График стоимости портфеля"><defs><linearGradient id="portfolioFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#43e6ff" stopOpacity=".28"/><stop offset="1" stopColor="#43e6ff" stopOpacity="0"/></linearGradient></defs><path d={path+" L100 100 L0 100 Z"} fill="url(#portfolioFill)"/><path d={path} fill="none" stroke="#62d6a4" strokeWidth="1.8" vectorEffect="non-scaling-stroke"/></svg><div className="portfolio-chart-axis"><span>30 дней назад</span><span>15 дней</span><span>сегодня</span></div></div>}


function ExchangeScreen({country,day,cash,holdings,exchangeCompany,setExchangeCompany,priceFor,priceChange,buy,sell,timePaused,setTimePaused,timeSpeed,setTimeSpeed}:{country:Country;day:number;cash:number;holdings:Record<string,number>;exchangeCompany:CompanyPreview|null;setExchangeCompany:(c:CompanyPreview)=>void;priceFor:(c:CompanyPreview,d?:number)=>number;priceChange:(c:CompanyPreview)=>number;buy:(c:CompanyPreview)=>void;sell:(c:CompanyPreview)=>void;timePaused:boolean;setTimePaused:(v:boolean)=>void;timeSpeed:0|1|1.5|2;setTimeSpeed:(v:0|1|1.5|2)=>void}) {
  const [range,setRange]=useState<"1M"|"3M"|"1Y"|"5Y">("3M");
  const company=exchangeCompany??country.companies[0]??null;
  const lengths={ "1M":30, "3M":90, "1Y":365, "5Y":720 } as const;
  const len=lengths[range];
  const points=company?Array.from({length:Math.min(len,180)},(_,i)=>priceFor(company,Math.max(1,day-(Math.min(len,180)-1)+i))):[];
  const min=points.length?Math.min(...points):0;
  const max=points.length?Math.max(...points):1;
  const span=Math.max(1,max-min);
  const poly=points.map((v,i)=>`${(i/Math.max(1,points.length-1))*100},${94-((v-min)/span)*76}`).join(" ");
  const current=company?priceFor(company):0;
  const previous=company?priceFor(company,Math.max(1,day-1)):current;
  const delta=previous?((current-previous)/previous)*100:0;
  return <div className="exchange-safe">
    <div className="exchange-safe-top">
      <div><span className="eyebrow">РЫНОЧНАЯ ИГРА</span><h2>Биржа · {country.name}</h2><p>Игровой день {day} · Q{Math.floor((day-1)/90)+1} · котировки пересчитываются вместе с экономикой.</p></div>
      <div className="exchange-safe-clock"><b>ДЕНЬ {day}</b><span>{Math.floor((day-1)/30)+1} месяц · {timePaused?"рынок на паузе":"рынок активен"}</span><div><button type="button" onClick={()=>setTimePaused(!timePaused)}>{timePaused?"▶ Продолжить":"Ⅱ Пауза"}</button>{[1,1.5,2].map(x=><button type="button" key={x} className={timeSpeed===x?"active":""} onClick={()=>setTimeSpeed(x as 1|1.5|2)}>×{x}</button>)}</div></div>
    </div>
    <div className="exchange-safe-marketline"><span>Компаний: <b>{country.companies.length}</b></span><span>Кэш: <b>{cash.toLocaleString("ru-RU")} VLR</b></span><span>Рынок: <b>{country.exchange}</b></span></div>
    <div className="exchange-safe-companies">{country.companies.map(c=><button type="button" key={c.ticker} className={company?.ticker===c.ticker?"selected":""} onClick={()=>setExchangeCompany(c)}><b>{c.ticker}</b><span>{c.name}</span><small>{c.sector}</small><strong>{priceFor(c).toLocaleString("ru-RU")} VLR</strong><em className={priceChange(c)>=0?"gain":"loss"}>{priceChange(c)>=0?"+":""}{priceChange(c).toFixed(2)}%</em></button>)}</div>
    {company&&<div className="exchange-safe-focus">
      <div className="exchange-safe-focushead"><div><span className="ticker">{company.ticker}</span><h2>{company.name}</h2><p>{company.sector} · CEO {company.ceo}</p></div><div><b>{current.toLocaleString("ru-RU")} VLR</b><strong className={delta>=0?"gain":"loss"}>{delta>=0?"+":""}{delta.toFixed(2)}%</strong></div></div>
      <div className="exchange-safe-chart">
        <div className="chart-title"><span>КОТИРОВКА · {range}</span><b>{current.toLocaleString("ru-RU")} VLR</b></div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={"График "+company.ticker}>
          <path d="M0 94H100M0 69H100M0 44H100M0 19H100" className="grid-line"/>
          <polyline points={poly} fill="none" stroke="currentColor" strokeWidth="2.2" vectorEffect="non-scaling-stroke"/>
        </svg>
        <div className="chart-range-tabs">{([["1M","1 мес."],["3M","3 мес."],["1Y","1 год"],["5Y","5 лет"]] as const).map(([id,label])=><button type="button" key={id} className={range===id?"active":""} onClick={()=>setRange(id)}>{label}</button>)}</div>
      </div>
      <div className="exchange-safe-metrics"><div><span>В ПОРТФЕЛЕ</span><b>{holdings[company.ticker]||0} акций</b></div><div><span>СЕКТОР</span><b>{company.sector}</b></div><div><span>ЦЕНА</span><b>{current.toLocaleString("ru-RU")} VLR</b></div><div><span>ДЕНЬ</span><b>{day}</b></div></div>
      <div className="exchange-safe-report"><span>КОРПОРАТИВНЫЙ СИГНАЛ</span><h3>{company.name}</h3><p>Котировка зависит от тренда, новостей, сырьевых факторов и преимущества страны. Квартал Q{Math.floor((day-1)/90)+1} пересчитывается автоматически.</p></div>
      <div className="exchange-safe-dossier"><div><span>СЕКТОР</span><p>{company.sector}</p></div><div><span>CEO</span><p>{company.ceo}, {company.ceoAge} лет. {company.ceoBio}</p></div><div><span>ПРИМЕЧАНИЕ</span><p>{company.note}</p></div><div><span>СТРАНА</span><p>{country.name} · {country.capital}</p></div></div>
      <div className="exchange-safe-actions"><span>Позиция: <b>{holdings[company.ticker]||0} акций</b> · Кэш: <b>{cash.toLocaleString("ru-RU")} VLR</b></span><div><button type="button" disabled={!(holdings[company.ticker]>0)} onClick={()=>sell(company)}>Продать</button><button type="button" className="primary small" onClick={()=>buy(company)}>Купить 1 акцию</button></div></div>
    </div>}
  </div>;
}

function GameScreen({player,country,difficulty,onRestart,onLogout}:{player:string;country:Country;difficulty:string;onRestart:()=>void;onLogout:()=>void}) {
  const saveKey=`marketarena.save.v2.${player.toLowerCase().trim().replace(/\\s+/g,"-")}`;
  const initialSave=useMemo<GameSave|null>(()=>{try{const raw=window.localStorage.getItem(saveKey);return raw?JSON.parse(raw) as GameSave:null;}catch{return null;}},[saveKey]);
  const [tab,setTab]=useState<GameTab>(()=>initialSave?.tab??"overview");
  const [cash,setCash]=useState(()=>initialSave?.cash??(difficulty==="easy"?5000000:difficulty==="hard"?50000:500000));
  const [holdings,setHoldings]=useState<Record<string,number>>(()=>initialSave?.holdings??{});
  const [day,setDay]=useState(()=>initialSave?.day??1);
  const [notice,setNotice]=useState("Сегодня доступны работа, рынок и первые инвестиции.");
  const [selectedCompany,setSelectedCompany]=useState<CompanyPreview|null>(null);
  const [exchangeCompany,setExchangeCompany]=useState<CompanyPreview|null>(()=>initialSave?.tab==="exchange" ? (country.companies[0]??null) : null);
  const [selectedNews,setSelectedNews]=useState<string|null>(null);
  const [jobCooldown,setJobCooldown]=useState<string|null>(null);
  const [jobGame,setJobGame]=useState<{jobId:string;target:number;score:number;started:number}|null>(null);
  const [miniGame,setMiniGame]=useState<{active:boolean;score:number;target:number;started:number}>({active:false,score:0,target:1,started:0});
  const [transactions,setTransactions]=useState<Transaction[]>(()=>initialSave?.transactions??[]);
  const [chartRange,setChartRange]=useState<ChartRange>("1Y");
  const [marketPulse,setMarketPulse]=useState(0);
  const [timeSpeed,setTimeSpeed]=useState<0|1|1.5|2>(1);
  const [timePaused,setTimePaused]=useState(false);
  useEffect(()=>{const timer=window.setInterval(()=>setMarketPulse(Date.now()),1500);return()=>window.clearInterval(timer)},[]);
  useEffect(()=>{if(timePaused)return; const ms=Math.round(6000/timeSpeed); const timer=window.setInterval(()=>setDay(v=>v+1),ms); return()=>window.clearInterval(timer)},[timeSpeed,timePaused]);
  useEffect(()=>{const payload:GameSave={player,countryId:country.id,difficulty,cash,holdings,day,transactions,tab,savedAt:new Date().toISOString()};try{window.localStorage.setItem(saveKey,JSON.stringify(payload));}catch{}},[saveKey,player,country.id,difficulty,cash,holdings,day,transactions,tab]);
  useEffect(()=>{
    if(tab==="exchange" && !exchangeCompany && country.companies.length) setExchangeCompany(country.companies[0]);
  },[tab,country.id,country.companies,exchangeCompany]);
  const countryMarketProfile:Record<string,{bias:number;sectors:Record<string,number>;strength:string;risk:string}>={
    slavoriya:{bias:.006,sectors:{"Металлы":.018,"Энергетика":.012,"Машиностроение":.014,"Финансы":.009},strength:"сильный внутренний спрос и промышленная база",risk:"циклический спрос на металлы и стоимость кредита"},
    lirania:{bias:.004,sectors:{"Судоходство":.020,"Порты":.018,"Страхование":.013,"Финансы":.010},strength:"торговые маршруты и портовая инфраструктура",risk:"зависимость от мирового товарооборота и фрахта"},
    darvast:{bias:-.002,sectors:{"Нефть":.028,"Металлы":.020,"Логистика":.010},strength:"огромная ресурсная база и дешёвая энергия",risk:"волатильность сырьевых цен и экспортных доходов"},
    estraviya:{bias:.009,sectors:{"Биотех":.026,"Технологии":.024,"Электроника":.020,"Робототехника":.022},strength:"инновации, университеты и высокий человеческий капитал",risk:"длинный цикл исследований и дорогие компоненты"},
    saverniya:{bias:.005,sectors:{"Агро":.024,"Ритейл":.018,"Логистика":.012},strength:"плодородные земли и большой потребительский рынок",risk:"погода, урожайность и инфляция спроса"}
  };
  const marketProfile=countryMarketProfile[country.id]??countryMarketProfile.slavoriya;
  const commodityPulse=(sector:string,atDay:number)=>{
    const map:Record<string,{name:string;wave:number}>={"Нефть":{name:"нефти",wave:.030},"Металлы":{name:"металлов",wave:.022},"Агро":{name:"зерна",wave:.018},"Энергетика":{name:"газа и электроэнергии",wave:.014},"Машиностроение":{name:"стали и оборудования",wave:.010},"Логистика":{name:"топлива",wave:.012},"Порты":{name:"фрахта",wave:.016},"Судоходство":{name:"фрахта",wave:.021}};
    const c=map[sector]; if(!c) return {name:"ключевых компонентов",impact:Math.sin((atDay+sector.length)*.083)*.006};
    return {name:c.name,impact:Math.sin((atDay+sector.length*11)*.071)*c.wave+Math.cos((atDay+sector.length)*.031)*c.wave*.45};
  };
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
    const event=events[Math.floor((atDay+seed)/3)%events.length];
    const commodity=commodityPulse(company.sector,atDay);
    const sectorBias=company.sector.includes("Нефть")||company.sector.includes("Металлы") ? Math.sin((atDay+seed)*0.09)*0.012 : Math.sin((atDay+seed)*0.07)*0.009;
    const countryBias=marketProfile.bias+(marketProfile.sectors[company.sector]??0);
    const cycle=Math.sin((atDay+seed*0.17)*0.045)*0.012;
    return {headline:event.headline+"; цены "+commodity.name+" меняются",impact:event.impact+commodity.impact+sectorBias+countryBias+cycle};
  };
  const quarterlyReport=(company:CompanyPreview,atDay:number)=>{
    const event=marketEvent(company,atDay);
    const commodity=commodityPulse(company.sector,atDay);
    const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);
    const revenue=(4.8+(seed%120)/10)*(1+event.impact*1.7);
    const profit=Math.max(.05,(.42+(seed%38)/20)*(1+event.impact*4+commodity.impact*2));
    return {event,commodity,revenue,profit,outlook:event.impact>=0?"прогноз повышен":"прогноз снижен"};
  };
  const priceFor=(company:CompanyPreview, atDay=day)=>{
    const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);
    const base=6500+(seed%18)*850;
    const wave=Math.sin((atDay+seed)*0.37)*0.045+Math.cos((atDay+seed)*0.13)*0.025;
    const trend=Math.sin((atDay+seed)*0.021)*0.08;
    const event=marketEvent(company,atDay).impact;
    const countryDrift=marketProfile.bias+(marketProfile.sectors[company.sector]??0);
    const live=Math.sin(marketPulse/5200+seed)*0.0025+Math.cos(marketPulse/9100+seed*0.7)*0.0015;
    return Math.max(2500,Math.round(base*(1+wave+trend+event+countryDrift+live)/50)*50);
  };
  const priceChange=(company:CompanyPreview)=>{
    const oldDay=Math.max(1,day-1);
    const old=priceFor(company,oldDay);
    return ((priceFor(company,day)-old)/old)*100;
  };
  const history=(company:CompanyPreview, range:ChartRange=chartRange)=>{const lengths:Record<ChartRange,number>={ALL:720,"10Y":720,"5Y":540,"1Y":365,"6M":182,"1M":30,"1W":7,"1D":2};const len=lengths[range];return Array.from({length:Math.max(2,len)},(_,i)=>priceFor(company,day-len+1+i));};
  const portfolioValue=useMemo(()=>country.companies.reduce((sum,c)=>sum+(holdings[c.ticker]||0)*priceFor(c),0),[country.companies,holdings,day,marketPulse]);
  const totalWealth=cash+portfolioValue;
  const portfolioHistory=useMemo(()=>Array.from({length:30},(_,i)=>cash+country.companies.reduce((sum,c)=>sum+(holdings[c.ticker]||0)*priceFor(c,Math.max(1,day-29+i)),0)),[cash,country.companies,holdings,day,marketPulse]);
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
  const startJobGame=(id:string)=>setJobGame({jobId:id,target:Math.floor(Math.random()*(id==="analyst"?9:id==="logistics"?6:4)),score:0,started:Date.now()});
  const finishJobGame=()=>{if(!jobGame)return;const job=jobs.find(x=>x.id===jobGame.jobId);if(!job)return;setCash(v=>v+job.pay);setJobCooldown(job.id);setNotice(job.title+" выполнена: +"+job.pay.toLocaleString("ru-RU")+" VLR.");setJobGame(null);setTimeout(()=>setJobCooldown(null),700);};
  const hitJobTarget=(index:number)=>{
    if(!jobGame)return;
    const size=jobGame.jobId==="analyst"?9:jobGame.jobId==="logistics"?6:4;
    const next=()=>Math.floor(Math.random()*size);
    if(index===jobGame.target){
      if(jobGame.score>=2) finishJobGame();
      else setJobGame({...jobGame,score:jobGame.score+1,target:next(),started:Date.now()});
    }else setJobGame({...jobGame,score:0,target:next(),started:Date.now()});
  };
  const advance=()=>{setDay(v=>v+1);setNotice("Новый игровой день: котировки, новости и стоимость портфеля обновились.");};
  const startMiniGame=()=>setMiniGame({active:true,score:0,target:Math.floor(Math.random()*6),started:Date.now()});
  const hitMiniGame=(index:number)=>{if(!miniGame.active)return; if(index===miniGame.target){const reward=3500+Math.max(0,2500-Math.min(2500,Date.now()-miniGame.started));setCash(v=>v+reward);setNotice("Точная реакция: +"+Math.round(reward).toLocaleString("ru-RU")+" VLR.");setMiniGame({active:true,score:miniGame.score+1,target:Math.floor(Math.random()*6),started:Date.now()});}else{setNotice("Промах. Следующая цель появится после точного клика.");}};
  const tabs:[GameTab,string][]=[["overview","Обзор"],["exchange","Биржа"],["portfolio","Портфель"],["companies","Компании"],["life","Жизнь"],["map","Карта"],["news","Новости"],["events","События"],["history","История"],["updates","Обновления"]];
  const cashPct=Math.min(100,Math.max(8,cash/(totalWealth||1)*100));
  const openExchange=(company?:CompanyPreview)=>{
    const next=company??exchangeCompany??country.companies[0]??null;
    setSelectedCompany(null);
    setExchangeCompany(next);
    setTab("exchange");
  };

  return <div className="game-shell">
    <header className="game-topbar"><button className="game-brand" onClick={()=>setTab("overview")}><span>MA</span><b>MarketArena</b></button><nav>{tabs.map(([id,label])=><button type="button" key={id} className={id==="exchange"?(tab===id?"exchange-nav active":"exchange-nav"):tab===id?"active":""} aria-label={id==="exchange"?"Открыть биржу":label} onClick={e=>{e.preventDefault();e.stopPropagation();if(id==="exchange") openExchange(); else setTab(id)}}>{label}</button>)}</nav><div className="game-right"><span className="offline-pill live-pill"><i/> LIVE</span><span>ДЕНЬ {day}</span><b>{totalWealth.toLocaleString("ru-RU")} VLR</b></div></header>
    <div className="game-body">
      <aside className="game-sidebar"><div className="player-card"><span className="avatar">{player.slice(0,1).toUpperCase()}</span><div><b>{player}</b><small>Частный инвестор</small></div></div><div className="country-mini"><Flag country={country}/><div><b>{country.name}</b><small>{country.capital} · {commonCurrency.symbol}</small></div></div><div className="game-clock-card"><span>ИГРОВОЕ ВРЕМЯ</span><b>ДЕНЬ {day}</b><small>{Math.floor((day-1)/30)+1} месяц · Q{Math.floor((day-1)/90)+1} · {timePaused?"ПАУЗА":"ИДЁТ"}</small><div><button type="button" onClick={()=>setTimePaused(v=>!v)}>{timePaused?"▶":"Ⅱ"}</button><button type="button" onClick={()=>setTimeSpeed(1)}>1×</button><button type="button" onClick={()=>setTimeSpeed(1.5)}>1.5×</button><button type="button" onClick={()=>setTimeSpeed(2)}>2×</button></div></div><div className="side-title">ИГРА</div>{tabs.map(([id,label])=><button type="button" key={id} className={tab===id?"side-active":""} aria-label={id==="exchange"?"Открыть биржу":label} onClick={e=>{e.preventDefault();e.stopPropagation();if(id==="exchange") openExchange(); else setTab(id)}}>{label}<span>›</span></button>)}<div className="side-bottom"><small>КЛАСС</small><b>{difficultyLevels.find(x=>x.id===difficulty)?.name}</b><button onClick={onRestart}>Новая игра</button><button className="logout-button" onClick={onLogout}>Выйти из аккаунта</button></div></aside>
      <main className="game-main">
        {tab==="overview"&&<><div className="game-heading"><div><span className="eyebrow">ДЕНЬ {day} · {country.name.toUpperCase()}</span><h1>{country.name}: экономический центр</h1><p>{notice}</p></div><button className="day-button" onClick={advance}>Следующий день →</button></div>
          <div className="hero-map-grid">
            <section className="market-map-card"><div className="card-head"><div><span>РЕЛЬЕФ · ЭКОНОМИКА · КОМПАНИИ</span><h2>Карта {country.name}</h2></div><b className="positive">{priceChange(country.companies[0])>=0?"+":""}{priceChange(country.companies[0]).toFixed(2)}%</b></div><AtlasMap selected={country.id} onSelect={()=>{}} showCompanies onCompany={openExchange}/></section>
            <section className="capital-card"><span>ОБЩИЙ КАПИТАЛ</span><strong>{totalWealth.toLocaleString("ru-RU")} VLR</strong><small>Свободные деньги · {cash.toLocaleString("ru-RU")} VLR</small><div className="money-bar"><i style={{width:cashPct+"%"}}/></div><div className="capital-actions"><button onClick={()=>setTab("life")}>Заработать</button><button onClick={()=>openExchange()}>Инвестировать</button></div></section>
            <section className="jobs-card"><div className="card-head"><div><span>РАБОТА И ДОХОД</span><h2>Заработать на следующие сделки</h2></div><button onClick={()=>setTab("life")}>Все →</button></div>{jobs.map(j=><div className="job-row" key={j.id}><div><b>{j.title}</b><small>{j.time} · {j.text}</small></div><button disabled={jobCooldown===j.id} onClick={()=>startJobGame(j.id)}>+{j.pay.toLocaleString("ru-RU")} VLR</button></div>)}</section>
            <section className="companies-card"><div className="card-head"><div><span>ПУБЛИЧНЫЕ КОМПАНИИ</span><h2>Компании на карте {country.name}</h2></div><button onClick={()=>setTab("companies")}>Открыть все →</button></div><div className="ticker-grid">{country.companies.map(c=><button className="ticker-row" key={c.ticker} onClick={()=>openExchange(c)}><b>{c.ticker}</b><span>{c.name}<small>{c.sector}</small></span><strong className={priceChange(c)>=0?"gain":"loss"}>{priceChange(c)>=0?"+":""}{priceChange(c).toFixed(2)}%</strong></button>)}</div></section>
          <section className="home-news-card"><div className="card-head"><div><span>ЛЕНТА РЫНКА · ДЕНЬ {day}</span><h2>Что происходит в экономике</h2></div><button onClick={()=>setTab("news")}>Все новости →</button></div><div className="home-news-list">{country.companies.slice(0,3).map(c=>{const e=marketEvent(c,day);return <button key={c.ticker} onClick={()=>setSelectedCompany(c)}><span className={e.impact>=0?"news-signal positive":"news-signal negative"}>{e.impact>=0?"▲":"▼"}</span><div><b>{c.name}</b><p>{e.headline}</p></div><strong className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"+":""}{(e.impact*100).toFixed(1)}%</strong></button>})}</div></section>
          </div></>}
        {tab==="exchange"&&<Panel title={"Биржа · "+country.name} eyebrow="РЫНОЧНАЯ ИГРА">
          <ExchangeScreen
            country={country}
            day={day}
            cash={cash}
            holdings={holdings}
            exchangeCompany={exchangeCompany}
            setExchangeCompany={setExchangeCompany}
            priceFor={priceFor}
            priceChange={priceChange}
            buy={buy}
            sell={sell}
            timePaused={timePaused}
            setTimePaused={setTimePaused}
            timeSpeed={timeSpeed}
            setTimeSpeed={setTimeSpeed}
          />
        </Panel>}
{tab==="portfolio"&&<Panel title="Портфель" eyebrow="YOUR CAPITAL"><div className="portfolio-summary"><div><span>СТОИМОСТЬ АКТИВОВ</span><b>{portfolioValue.toLocaleString("ru-RU")} VLR</b></div><div><span>СВОБОДНЫЕ ДЕНЬГИ</span><b>{cash.toLocaleString("ru-RU")} VLR</b></div><div><span>ВСЕГО</span><b>{totalWealth.toLocaleString("ru-RU")} VLR</b></div></div><PortfolioChart points={portfolioHistory}/><div className="portfolio-insights"><div><span>ДИВЕРСИФИКАЦИЯ</span><b>{Object.values(holdings).filter(Boolean).length} позиций</b><small>открытые позиции</small></div><div><span>ДЕНЕЖНАЯ ДОЛЯ</span><b>{((cash/Math.max(1,totalWealth))*100).toFixed(1)}%</b><small>ликвидность</small></div><div><span>РЫНОЧНАЯ ЭКСПОЗИЦИЯ</span><b>{portfolioValue.toLocaleString("ru-RU")} VLR</b><small>стоимость акций</small></div></div><div className="table-card portfolio-table">{country.companies.filter(c=>(holdings[c.ticker]||0)>0).map(c=><div className="table-row" key={c.ticker}><button className="ticker-link" onClick={()=>openExchange(c)}>{c.ticker}</button><span>{c.name}</span><span>{holdings[c.ticker]} акций</span><strong>{(holdings[c.ticker]*priceFor(c)).toLocaleString("ru-RU")} VLR</strong><div className="trade-actions"><button onClick={()=>buy(c)}>+ Купить</button><button onClick={()=>sell(c)}>- Продать</button></div></div>)}{portfolioValue===0&&<div className="empty-state">Портфель пуст. Открой «Биржу» и купи первую акцию.</div>}</div></Panel>}
        {tab==="companies"&&<Panel title={"Компании · "+country.name} eyebrow="PUBLIC COMPANIES"><p className="panel-lead">Каждая компания получает собственную карточку, котировку и профиль CEO. Нажми на карточку для подробностей.</p><div className="company-grid">{country.companies.map((c,index)=><article className={"company-focus-card company-variant-"+(index%5)+" "+sectorClass(c.sector)} key={c.ticker} onClick={()=>openExchange(c)}><div className="company-focus-top"><span className="ticker">{c.ticker}</span><span className={"sector-chip "+sectorClass(c.sector)}>{c.sector}</span></div><h3>{c.name}</h3><p>{c.note}</p><div className="company-ceo"><CEOAvatar company={c}/><div><span className="eyebrow">CEO · {c.ceoRole}</span><b>{c.ceo}</b><small>{c.ceoAge} лет</small></div></div><div className="company-focus-footer"><span>Котировка <b>{priceFor(c).toLocaleString("ru-RU")} VLR</b></span><button onClick={e=>{e.stopPropagation();buy(c)}}>Купить 1 акцию</button></div></article>)}</div></Panel>}
        {tab==="life"&&<Panel title="Жизнь" eyebrow="CAREER & LIFE"><p className="panel-lead">Работа — это первый денежный поток, но не единственный. Выбирай занятие, следи за рынком и открывай возможности для инвестиций.</p><div className="mini-game-card"><div><span className="eyebrow">2D · REACTION TEST</span><h2>Рыночный сигнал</h2><p>Нажми на активную точку раньше, чем исчезнет импульс. Это первый простой мини-тест; награда сразу добавляется в капитал.</p></div><div className="mini-game-board">{miniGame.active?Array.from({length:6},(_,i)=><button key={i} className={i===miniGame.target?"mini-target":""} onClick={()=>hitMiniGame(i)} aria-label={"Точка "+(i+1)}>{i===miniGame.target?"◆":""}</button>):<button className="mini-start" onClick={startMiniGame}>Запустить тест</button>}</div><div className="mini-game-meta"><span>Серия <b>{miniGame.score}</b></span><button onClick={startMiniGame}>{miniGame.active?"Новая попытка":"Начать"}</button></div></div>{jobs.map(j=><div className="life-job" key={j.id}><div><b>{j.title}</b><span>{j.text}</span></div><strong>{j.pay.toLocaleString("ru-RU")} VLR</strong><button disabled={jobCooldown===j.id} onClick={()=>startJobGame(j.id)}>Работать</button></div>)}</Panel>}
        {tab==="map"&&<Panel title={"Карта "+country.name} eyebrow="ATLAS"><p className="panel-lead">Здесь показана именно выбранная страна: современная городская среда, дороги, рельеф, столица и расположение публичных компаний.</p><AtlasMap selected={country.id} onSelect={()=>{}} showCompanies onCompany={openExchange}/></Panel>}
        {tab==="events"&&<Panel title="События" eyebrow="MARKET EVENTS"><p className="panel-lead">Экономические события связывают страну, отрасли и компании. Каждый импульс отражается в котировках и ленте новостей.</p><div className="event-grid">{country.companies.map(c=>{const e=marketEvent(c,day);return <button className="event-card" key={c.ticker} onClick={()=>{setSelectedNews(c.ticker);setTab("news")}}><div><span className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"POSITIVE":"RISK"}</span><b>{c.name}</b><small>{c.sector} · {c.ticker}</small></div><p>{e.headline}</p><strong className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"+":""}{(e.impact*100).toFixed(2)}%</strong><span className="event-card-action">Открыть новость →</span></button>})}</div></Panel>}
        {tab==="history"&&<Panel title="История игры" eyebrow="GAME HISTORY"><p className="panel-lead">Здесь сохраняются финансовые решения игрока: сделки, дни, изменения капитала и ключевые действия.</p><div className="history-milestones"><div><span>ТЕКУЩИЙ ДЕНЬ</span><b>{day}</b><small>рынок продолжает двигаться</small></div><div><span>КАПИТАЛ</span><b>{totalWealth.toLocaleString("ru-RU")} VLR</b><small>ликвидность + позиции</small></div><div><span>РЕЖИМ</span><b>OFFLINE</b><small>локальная история</small></div></div><div className="history-list">{transactions.map((t,i)=><div key={i}><span>День {t.day}</span><b className={t.type==="BUY"?"loss":"gain"}>{t.type}</b><strong>{t.ticker}</strong><span>{t.quantity} шт.</span><em>{(t.price*t.quantity).toLocaleString("ru-RU")} VLR</em></div>)}{transactions.length===0&&<div className="empty-state">История пока пуста. Соверши первую сделку на бирже.</div>}</div><div className="history-stat-grid">
  <div><span>ДНЕЙ СЫГРАНО</span><b>{day}</b><small>пройдено игровых дней</small></div>
  <div><span>СДЕЛОК</span><b>{transactions.length}</b><small>{transactions.length?"активность на рынке":"пока без сделок"}</small></div>
  <div><span>ПОЗИЦИЙ</span><b>{Object.values(holdings).filter(Boolean).length}</b><small>{Object.values(holdings).filter(Boolean).length?"открытые активы":"портфель пуст"}</small></div>
</div></Panel>}
        {tab==="updates"&&<Panel title="Updates & Patch Notes" eyebrow="ИСТОРИЯ РАЗВИТИЯ"><p className="panel-lead">История обновлений MarketArena: новые функции, улучшения и исправления.</p><div className="patch-timeline">{PATCH_NOTES.map(p=><article className="patch-item" key={p.version}><div className="patch-dot"/><div className="patch-card"><div className="patch-head"><div><span>{p.version}</span><h2>{p.title}</h2></div><time>{p.date}</time></div><div className="patch-columns"><div><b>Добавлено</b>{p.added.map(x=><span key={x}>+ {x}</span>)}</div><div><b>Улучшено</b>{p.improved.map(x=><span key={x}>↗ {x}</span>)}</div><div><b>Исправлено</b>{p.fixed.map(x=><span key={x}>✓ {x}</span>)}</div></div></div></article>)}</div></Panel>}
        {tab==="news"&&<Panel title="Новости" eyebrow="ECONOMIC NEWS"><p className="panel-lead">Новости поступают в живую ленту симуляции: информационные импульсы меняют котировки, а новые сообщения появляются независимо от нажатия «Следующий день».</p><div className="news-list">{country.companies.slice(0,8).map((c,i)=>{const e=marketEvent(c,day);return <button className={selectedNews===c.ticker?"news-item active":"news-item"} key={c.ticker} onClick={()=>setSelectedNews(c.ticker)}><span>{String(8+i*2).padStart(2,"0")}:30</span><div><b>{c.name}: {e.headline}</b><p>Котировка {c.ticker}: <strong className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"+":""}{(e.impact*100).toFixed(2)}%</strong> фактор события. Итоговая цена учитывает тренд, волатильность и этот информационный импульс.</p></div><strong>{c.sector.toUpperCase()}</strong></button>})}</div>{selectedNews&&(()=>{const focus=country.companies.find(c=>c.ticker===selectedNews);if(!focus)return null;const e=marketEvent(focus,day);return <article className="news-detail-card"><div className="news-detail-head"><div><span className="eyebrow">ПОДРОБНЫЙ РЕПОРТАЖ · {focus.ticker}</span><h2>{focus.name}</h2></div><button onClick={()=>setSelectedNews(null)}>Закрыть</button></div><p>{focus.name} {e.headline}. Рынок оценивает событие через изменение ожиданий по выручке, марже и будущему денежному потоку. В этой симуляции информационный импульс напрямую влияет на дневную котировку компании.</p><div className="news-detail-grid"><div><span>СЕКТОР</span><b>{focus.sector}</b></div><div><span>ИМПУЛЬС</span><b className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"+":""}{(e.impact*100).toFixed(2)}%</b></div><div><span>КОТИРОВКА</span><b>{priceFor(focus).toLocaleString("ru-RU")} VLR</b></div></div></article>})()}<div className="news-transactions"><span className="eyebrow">ИСТОРИЯ СДЕЛОК</span>{transactions.slice(0,6).map((t,i)=><div key={i}><b className={t.type==="BUY"?"loss":"gain"}>{t.type}</b><span>День {t.day} · {t.ticker} · {t.quantity} шт.</span><strong>{(t.price*t.quantity).toLocaleString("ru-RU")} VLR</strong></div>)}{transactions.length===0&&<p>Сделок пока нет. Первая покупка появится здесь сразу после подтверждения.</p>}</div></Panel>}
      </main>
    </div>
    {selectedCompany&&<div className="company-modal-backdrop" onClick={()=>setSelectedCompany(null)}><div className="company-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelectedCompany(null)}>×</button><div className="modal-company-head"><CEOAvatar company={selectedCompany}/><div><span className="ticker">{selectedCompany.ticker}</span><h2>{selectedCompany.name}</h2><p>{selectedCompany.sector} · публичная компания · {country.name}</p></div></div><div className="modal-grid"><div><span className="eyebrow">О КОМПАНИИ</span><p className="company-description">{companyProfile(selectedCompany,country).description}</p><div className="company-metrics">{[["КАПИТАЛИЗАЦИЯ",companyProfile(selectedCompany,country).marketCap],["ВЫРУЧКА",companyProfile(selectedCompany,country).revenue],["ЧИСТАЯ ПРИБЫЛЬ",companyProfile(selectedCompany,country).netProfit],["P / E",companyProfile(selectedCompany,country).pe],["P / B",companyProfile(selectedCompany,country).pb],["ДИВИДЕНД",companyProfile(selectedCompany,country).dividendYield]].map(([label,value])=><div key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="chart-range-tabs">{chartRangeLabels.map(([id,label])=><button key={id} className={chartRange===id?"active":""} onClick={()=>setChartRange(id)}>{label}</button>)}</div><CandleChart company={selectedCompany} points={history(selectedCompany,chartRange)} range={chartRange}/><CompanyChart company={selectedCompany} points={history(selectedCompany,chartRange)}/><div className="quote-box"><span>ТЕКУЩАЯ КОТИРОВКА</span><b>{priceFor(selectedCompany).toLocaleString("ru-RU")} VLR</b><small className={priceChange(selectedCompany)>=0?"gain":"loss"}>{priceChange(selectedCompany)>=0?"+":""}{priceChange(selectedCompany).toFixed(2)}% за день</small><small>Дивидендная доходность · {companyProfile(selectedCompany,country).dividendYield} годовых</small></div><div className="modal-buy"><span>В портфеле: <b>{holdings[selectedCompany.ticker]||0} шт.</b></span><div><button className="secondary-action" onClick={()=>sell(selectedCompany)}>Продать</button><button className="primary small" onClick={()=>buy(selectedCompany)}>Купить акцию</button></div></div></div><div className="ceo-profile"><span className="eyebrow">CEO · ПЕРСОНАЖ</span><h3>{selectedCompany.ceo}</h3><b>{selectedCompany.ceoAge} лет · {selectedCompany.ceoRole}</b><p>{selectedCompany.ceoBio}</p><p><strong>Стратегия:</strong> {companyProfile(selectedCompany,country).strategy}</p><p><strong>Цели на игровой год:</strong> {companyProfile(selectedCompany,country).goals}</p><div className="company-facts"><span>Основана</span><b>{companyProfile(selectedCompany,country).founded}</b><span>Штат</span><b>{companyProfile(selectedCompany,country).employees}</b><span>Штаб-квартира</span><b>{companyProfile(selectedCompany,country).headquarters}</b><span>Ресурсы</span><b>{companyProfile(selectedCompany,country).materials}</b></div><div className="ceo-tags"><span>Биография</span><span>Репутация</span><span>Стиль управления</span></div></div></div></div></div>}
    {jobGame&&<div className="job-game-backdrop" onClick={()=>setJobGame(null)}><div className="job-game-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setJobGame(null)}>×</button>{(()=>{const job=jobs.find(x=>x.id===jobGame.jobId);if(!job)return null;return <><span className="eyebrow">МИНИ-ИГРА · РАБОТА</span><h2>{job.title}</h2><p>{job.text} {job.id==="analyst"?"Найди быстро меняющийся сигнал в аналитической матрице.":job.id==="logistics"?"Проведи маршрут по контрольным точкам в правильном порядке.":"Выбери нужный тип задания и удерживай серию точных решений."} Выполни три точных решения подряд, чтобы получить оплату.</p>{jobGame.jobId==="analyst"&&<div className="job-game-board analyst-board">{Array.from({length:9},(_,i)=><button key={i} className={i===jobGame.target?"job-target":""} onClick={()=>hitJobTarget(i)}>{i===jobGame.target?"●":""}</button>)}</div>}
{jobGame.jobId==="logistics"&&<div className="job-game-board logistics-board">{Array.from({length:6},(_,i)=><button key={i} className={i===jobGame.target?"job-target":""} onClick={()=>hitJobTarget(i)}><span>{i+1}</span><small>{["A","B","C","D","E","F"][i]}</small></button>)}</div>}
{jobGame.jobId==="freelance"&&<div className="job-game-board freelance-board">{["АНАЛИЗ","ТЕКСТ","ДИЗАЙН","КОД"].map((x,i)=><button key={x} className={i===jobGame.target?"job-target":""} onClick={()=>hitJobTarget(i)}><b>{x}</b><small>{["Данные","Документы","Визуал","Задача"][i]}</small></button>)}</div>}<div className="job-game-footer"><span>Серия <b>{jobGame.score}/3</b></span><strong>Награда: {job.pay.toLocaleString("ru-RU")} VLR</strong></div></>})()}</div></div>}
  </div>;
}

function App(){
  const [screen,setScreen]=useState<Screen>(()=>{try{return window.localStorage.getItem("marketarena.screen")==="game"?"game":"auth";}catch{return "auth";}});
  const [player,setPlayer]=useState(()=>{try{return window.localStorage.getItem("marketarena.player")||"Игрок";}catch{return "Игрок";}});
  const [mode,setMode]=useState<"offline"|"online">("offline");
  const [countryId,setCountryId]=useState(()=>{try{return window.localStorage.getItem("marketarena.country")||countries[0].id;}catch{return countries[0].id;}});
  const [difficulty,setDifficulty]=useState(()=>{try{return window.localStorage.getItem("marketarena.difficulty")||"normal";}catch{return "normal";}});
  useEffect(()=>{try{window.localStorage.setItem("marketarena.player",player);window.localStorage.setItem("marketarena.country",countryId);window.localStorage.setItem("marketarena.difficulty",difficulty);if(screen==="game")window.localStorage.setItem("marketarena.screen","game");else if(screen==="auth")window.localStorage.removeItem("marketarena.screen");}catch{}},[player,countryId,difficulty,screen]);
  const country=useMemo(()=>countries.find(c=>c.id===countryId)??countries[0],[countryId]);
  if(screen==="auth") return <AuthScreen onContinue={name=>{setPlayer(name);setScreen("mode")}}/>;
  if(screen==="mode") return <ModeScreen onChoose={m=>{setMode(m);if(m==="offline")setScreen("country")}}/>;
  if(screen==="country") return <CountryScreen selected={countryId} setSelected={setCountryId} onNext={()=>setScreen("difficulty")}/>;
  if(screen==="difficulty") return <DifficultyScreen country={country} onStart={id=>{setDifficulty(id);setScreen("game")}} onBack={()=>setScreen("country")}/>;
  return <GameScreen player={player} country={country} difficulty={difficulty} onLogout={()=>{try{window.localStorage.removeItem("marketarena.screen");}catch{} setScreen("auth");setPlayer("Игрок");}} onRestart={()=>{try{window.localStorage.removeItem(`marketarena.save.v2.${player.toLowerCase().trim().replace(/\\s+/g,"-")}`);window.localStorage.removeItem("marketarena.screen");}catch{} setScreen("mode")}}/>;
}

export default App;
