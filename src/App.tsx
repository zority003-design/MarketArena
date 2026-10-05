import { useEffect, useMemo, useState } from "react";
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
  return {founded:1974+(seed%39),employees:(1.2+(seed%88)/10).toFixed(1).replace(".",",")+" тыс.",headquarters:country.capital,revenue:(4.8+(seed%120)/10).toFixed(1).replace(".",",")+" млрд VLR",netProfit:(0.42+(seed%38)/20).toFixed(2).replace(".",",")+" млрд VLR",marketCap:(18+seed%140).toFixed(0)+" млрд VLR",pe:(7+seed%24).toFixed(1)+"×",pb:(0.8+(seed%19)/10).toFixed(1)+"×",dividendYield:(1.6+(seed%32)/10).toFixed(1).replace(".",",")+"%",materials:materialMap[company.sector]??"капитал, энергия и квалифицированный труд",strategy:"Рост выручки через расширение мощностей, цифровизацию операций и дисциплину капитала.",goals:"Увеличить выручку на 8–12%, удержать долговую нагрузку под контролем, открыть новые экспортные направления и повысить эффективность активов.",description:company.name+" — публичный игрок "+country.name+" с фокусом на сектор «"+company.sector+"». "+(sectorNarrative[company.sector]??"Компания работает внутри ключевых экономических цепочек страны и союза.")};
}
function eventLabel(company:CompanyPreview,day:number){const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);const events=["подписала новый экспортный контракт и повысила прогноз выручки","зафиксировала рост себестоимости и пересмотрела прогноз маржи","объявила расширение мощностей и программу капитальных инвестиций","увидела замедление спроса на ключевых рынках","получила регуляторное одобрение стратегического проекта","столкнулась с перебоями поставок и временным ростом издержек","опубликовала результаты выше ожиданий аналитиков","столкнулась с фиксацией прибыли после сильного роста котировок"];return events[Math.floor((day+seed)/3)%events.length];}

const countryLore:Record<string,{overview:string;geography:string;economy:string;strengths:string;risks:string}>={
slavoriya:{overview:"Славория — крупнейшая промышленная держава материка. Высокая урбанизация и развитая банковская система поддерживают внутренний спрос, а металлургия и машиностроение связывают страну с внешними рынками.",geography:"Центральная часть материка: горный север, широкие речные долины и выход к северным морским торговым путям.",economy:"Промышленность, энергетика и финансы формируют ядро ВВП; государство активно инвестирует в инфраструктуру и модернизацию производств.",strengths:"Большой внутренний рынок, энергетическая база, квалифицированные кадры и развитая финансовая инфраструктура.",risks:"Циклический спрос на металлы, высокая капиталоёмкость промышленности и чувствительность банков к стоимости кредита."},
lirania:{overview:"Лирания — морская торговая экономика с крупнейшими портами союза. Её благосостояние тесно связано с международной торговлей, страхованием и движением капитала.",geography:"Западное побережье с глубоководными бухтами, горными районами в центре и плотной сетью рек, ведущих к портам.",economy:"Порты, судоходство, страхование и банки образуют единый логистико-финансовый кластер.",strengths:"Доступ к мировым торговым маршрутам, сильный финансовый сектор, портовая инфраструктура и сервисная экономика.",risks:"Зависимость от мирового товарооборота, ставок фрахта и внешних финансовых условий."},
darvast:{overview:"Дарваст — ресурсная держава востока. Огромная сырьевая база обеспечивает экспортную выручку, но экономика остаётся чувствительной к мировым ценам на нефть и металлы.",geography:"Восточные плато и пустынные районы чередуются с горными хребтами и крупными бассейнами полезных ископаемых.",economy:"Нефть, металлы, энергетика и тяжёлая промышленность поддерживаются железнодорожными экспортными коридорами.",strengths:"Большие запасы сырья, дешёвая энергетическая база и развитая тяжёлая промышленность.",risks:"Цены на сырьё, высокое транспортное плечо и зависимость бюджета от экспортных доходов."},
estraviya:{overview:"Эстравия — технологический центр союза. Университеты и исследовательские кластеры сформировали среду для биотеха, электроники и робототехники.",geography:"Южное побережье с горными районами на западе и плодородными долинами вокруг технологических городов.",economy:"Экспорт высокотехнологичной продукции сочетается с венчурным капиталом, научными разработками и производством компонентов.",strengths:"Человеческий капитал, университеты, инновационная инфраструктура и высокая добавленная стоимость экспорта.",risks:"Длинный цикл окупаемости исследований, высокая конкуренция и зависимость от импорта отдельных компонентов."},
saverniya:{overview:"Саверния — агропромышленный центр с крупным потребительским рынком. Реки и сухопутные коридоры позволяют связывать сельскохозяйственные районы с городами и экспортными терминалами.",geography:"Юго-восточные равнины, широкие речные долины, плодородные земли и длинная береговая линия.",economy:"Агро, пищевая переработка, логистика и розничная торговля образуют устойчивую цепочку от поля до конечного потребителя.",strengths:"Плодородные земли, крупное население, развитая логистика и стабильный внутренний спрос.",risks:"Погода и урожайность, стоимость перевозок и инфляция потребительского спроса."}
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
  return <div className="atlas atlas-realistic">
    <div className="atlas-head"><span>АТЛАС · ФИЗИКО-ПОЛИТИЧЕСКАЯ КАРТА</span><span>СЕВЕР ↑</span></div>
    <svg viewBox="0 0 500 350" className="atlas-svg atlas-world-svg" role="img" aria-label="Физико-политическая карта пяти вымышленных государств">
      <defs>
        <linearGradient id="oceanWorld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b4561"/><stop offset=".5" stopColor="#082f49"/><stop offset="1" stopColor="#041c2c"/></linearGradient>
        <pattern id="oceanWaves" width="48" height="24" patternUnits="userSpaceOnUse"><path d="M0 12 C9 7 15 17 24 12 S39 7 48 12" fill="none" stroke="#9bd2df" strokeOpacity=".08"/></pattern>
        <linearGradient id="terrain-slavoriya" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8ea96f"/><stop offset=".35" stopColor="#557a57"/><stop offset=".7" stopColor="#365a46"/><stop offset="1" stopColor="#203a34"/></linearGradient>
        <linearGradient id="terrain-lirania" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6f9b78"/><stop offset=".45" stopColor="#3f765b"/><stop offset="1" stopColor="#23483d"/></linearGradient>
        <linearGradient id="terrain-darvast" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b68b55"/><stop offset=".4" stopColor="#8b633e"/><stop offset=".72" stopColor="#6a4834"/><stop offset="1" stopColor="#3e3230"/></linearGradient>
        <linearGradient id="terrain-estraviya" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#79a97d"/><stop offset=".45" stopColor="#3d8069"/><stop offset="1" stopColor="#244e48"/></linearGradient>
        <linearGradient id="terrain-saverniya" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9eaf69"/><stop offset=".45" stopColor="#668957"/><stop offset="1" stopColor="#355745"/></linearGradient>
        {countries.map(c=><clipPath id={"countryClip-"+c.id} key={c.id}><path d={c.mapPath}/></clipPath>)}
        <filter id="countryReliefShadow"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#001018" floodOpacity=".45"/></filter>
      </defs>
      <rect width="500" height="350" fill="url(#oceanWorld)"/>
      <rect width="500" height="350" fill="url(#oceanWaves)"/>
      <path className="continent-base" d="M48 113 C75 73 126 52 184 60 C231 46 273 54 319 61 C373 47 427 70 449 111 C466 142 453 184 428 210 C409 235 390 279 352 298 C308 320 252 320 210 304 C169 316 119 297 98 267 C74 247 54 212 60 179 C42 158 37 134 48 113Z"/><g className="ocean-depth-lines"><path d="M12 72 C88 50 125 62 186 45 S307 48 365 33 S454 42 493 24"/><path d="M2 306 C67 286 114 301 174 286 S301 298 356 279 S440 289 500 270"/><path d="M16 184 C69 170 105 179 143 166 M359 150 C405 137 446 149 489 132"/></g>
      {countries.map((c, index) => <g key={c.id} className={"world-country-group "+(selected===c.id?"selected":"")} filter="url(#countryReliefShadow)">
        <path d={c.mapPath} className="country-land-base" style={{fill:"url(#terrain-"+c.id+")"}} onClick={()=>onSelect(c.id)}/>
        <g clipPath={"url(#countryClip-"+c.id+")"}>
          <path d={c.mapPath} className="country-texture"/>
          <path className="terrain-light" d={"M "+(c.capitalX-82)+" "+(c.capitalY-30)+" C "+(c.capitalX-30)+" "+(c.capitalY-70)+" "+(c.capitalX+28)+" "+(c.capitalY-48)+" "+(c.capitalX+78)+" "+(c.capitalY-5)+" C "+(c.capitalX+28)+" "+(c.capitalY-12)+" "+(c.capitalX-28)+" "+(c.capitalY+8)+" "+(c.capitalX-82)+" "+(c.capitalY-30)+" Z"}/>
          <path className="forest-patch" d={"M "+(c.capitalX-45)+" "+(c.capitalY+18)+" C "+(c.capitalX-15)+" "+(c.capitalY-2)+" "+(c.capitalX+35)+" "+(c.capitalY+4)+" "+(c.capitalX+60)+" "+(c.capitalY+32)+" L "+(c.capitalX+48)+" "+(c.capitalY+75)+" C "+(c.capitalX+5)+" "+(c.capitalY+61)+" "+(c.capitalX-35)+" "+(c.capitalY+67)+" "+(c.capitalX-55)+" "+(c.capitalY+42)+" Z"}/>
          <path className="terrain-hill" d={"M "+(c.capitalX-75)+" "+(c.capitalY-25)+" C "+(c.capitalX-50)+" "+(c.capitalY-60)+" "+(c.capitalX-10)+" "+(c.capitalY-38)+" "+(c.capitalX+18)+" "+(c.capitalY-54)+" C "+(c.capitalX+42)+" "+(c.capitalY-68)+" "+(c.capitalX+68)+" "+(c.capitalY-31)+" "+(c.capitalX+88)+" "+(c.capitalY-8)+" L "+(c.capitalX+88)+" "+(c.capitalY+18)+" C "+(c.capitalX+38)+" "+(c.capitalY-2)+" "+(c.capitalX-22)+" "+(c.capitalY+12)+" "+(c.capitalX-75)+" "+(c.capitalY-25)+" Z"}/>
          <path className="mountain-range" d={"M "+(c.capitalX-82)+" "+(c.capitalY-24)+" l 14 -28 15 24 18 -37 17 34 20 -24 17 31 18 -18 18 31"}/>
          <path className="mountain-snow" d={"M "+(c.capitalX-50)+" "+(c.capitalY-52)+" l 12 18 -9 -4 -7 8 Z M "+(c.capitalX+2)+" "+(c.capitalY-59)+" l 12 19 -10 -4 -7 7 Z"}/>
          <path className="river-wide" d={"M "+(c.capitalX-38)+" "+(c.capitalY-78)+" C "+(c.capitalX-25)+" "+(c.capitalY-45)+" "+(c.capitalX-47)+" "+(c.capitalY-18)+" "+(c.capitalX-22)+" "+(c.capitalY+12)+" C "+(c.capitalX-3)+" "+(c.capitalY+35)+" "+(c.capitalX+4)+" "+(c.capitalY+57)+" "+(c.capitalX-14)+" "+(c.capitalY+88)}/>
          <path className="river-thin" d={"M "+(c.capitalX+35)+" "+(c.capitalY-62)+" C "+(c.capitalX+17)+" "+(c.capitalY-30)+" "+(c.capitalX+46)+" "+(c.capitalY-2)+" "+(c.capitalX+25)+" "+(c.capitalY+30)}/>
          <ellipse className="country-lake" cx={c.capitalX-42} cy={c.capitalY+55} rx="13" ry="6"/>
          <g className="forest-dots">{Array.from({length:9},(_,i)=><circle key={i} cx={c.capitalX-35+(i%3)*17} cy={c.capitalY+28+Math.floor(i/3)*11} r="2.4"/>)}</g>
        </g>
        <path d={c.mapPath} className="country-coastline" onClick={()=>onSelect(c.id)}/>
      </g>)}
      {countries.map(c=><g key={c.id} className={"capital "+(selected===c.id?"capital-active":"")} onClick={()=>onSelect(c.id)}><text className="country-name-label" x={c.capitalX} y={c.capitalY+30} textAnchor="middle">{c.name.toUpperCase()}</text><circle cx={c.capitalX} cy={c.capitalY} r="7"/><circle cx={c.capitalX} cy={c.capitalY} r="2.4"/><text x={c.capitalX+10} y={c.capitalY-9}>{c.capital}</text></g>)}
      {showCompanies && countries.find(c=>c.id===selected)?.companies.map((company,index)=>{
        const dx=index%2===0?14:-14, dy=index<2?-16:17;
        return <g key={company.ticker} className="company-marker country-company-marker map-company-callout" onClick={e=>{e.stopPropagation();onCompany?.(company)}}><line x1={company.x} y1={company.y} x2={company.x+dx} y2={company.y+dy} className="company-leader"/><circle cx={company.x} cy={company.y} r="6"/><circle cx={company.x} cy={company.y} r="2"/><g transform={"translate("+(company.x+dx)+","+(company.y+dy)+")"}><rect x="-3" y="-12" width={company.ticker.length*7+12} height="17" rx="6" className="company-label-bg"/><text x="3" y="0">{company.ticker}</text></g></g>;
      })}
      <text className="sea-label" x="24" y="30">СЕВЕРНЫЙ ОКЕАН</text><text className="sea-label" x="382" y="330">ЮЖНОЕ МОРЕ</text>
      <g className="compass"><circle cx="466" cy="30" r="17"/><text x="463" y="16">N</text><path d="M466 19V41M455 30H477"/></g>
    </svg>
    <div className="map-key"><span><b className="dot"/> столица</span><span><b className="line"/> торговый маршрут</span><span><b className="mount"/> горы · леса · реки</span>{showCompanies&&<span><b className="company-dot"/> компания</span>}</div>
  </div>;
}

function CountryMap({ country, onCompany }: { country: Country; onCompany?: (company: CompanyPreview) => void }) {
  const scale=2.15, tx=250-country.capitalX*scale, ty=175-country.capitalY*scale;
  return <div className="map-static country-map atlas">
    <div className="atlas-head"><span>ФИЗИЧЕСКАЯ КАРТА · {country.name.toUpperCase()}</span><span>СЕВЕР ↑</span></div>
    <svg viewBox="0 0 500 350" className="atlas-svg country-atlas-svg" role="img" aria-label={"Рельефная карта страны "+country.name+" с компаниями"}>
      <defs>
        <linearGradient id={"countryOcean-"+country.id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b4964"/><stop offset="1" stopColor="#041b2b"/></linearGradient>
        <linearGradient id={"countryLand-"+country.id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a9c58b"/><stop offset=".52" stopColor="#7f9e69"/><stop offset="1" stopColor="#536d55"/></linearGradient>
        <clipPath id={"selectedCountryClip-"+country.id}><path d={country.mapPath}/></clipPath>
        <filter id={"selectedCountryShadow-"+country.id}><feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#000" floodOpacity=".5"/></filter>
      </defs>
      <rect width="500" height="350" fill={"url(#countryOcean-"+country.id+")"}/>
      <path className="country-sea-contours" d="M20 80 C90 45 140 66 194 42 S310 57 365 38 S451 50 490 28 M10 278 C82 248 128 280 188 257 S309 276 365 249 S447 270 495 245"/>
      <g transform={"translate("+tx+" "+ty+") scale("+scale+")"} filter={"url(#selectedCountryShadow-"+country.id+")"}>
        <path d={country.mapPath} className="country-land-fill" style={{fill:"url(#countryLand-"+country.id+")"}}/>
        <g clipPath={"url(#selectedCountryClip-"+country.id+")"} className="country-physical-detail">
          <path className="biome-meadow" d="M70 215 C115 185 164 205 205 226 C250 248 294 230 340 215 C388 198 420 212 458 232 L458 350 L70 350Z"/>
          <path className="forest-mass" d="M82 185 C130 160 170 173 204 196 C235 216 266 209 300 188 C339 165 378 169 423 190 L440 238 C391 219 356 218 318 237 C277 258 236 263 195 241 C154 220 121 222 88 240Z"/>
          <path className="mountain-shadow" d="M65 155 C105 112 143 121 177 145 C210 168 242 164 274 139 C310 110 348 112 381 139 C408 161 430 155 452 133 L462 191 C426 209 390 200 357 181 C322 162 293 168 260 193 C224 218 192 208 160 188 C126 167 95 172 68 195Z"/>
          <path className="mountain-range" d="M76 138 L91 109 106 130 124 94 143 129 161 102 179 137 198 112 218 144 237 120 257 148 M270 145 L288 111 305 134 322 95 340 133 359 106 377 139 395 118 416 149"/>
          <path className="mountain-snow" d="M116 106 l8 -13 9 15 -8 -3z M315 107 l7 -13 10 15 -9 -3z M198 123 l8 -11 9 13 -8 -2z"/>
          <path className="river-wide" d="M218 66 C213 98 228 119 216 145 C204 171 196 191 207 213 C217 232 234 242 241 264 C247 282 241 303 229 329"/>
          <path className="river-thin" d="M302 75 C293 106 300 129 315 151 C330 172 344 182 351 204 C358 226 351 250 341 272"/>
          <path className="river-thin" d="M154 106 C171 127 177 147 168 169 C160 189 166 208 181 226"/>
          <ellipse className="country-lake" cx="143" cy="235" rx="22" ry="9"/><ellipse className="country-lake" cx="381" cy="215" rx="17" ry="7"/>
          <path className="terrain-contour" d="M57 160 C100 137 131 141 163 160 C194 179 220 188 251 170 C282 151 312 153 343 170 C374 187 403 184 440 162 M58 183 C95 160 127 165 158 183 C191 203 220 210 252 192 C284 173 313 176 345 192 C377 209 404 205 438 185"/>
          <g className="forest-dots">{Array.from({length:35},(_,i)=><circle key={i} cx={78+(i%7)*48} cy={205+Math.floor(i/7)*19+(i%2)*4} r={i%3===0?2.5:1.7}/>)}</g>
        </g>
        <path d={country.mapPath} className="country-coastline"/>
        {country.companies.map((company,index)=>{
          const dx=index%2===0?14:-14, dy=index<2?-15:18;
          return <g key={company.ticker} className="company-marker country-company-marker map-company-callout" onClick={e=>{e.stopPropagation();onCompany?.(company)}}><line x1={company.x} y1={company.y} x2={company.x+dx} y2={company.y+dy} className="company-leader"/><circle cx={company.x} cy={company.y} r="6"/><circle cx={company.x} cy={company.y} r="2"/><g transform={"translate("+(company.x+dx)+","+(company.y+dy)+")"}><rect x="-3" y="-12" width={company.ticker.length*7+12} height="17" rx="6" className="company-label-bg"/><text x="3" y="0">{company.ticker}</text></g></g>;
        })}
        <g className="capital capital-active"><circle cx={country.capitalX} cy={country.capitalY} r="8"/><circle cx={country.capitalX} cy={country.capitalY} r="2.6"/><text x={country.capitalX+12} y={country.capitalY-10}>{country.capital}</text></g>
      </g>
      <g className="map-overlay-label"><text x="18" y="28">{country.region}</text><text x="18" y="48">РЕЛЬЕФ · ЛЕСА · ВОДА · ГОРОДА · КОМПАНИИ</text></g>
    </svg>
    <div className="map-key"><span><b className="dot"/> столица</span><span><b className="mount"/> горы · леса</span><span><b className="company-dot"/> компания · нажми</span></div>
  </div>;
}

function WorldPreview() {
  return <AtlasMap selected={countries[0].id} onSelect={()=>{}} />;
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
  const country=countries.find(c=>c.id===selected)??countries[0]; const lore=countryLore[country.id];
  return <div className="setup-screen"><div className="setup-inner wide"><div className="step">03 / 04</div><span className="eyebrow">ВЫБОР СТРАНЫ</span><h1>Выбери свой рынок.</h1><p className="setup-lead">Пять государств объединены общей валютой VLR, но у каждого — собственная география, промышленность, ресурсы, риски и биржевая культура.</p>
    <div className="country-picker"><AtlasMap selected={selected} onSelect={setSelected}/><div className="country-options">{countries.map(c=><button key={c.id} className={c.id===selected?"country-option active":"country-option"} onClick={()=>setSelected(c.id)}><Flag country={c}/><span><b>{c.name}</b><small>{c.region} · {c.population}</small></span><strong>{c.currencySymbol}</strong></button>)}</div></div>
    <div className="country-profile country-profile-rich"><div className="profile-title"><Flag country={country}/><div><span className="eyebrow">ПРОФИЛЬ РЫНКА · ДОСЬЕ</span><h2>{country.name}</h2><p>{lore.overview}</p></div></div>
      <div className="profile-stats"><div><span>СТОЛИЦА</span><b>{country.capital}</b></div><div><span>ЕДИНАЯ ВАЛЮТА</span><b>{country.currency} · {country.currencySymbol}</b></div><div><span>БИРЖА</span><b>{country.exchange}</b></div><div><span>НАСЕЛЕНИЕ</span><b>{country.population}</b></div></div>
      <div className="country-detail-grid"><div><span>ГЕОГРАФИЯ</span><p>{lore.geography}</p></div><div><span>ЭКОНОМИКА</span><p>{lore.economy}</p></div><div><span>СИЛЬНЫЕ СТОРОНЫ</span><p>{lore.strengths}</p></div><div><span>РИСКИ РЫНКА</span><p>{lore.risks}</p></div></div>
      <div className="company-preview"><span className="eyebrow">КЛЮЧЕВЫЕ КОМПАНИИ</span><h3>Крупнейшие игроки рынка</h3><div className="company-strip">{country.companies.map(c=><div key={c.ticker}><b>{c.ticker}</b><strong>{c.name}</strong><small>{c.sector}</small></div>)}</div></div>
    </div><div className="setup-actions"><span className="setup-hint">Физическая карта показывает рельеф, водную систему, столицы и границы.</span><button className="primary small" onClick={onNext}>Выбрать {country.name}<b>→</b></button></div>
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

type ChartRange="ALL"|"10Y"|"5Y"|"1Y"|"6M"|"1M"|"1W"|"1D";
const chartRangeLabels:[ChartRange,string][]=[["ALL","Всё время"],["10Y","10 лет"],["5Y","5 лет"],["1Y","1 год"],["6M","6 месяцев"],["1M","1 месяц"],["1W","1 неделя"],["1D","1 день"]];
function CandleChart({company,points,range}:{company:CompanyPreview;points:number[];range:ChartRange}) {
  const source=points.length>180?points.filter((_,i)=>i===0||i===points.length-1||i%Math.ceil(points.length/180)===0):points;
  const bars=source.slice(-180).map((close,i)=>{const prev=i===0?source[Math.max(0,source.length-2)]:source[i-1];const open=prev;const rangeSize=Math.max(35,Math.round(close*(0.006+(i%7)*0.0018)));return {open,close,high:Math.max(open,close)+rangeSize,low:Math.min(open,close)-rangeSize};});
  const min=Math.min(...bars.map(b=>b.low)),max=Math.max(...bars.map(b=>b.high)),span=Math.max(1,max-min); const y=(v:number)=>12+((max-v)/span)*86; const step=500/Math.max(1,bars.length);
  const first=bars[0]?.close??0,last=bars[bars.length-1]?.close??0,change=first?((last-first)/first)*100:0;
  return <div className="candle-terminal"><div className="candle-head"><div><span>ЯПОНСКИЕ СВЕЧИ · {range}</span><b>{last.toLocaleString("ru-RU")} VLR</b></div><strong className={change>=0?"gain":"loss"}>{change>=0?"+":""}{change.toFixed(2)}%</strong></div>
    <svg viewBox="0 0 500 108" preserveAspectRatio="none" aria-label={"Японские свечи "+company.ticker+", период "+range}><path d="M0 92H500M0 65H500M0 38H500M0 11H500" className="grid-line"/>{bars.map((b,i)=>{const x=i*step+step/2,up=b.close>=b.open,body=Math.max(1.6,Math.abs(y(b.open)-y(b.close)));return <g key={i} className={up?"candle up":"candle down"}><line x1={x} x2={x} y1={y(b.high)} y2={y(b.low)}/><rect x={x-step*.34} y={Math.min(y(b.open),y(b.close))} width={Math.max(1,step*.68)} height={body}/></g>})}</svg>
    <div className="candle-axis"><span>{range==="1D"?"начало сессии":range==="1W"?"7 дней назад":range==="1M"?"месяц назад":range==="6M"?"6 месяцев назад":range==="1Y"?"год назад":range==="5Y"?"5 лет назад":range==="10Y"?"10 лет назад":"начало истории"}</span><span>середина</span><span>сейчас</span></div></div>;
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
  const [chartRange,setChartRange]=useState<ChartRange>("1Y");
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
    const live=Math.sin(marketPulse/5200+seed)*0.0025+Math.cos(marketPulse/9100+seed*0.7)*0.0015;
    return Math.max(2500,Math.round(base*(1+wave+trend+event+live)/50)*50);
  };
  const priceChange=(company:CompanyPreview)=>{
    const oldDay=Math.max(1,day-1);
    const old=priceFor(company,oldDay);
    return ((priceFor(company,day)-old)/old)*100;
  };
  const history=(company:CompanyPreview, range:ChartRange=chartRange)=>{const lengths:Record<ChartRange,number>={ALL:3650,"10Y":3650,"5Y":1825,"1Y":365,"6M":182,"1M":30,"1W":7,"1D":1};const len=lengths[range];return Array.from({length:Math.max(2,len)},(_,i)=>priceFor(company,day-len+1+i));};
  const portfolioValue=useMemo(()=>country.companies.reduce((sum,c)=>sum+(holdings[c.ticker]||0)*priceFor(c),0),[country.companies,holdings,day,marketPulse]);
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
    <header className="game-topbar"><button className="game-brand" onClick={()=>setTab("overview")}><span>MA</span><b>MarketArena</b></button><nav>{tabs.map(([id,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}>{label}</button>)}</nav><div className="game-right"><span className="offline-pill live-pill"><i/> LIVE</span><span>ДЕНЬ {day}</span><b>{totalWealth.toLocaleString("ru-RU")} VLR</b></div></header>
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
        {tab==="exchange"&&<Panel title={"Биржа · "+country.name} eyebrow="MARKET"><p className="panel-lead">Рабочий терминал рынка: выбери тикер, изучи график, мультипликаторы и последний информационный импульс, затем совершай сделку.</p><div className="exchange-overview"><div><span>ИНДЕКС РЫНКА</span><b>{(1000+country.companies.reduce((s,c)=>s+priceChange(c),0)*3).toFixed(1)}</b><small>динамика за день</small></div><div><span>КОМПАНИЙ</span><b>{country.companies.length}</b><small>публичный рынок</small></div><div><span>СЕГОДНЯ</span><b>ДЕНЬ {day}</b><small>следующий тик →</small></div><div><span>СВОБОДНЫЕ ДЕНЬГИ</span><b>{cash.toLocaleString("ru-RU")} VLR</b><small>доступно для сделок</small></div></div><div className="exchange-spotlight">{(()=>{const focus=selectedCompany??country.companies[0];const m=companyProfile(focus,country);return <><div className="spotlight-head"><div><span className="ticker">{focus.ticker}</span><h2>{focus.name}</h2><p>{focus.sector} · {m.headquarters}</p></div><div className="spotlight-price"><b>{priceFor(focus).toLocaleString("ru-RU")} VLR</b><span className={priceChange(focus)>=0?"gain":"loss"}>{priceChange(focus)>=0?"+":""}{priceChange(focus).toFixed(2)}%</span></div></div><div className="chart-range-tabs">{chartRangeLabels.map(([id,label])=><button key={id} className={chartRange===id?"active":""} onClick={()=>setChartRange(id)}>{label}</button>)}</div><CandleChart company={focus} points={history(focus,chartRange)} range={chartRange}/><div className="live-market-tape"><span className="live-dot"></span><b>РЫНОК В РЕАЛЬНОМ ВРЕМЕНИ</b><span>{country.companies[liveNewsIndex%country.companies.length].name}: {marketEvent(country.companies[liveNewsIndex%country.companies.length],day).headline}</span></div><div className="spotlight-bottom"><div><span>P / E</span><b>{m.pe}</b></div><div><span>P / B</span><b>{m.pb}</b></div><div><span>ДИВИДЕНД</span><b>{m.dividendYield}</b></div><div className="spotlight-news"><span>ПОСЛЕДНИЙ ФАКТОР</span><b>{eventLabel(focus,day)}</b></div><div className="spotlight-actions"><button onClick={()=>sell(focus)} disabled={!holdings[focus.ticker]}>Продать</button><button className="primary small" onClick={()=>buy(focus)}>Купить</button></div></div></>})()}</div><div className="table-card"><div className="table-row table-head"><b>ТИКЕР</b><span>КОМПАНИЯ</span><span>ОТРАСЛЬ</span><strong>КОТИРОВКА</strong><em>СДЕЛКА</em></div>{country.companies.map(c=>{const p=priceFor(c),ch=priceChange(c),qty=holdings[c.ticker]||0;return <div className="table-row" key={c.ticker}><button className="ticker-link" onClick={()=>setSelectedCompany(c)}>{c.ticker}</button><span>{c.name}</span><span>{c.sector}</span><strong>{p.toLocaleString("ru-RU")} VLR <small className={ch>=0?"gain":"loss"}>{ch>=0?"+":""}{ch.toFixed(2)}%</small></strong><div className="trade-actions"><button onClick={()=>buy(c)}>Купить</button><button onClick={()=>sell(c)} disabled={!qty}>Продать</button><b>{qty} шт.</b></div></div>})}</div></Panel>}
        {tab==="portfolio"&&<Panel title="Портфель" eyebrow="YOUR CAPITAL"><div className="portfolio-summary"><div><span>СТОИМОСТЬ АКТИВОВ</span><b>{portfolioValue.toLocaleString("ru-RU")} VLR</b></div><div><span>СВОБОДНЫЕ ДЕНЬГИ</span><b>{cash.toLocaleString("ru-RU")} VLR</b></div><div><span>ВСЕГО</span><b>{totalWealth.toLocaleString("ru-RU")} VLR</b></div></div><div className="table-card portfolio-table">{country.companies.filter(c=>(holdings[c.ticker]||0)>0).map(c=><div className="table-row" key={c.ticker}><button className="ticker-link" onClick={()=>setSelectedCompany(c)}>{c.ticker}</button><span>{c.name}</span><span>{holdings[c.ticker]} акций</span><strong>{(holdings[c.ticker]*priceFor(c)).toLocaleString("ru-RU")} VLR</strong><div className="trade-actions"><button onClick={()=>buy(c)}>+ Купить</button><button onClick={()=>sell(c)}>- Продать</button></div></div>)}{portfolioValue===0&&<div className="empty-state">Портфель пуст. Открой «Биржу» и купи первую акцию.</div>}</div></Panel>}
        {tab==="companies"&&<Panel title={"Компании · "+country.name} eyebrow="PUBLIC COMPANIES"><p className="panel-lead">Каждая компания получает собственную карточку, котировку и профиль CEO. Нажми на карточку для подробностей.</p><div className="company-grid">{country.companies.map(c=><article className="company-focus-card" key={c.ticker} onClick={()=>setSelectedCompany(c)}><div className="company-focus-top"><span className="ticker">{c.ticker}</span><span className="sector-chip">{c.sector}</span></div><h3>{c.name}</h3><p>{c.note}</p><div className="company-ceo"><CEOAvatar company={c}/><div><span className="eyebrow">CEO · {c.ceoRole}</span><b>{c.ceo}</b><small>{c.ceoAge} лет</small></div></div><div className="company-focus-footer"><span>Котировка <b>{priceFor(c).toLocaleString("ru-RU")} VLR</b></span><button onClick={e=>{e.stopPropagation();buy(c)}}>Купить 1 акцию</button></div></article>)}</div></Panel>}
        {tab==="life"&&<Panel title="Жизнь" eyebrow="CAREER & LIFE"><p className="panel-lead">До большого капитала можно дойти через работу: каждый игровой день ты выбираешь, где заработать деньги для следующих инвестиций.</p>{jobs.map(j=><div className="life-job" key={j.id}><div><b>{j.title}</b><span>{j.text}</span></div><strong>{j.pay.toLocaleString("ru-RU")} VLR</strong><button disabled={jobCooldown===j.id} onClick={()=>work(j.id,j.pay)}>Работать</button></div>)}</Panel>}
        {tab==="map"&&<Panel title={"Карта "+country.name} eyebrow="ATLAS"><p className="panel-lead">Здесь показана именно выбранная страна: её рельеф, реки, столица и расположение публичных компаний.</p><CountryMap country={country} onCompany={setSelectedCompany}/></Panel>}
        {tab==="news"&&<Panel title="Новости" eyebrow="ECONOMIC NEWS"><p className="panel-lead">Новости поступают в живую ленту симуляции: информационные импульсы меняют котировки, а новые сообщения появляются независимо от нажатия «Следующий день».</p><div className="news-list">{country.companies.slice(0,3).map((c,i)=>{const e=marketEvent(c,day);return <article key={c.ticker}><span>{String(8+i*3).padStart(2,"0")}:30</span><div><b>{c.name}: {e.headline}</b><p>Котировка {c.ticker}: <strong className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"+":""}{(e.impact*100).toFixed(2)}%</strong> фактор события. Итоговая цена учитывает тренд, волатильность и этот информационный импульс.</p></div><strong>{c.sector.toUpperCase()}</strong></article>})}</div><div className="news-transactions"><span className="eyebrow">ИСТОРИЯ СДЕЛОК</span>{transactions.slice(0,6).map((t,i)=><div key={i}><b className={t.type==="BUY"?"loss":"gain"}>{t.type}</b><span>День {t.day} · {t.ticker} · {t.quantity} шт.</span><strong>{(t.price*t.quantity).toLocaleString("ru-RU")} VLR</strong></div>)}{transactions.length===0&&<p>Сделок пока нет. Первая покупка появится здесь сразу после подтверждения.</p>}</div></Panel>}
      </main>
    </div>
    {selectedCompany&&<div className="company-modal-backdrop" onClick={()=>setSelectedCompany(null)}><div className="company-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelectedCompany(null)}>×</button><div className="modal-company-head"><CEOAvatar company={selectedCompany}/><div><span className="ticker">{selectedCompany.ticker}</span><h2>{selectedCompany.name}</h2><p>{selectedCompany.sector} · публичная компания · {country.name}</p></div></div><div className="modal-grid"><div><span className="eyebrow">О КОМПАНИИ</span><p className="company-description">{companyProfile(selectedCompany,country).description}</p><div className="company-metrics">{[["КАПИТАЛИЗАЦИЯ",companyProfile(selectedCompany,country).marketCap],["ВЫРУЧКА",companyProfile(selectedCompany,country).revenue],["ЧИСТАЯ ПРИБЫЛЬ",companyProfile(selectedCompany,country).netProfit],["P / E",companyProfile(selectedCompany,country).pe],["P / B",companyProfile(selectedCompany,country).pb],["ДИВИДЕНД",companyProfile(selectedCompany,country).dividendYield]].map(([label,value])=><div key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="chart-range-tabs">{chartRangeLabels.map(([id,label])=><button key={id} className={chartRange===id?"active":""} onClick={()=>setChartRange(id)}>{label}</button>)}</div><CandleChart company={selectedCompany} points={history(selectedCompany,chartRange)} range={chartRange}/><CompanyChart company={selectedCompany} points={history(selectedCompany,chartRange)}/><div className="quote-box"><span>ТЕКУЩАЯ КОТИРОВКА</span><b>{priceFor(selectedCompany).toLocaleString("ru-RU")} VLR</b><small className={priceChange(selectedCompany)>=0?"gain":"loss"}>{priceChange(selectedCompany)>=0?"+":""}{priceChange(selectedCompany).toFixed(2)}% за день</small><small>Дивидендная доходность · {companyProfile(selectedCompany,country).dividendYield} годовых</small></div><div className="modal-buy"><span>В портфеле: <b>{holdings[selectedCompany.ticker]||0} шт.</b></span><div><button className="secondary-action" onClick={()=>sell(selectedCompany)}>Продать</button><button className="primary small" onClick={()=>buy(selectedCompany)}>Купить акцию</button></div></div></div><div className="ceo-profile"><span className="eyebrow">CEO · ПЕРСОНАЖ</span><h3>{selectedCompany.ceo}</h3><b>{selectedCompany.ceoAge} лет · {selectedCompany.ceoRole}</b><p>{selectedCompany.ceoBio}</p><p><strong>Стратегия:</strong> {companyProfile(selectedCompany,country).strategy}</p><p><strong>Цели на игровой год:</strong> {companyProfile(selectedCompany,country).goals}</p><div className="company-facts"><span>Основана</span><b>{companyProfile(selectedCompany,country).founded}</b><span>Штат</span><b>{companyProfile(selectedCompany,country).employees}</b><span>Штаб-квартира</span><b>{companyProfile(selectedCompany,country).headquarters}</b><span>Ресурсы</span><b>{companyProfile(selectedCompany,country).materials}</b></div><div className="ceo-tags"><span>Биография</span><span>Репутация</span><span>Стиль управления</span></div></div></div></div></div>}
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
