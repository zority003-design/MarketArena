import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { commonCurrency, countries, difficultyLevels, type CompanyPreview, type Country } from "./data/world";
import { Atlas3D } from "./Atlas3D";
import { GAME_CONFIG, dailyLifestyleCost } from "./game/economy";
import { JobMiniGame } from "./game/JobMiniGame";
import { LifeAvatar } from "./game/LifeAvatar";
import { companyMarketSignal, macroEventForDay, quarterlyFinancials, commoditySignal, marketPriceAtDay, companyEconomicProfile, wageIndexAtDay, economicSnapshot } from "./game/worldEngine";

type Screen = "auth" | "mode" | "country" | "difficulty" | "game";
type GameTab = "overview" | "exchange" | "portfolio" | "companies" | "life" | "map" | "news" | "events" | "history" | "updates" | "profile" | "economy";
type Transaction = { day:number; type:"BUY"|"SELL"; ticker:string; quantity:number; price:number };
type GameSave = {
  player:string; countryId:string; difficulty:string; cash:number; holdings:Record<string,number>;
  day:number; transactions:Transaction[]; tab:GameTab; savedAt:string; careerXP?:number; achievements?:string[]; campaignMissions?:string[]; earnedIncome?:number; economyVisited?:boolean; miniGamesCompleted?:number; crisisSurvived?:boolean; startingCapital?:number;
  loan?:{principal:number;balance:number;lastChargeDay:number;rate:number}|null;
  ownedCompanies?:string[]; jobXP?:Partial<Record<JobId,number>>; lastJobDay?:number; miniGameRewardDay?:number; workActionsDay?:number; workActions?:number; housing?:keyof typeof GAME_CONFIG.housing; food?:keyof typeof GAME_CONFIG.food; transport?:keyof typeof GAME_CONFIG.transport; appearance?:keyof typeof GAME_CONFIG.appearance; energy?:number;
};

const PATCH_NOTES = [
  { version:"v1.0.3", date:"6 октября 2026", title:"Живой экономический движок: рынок, зарплаты, капитализация и новости связаны в одну систему", added:["дифференцированная капитализация: микро-, малые, средние, крупные и мега-компании","динамические зарплаты, зависящие от страны, инфляции, безработицы и сектора","экономический HUD: ВВП, инфляция, ставка, зарплаты и спрос","квартальные отчёты с фактом против ожиданий","сырьевые, макроэкономические и межотраслевые каналы влияния"], improved:["котировки теперь используют фундаментальный размер компании и экономический режим, а не только случайный тренд","новости показывают категорию, сырьевой фактор и влияние на рынок","контроль 51% рассчитывается от текущей капитализации компании","рынок стал различать компании по качеству, долговой нагрузке, марже и бете"], fixed:["слишком одинаковый масштаб компаний","разрыв между ценой акции и капитализацией","зарплаты существовали отдельно от экономики рынка","квартальные отчёты не показывали ожидания рынка"] },

  { version:"v1.0.2", date:"6 октября 2026", title:"MarketArena — визуальный редизайн и углубление экономической стратегии", added:["замедленный календарь: 5 минут на игровой день в режиме ×1","системные кризисы: банковский, энергетический, торговый, рецессионный и сырьевой","кредитный рычаг с лимитом, процентами и погашением","контроль публичных компаний через пакет 51% и доход холдинга","ежедневный лимит оплачиваемой работы","2D-мини-игры профессий: дворник, курьер, аналитик и фриланс","глобальная дорожная карта от первого дохода до экономической группы","понятное объяснение акции, продажи, контроля 51%, кредита и риска","новая фирменная система MarketArena в цветах логотипа"], improved:["премиальная типографика Inter + Manrope вместо старой дешёвой визуальной подачи","логотип MarketArena центрирован в квадратной композиции и используется на стартовом экране","верхняя навигация стала крупнее, закреплена при прокрутке и больше не подпрыгивает за границу панели","флаги стран переработаны как самостоятельные игровые символы без белых плиток","карта получила более плотную зелёную среду, траву, кусты, деревья и более близкий стартовый зум","главный экран структурирован как командный центр: цель → карта → капитал → работа → риск → финансирование → компании","биржевые OHLC-свечи переработаны: разные тела, разные тени, волатильность и корректные интервалы для 1D/1W/1M/6M/1Y/5Y/10Y","при паузе исторический график остаётся статичным, а переключение разделов закрывает открытое досье","на карточках компаний отображаются текущая цена и дневное движение","поглощение переименовано в понятный контроль 51% и объяснено как покупка контрольного пакета, а не 100% компании","добавлена более ясная структура глобальной цели и правил экономической империи"], fixed:["слишком быстрый темп 365-дневной кампании","нулевое отображение дневного движения из-за грубого округления котировки","одинаковые свечи с чрезмерными тенями и слишком плавным многолетним трендом","переполнение и подпрыгивание кнопок верхней навигации","визуально лишние полосы прокрутки","неясное значение кнопки поглощения"] },
  { version:"v1.0.1", date:"5 октября 2026", title:"Большое обновление рынка, интерфейса и игрового мира", added:["полноценная биржа с торговым терминалом и покупкой/продажей акций","японские OHLC-свечи с несколькими диапазонами от 1D до ALL","живое игровое время: пауза, ×1, ×1.5 и ×2","профиль игрока с рекордами, статистикой и выходом из аккаунта","система сохранения отдельных игровых профилей","расширенные досье компаний, CEO, стратегии и финансовые показатели","новости, события, отчёты и аналитические сигналы компаний","расширенная карта стран с городами, дорогами, растительностью и пешеходами"], improved:["верхний игровой HUD и постоянная навигация между разделами","визуальный стиль MarketArena в формате экономической стратегии","командная панель с аккуратными SVG-иконками и понятными разделами","карточки компаний, биржевой терминал и модальные досье","реалистичность движения котировок и формирование свечей","карта выбранной страны и распределение городской жизни","читаемость профилей стран и инвестиционных факторов","адаптивность интерфейса на узких экранах","история сделок, портфель и отображение капитала"], fixed:["переходы в биржу и открытие выбранной компании","сбои биржевого экрана после восстановления сохранения","залипание и скачки верхней навигации при наведении","переполнение элементов биржи и верхней панели","замораживание котировок при постановке рынка на паузу","слишком резкие и неестественные движения исторических свечей","проблемы с отображением карты, дорог и растительности","неактивный показатель дивидендов убран до появления полноценной механики выплат"] },
  { version:"v1.0.0", date:"1 октября 2026", title:"Офлайн-основа", added:["профиль игрока","выбор страны","классы старта","первые рабочие места и рынок"], improved:[], fixed:[] }
] as const;


const CAMPAIGN_MISSIONS=[
  {id:"start",chapter:1,title:"Первый капитал",text:"Заработай 5 000 VLR и проведи первую сделку на бирже.",reward:2500},
  {id:"market",chapter:2,title:"Понять рынок",text:"Купи акции компании и продержи позицию минимум один игровой день.",reward:3000},
  {id:"research",chapter:3,title:"Читать экономику",text:"Открой раздел «Экономика» и изучи хотя бы три показателя.",reward:1800},
  {id:"life",chapter:4,title:"Устроить быт",text:"Подними качество жизни выше 60/100.",reward:3500},
  {id:"career",chapter:5,title:"Профессиональный рост",text:"Достигни 3-го уровня карьеры.",reward:5000},
  {id:"portfolio",chapter:6,title:"Первый портфель",text:"Собери позиции минимум в трёх компаниях.",reward:6500},
  {id:"crisis",chapter:7,title:"Не сломаться в кризис",text:"Переживи макроэкономический шок, сохранив положительный капитал.",reward:9000},
  {id:"control",chapter:8,title:"Влияние",text:"Сформируй пакет от 10% в одной публичной компании.",reward:12000},
  {id:"mini",chapter:9,title:"Работать головой",text:"Заверши три профессиональные мини-игры.",reward:7000},
  {id:"final",chapter:10,title:"Экономическая группа",text:"Дойди до конца кампании и сохрани положительный финансовый результат.",reward:25000}
] as const;

const jobs = [
  { id: "janitor", title: "Дворник", pay: 900, time: "3 часа", unlock: 1, sector: "Городская инфраструктура", text: "Пройди двор, собери мусор и не теряй время на чистых участках." },
  { id: "courier", title: "Курьер", pay: 1400, time: "3 часа", unlock: 1, sector: "Логистика", text: "Построй маршрут по городу, доставь заказы и избегай лишних шагов." },
  { id: "cashier", title: "Кассир", pay: 1650, time: "3 часа", unlock: 2, sector: "Ритейл", text: "Обслужи покупателей, быстро посчитай сдачу и не допускай ошибок." },
  { id: "analyst", title: "Помощник аналитика", pay: 2100, time: "2 часа", unlock: 3, sector: "Финансы", text: "Найди аномалии на графике и отличи информационный сигнал от шума." },
  { id: "junioranalyst", title: "Младший аналитик", pay: 3200, time: "3 часа", unlock: 5, sector: "Инвестиции", text: "Разбери инвестиционный кейс: рост, прибыль, долг, оценка и новостной риск." }
];
type JobId = "janitor"|"courier"|"cashier"|"analyst"|"junioranalyst";
const jobProgression:Record<JobId,{levels:number[];names:string[];bonuses:string[]}> = {
  janitor:{levels:[0,3,6,10,15],names:["Новичок","Опытный дворник","Бригадир","Старший мастер","Начальник участка"],bonuses:["Базовая смена","−5% энергии","−10% энергии","+8% к оплате","+15% к оплате"]},
  courier:{levels:[0,3,6,10,15],names:["Новичок","Опытный курьер","Маршрутчик","Старший курьер","Координатор"],bonuses:["Базовый маршрут","−5% энергии","−10% энергии","+8% к оплате","+15% к оплате"]},
  cashier:{levels:[0,3,6,10,15],names:["Новичок","Опытный кассир","Старший кассир","Администратор кассы","Управляющий сменой"],bonuses:["Базовая касса","−5% энергии","−10% энергии","+8% к оплате","+15% к оплате"]},
  analyst:{levels:[0,3,6,10,15],names:["Стажёр","Помощник","Аналитик","Старший аналитик","Ведущий аналитик"],bonuses:["Базовый терминал","−5% энергии","−10% энергии","+8% к оплате","+15% к оплате"]},
  junioranalyst:{levels:[0,3,6,10,15],names:["Стажёр","Младший аналитик","Инвестиционный аналитик","Старший аналитик","Портфельный аналитик"],bonuses:["Базовый кейс","−5% энергии","−10% энергии","+8% к оплате","+15% к оплате"]}
};
const jobLevel=(id:JobId,xp:number)=>Math.min(5,1+jobProgression[id].levels.filter(v=>xp>=v).length-1);
const jobBonusMultiplier=(id:JobId,xp:number)=>{const level=jobLevel(id,xp);return level>=5?1.15:level>=4?1.08:1;};


const lifestyleNames={housing:{dormitory:"Общежитие",shared:"Общий дом",studio:"Студия",apartment:"Апартаменты",premium:"Премиум-апартаменты"},food:{basic:"Базовое",balanced:"Сбалансированное",premium:"Премиум"},transport:{walk:"Пешком",public:"Общественный транспорт",scooter:"Скутер",car:"Автомобиль",executive:"Представительский автомобиль"},appearance:{basic:"Повседневная",neat:"Аккуратная",professional:"Профессиональная",executive:"Премиальная"}} as const;
const lifestyleUnlock:Record<string,Record<string,number>>={housing:{dormitory:0,shared:35_000,studio:75_000,apartment:180_000,premium:750_000},food:{basic:0,balanced:40_000,premium:300_000},transport:{walk:0,public:0,scooter:60_000,car:180_000,executive:800_000},appearance:{basic:0,neat:30_000,professional:120_000,executive:600_000}} as const;
function companyProfile(company: CompanyPreview, country: Country) {
  const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);
  const materialMap:Record<string,string>={"Металлы":"железная руда, уголь, цветные концентраты","Энергетика":"газ, вода, сетевые мощности и топливо","Финансы":"капитал, депозиты и корпоративный кредит","Машиностроение":"сталь, электроника и промышленное оборудование","Судоходство":"топливо, контейнеры и портовая инфраструктура","Страхование":"капитал, перестрахование и данные о рисках","Порты":"земля, склады, контейнерные мощности","Нефть":"нефть, газ и нефтехимическое сырьё","Логистика":"топливо, вагоны, дороги и складские площади","Биотех":"лабораторное оборудование, реагенты и научные кадры","Технологии":"серверы, электроника и инженерные кадры","Электроника":"кремний, медь и высокоточные компоненты","Робототехника":"электроника, приводы и промышленное ПО","Агро":"зерно, удобрения, вода и сельхозземля","Ритейл":"продукты, логистика и потребительский спрос"};
  const sectorNarrative:Record<string,string>={"Металлы":"Производит базовые материалы для строительства, транспорта и тяжёлой промышленности, поэтому чувствительна к ценам сырья и экспортному спросу.","Энергетика":"Управляет критической инфраструктурой и генерирующими активами. Денежный поток устойчив, но капитальные затраты велики.","Финансы":"Зарабатывает на кредитовании, комиссиях и управлении капиталом. Ключевые риски — стоимость денег и качество кредитного портфеля.","Машиностроение":"Поставляет оборудование для заводов и инфраструктуры. Рост инвестиций ускоряет заказы, а рецессия сокращает backlog.","Судоходство":"Зарабатывает на международных перевозках. Ставки фрахта, цены топлива и загрузка портов определяют маржу.","Страхование":"Монетизирует управление риском через премии и инвестиционный портфель. Результаты зависят от убытков и доходности резервов.","Порты":"Владеет терминалами и складской инфраструктурой. Торговый поток определяет загрузку активов и операционную маржу.","Нефть":"Вертикально связана с добычей и переработкой. Прибыль меняется вместе с ценами на энергоносители и экспортными квотами.","Логистика":"Организует движение грузов между ресурсными регионами, портами и промышленными центрами. Сильнее рынка реагирует на торговые объёмы.","Биотех":"Финансирует долгий цикл исследований и коммерциализации. Потенциал роста высок, но сроки создают волатильность.","Технологии":"Строит цифровую инфраструктуру для бизнеса. Рост клиентов поддерживает маржу, а конкуренция требует постоянных инвестиций.","Электроника":"Производит высокоточные компоненты. Цикл запасов и доступность компонентов критичны для прибыли.","Робототехника":"Автоматизирует производство и склады. Главный драйвер — инвестиционный цикл предприятий.","Агро":"Контролирует переработку и сбыт продовольствия. Урожай, погода и цены на удобрения формируют волатильность.","Ритейл":"Работает с большим оборотом и тонкой маржой. Спрос, инфляция и логистика напрямую отражаются в прибыли."};
  const p=companyEconomicProfile(company,country.id);
  const tierName=p.tier==="mega"?"Мега":p.tier==="large"?"Крупная":p.tier==="medium"?"Средняя":p.tier==="small"?"Малая":"Микро";
  return {founded:1974+(seed%39),employees:Math.max(20,Math.round(p.marketCap/120)).toLocaleString("ru-RU")+" сотрудников",headquarters:country.capital,revenue:(p.marketCap*(.30+p.margin*.45)/1_000_000).toFixed(2).replace(".",",")+" млн VLR",netProfit:(p.marketCap*p.margin/1_000_000).toFixed(2).replace(".",",")+" млн VLR",marketCap:(p.marketCap/1_000_000).toFixed(2).replace(".",",")+" млн VLR",companyLevel:tierName==="Мега"?5:tierName==="Крупная"?4:tierName==="Средняя"?3:tierName==="Малая"?2:1,pe:(1/Math.max(.035,p.margin)).toFixed(1)+"×",pb:(Math.max(.7,1+p.leverage*.9+(1-p.quality)*.7)).toFixed(1)+"×",dividendYield:(Math.max(.8,5.8-p.growth*35+(seed%18)/10)).toFixed(1).replace(".",",")+"%",materials:materialMap[company.sector]??"капитал, энергия и квалифицированный труд",strategy:"Рост выручки через расширение мощностей, цифровизацию операций и дисциплину капитала.",goals:"Увеличить выручку, удержать долговую нагрузку под контролем, открыть новые рынки и повысить эффективность активов.",description:company.name+" — публичный игрок "+country.name+" с капитализацией "+(p.marketCap/1_000_000).toFixed(2).replace(".",",")+" млн VLR. "+(sectorNarrative[company.sector]??"Компания работает внутри ключевых экономических цепочек страны и союза.")};
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
  const id=country.id;
  return <span className="flag-symbol" aria-label={`Флаг ${country.name}`}>
    <svg viewBox="0 0 96 64" role="img" aria-hidden="true">
      {id==="slavoriya"&&<><rect width="96" height="64" fill="#174f9d"/><rect y="21.33" width="96" height="21.33" fill="#f1f3ee"/><rect y="42.66" width="96" height="21.34" fill="#c84b4b"/></>}
      {id==="lirania"&&<><rect width="96" height="64" fill="#176b7a"/><rect x="32" width="32" height="64" fill="#f0eee4"/><rect x="40" width="16" height="64" fill="#d6ad55"/></>}
      {id==="darvast"&&<><rect width="96" height="64" fill="#173d31"/><rect x="32" width="32" height="64" fill="#e0c064"/><rect x="64" width="32" height="64" fill="#8d303b"/></> }
      {id==="estraviya"&&<><rect width="96" height="64" fill="#173d69"/><rect y="21.33" width="96" height="21.33" fill="#e9eee9"/><rect y="42.66" width="96" height="21.34" fill="#4aa6a4"/></>}
      {id==="saverniya"&&<><rect width="96" height="64" fill="#2f684d"/><rect y="21.33" width="96" height="21.33" fill="#e9d7a1"/><rect y="42.66" width="96" height="21.34" fill="#d47743"/></>}
    </svg>
  </span>;
}

function CEOAvatar({company}:{company:CompanyPreview}){
  const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);
  const female=["Елена","Надежда","Марина","Алина","Вера","Ирина","Ольга","София","Кира","Дарья","Анна","Лилия","Нина","Светлана"].includes(company.ceo.trim().split(/\s+/)[0]);
  const skin=["#b96f50","#c98767","#d89a76","#e2ad88"][seed%4];
  const hair=["#17191b","#30231f","#3f2b23","#60412d"][(seed>>2)%4];
  const suit=["#182735","#26364a","#203d43","#3a2c36"][(seed>>3)%4];
  const bg=["#10252f","#142530","#17232e","#122a2a"][(seed>>4)%4];
  const id=company.ticker.replace(/[^a-zA-Z0-9]/g,"")+seed;
  return <div className="ceo-avatar polished-portrait" aria-label={"Портрет CEO "+company.ceo}>
    <svg viewBox="0 0 120 140" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={"bg"+id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={bg}/><stop offset="1" stopColor="#071219"/></linearGradient>
        <linearGradient id={"skin"+id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={skin}/><stop offset="1" stopColor="#8b513e"/></linearGradient>
        <linearGradient id={"suit"+id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={suit}/><stop offset="1" stopColor="#0e1a24"/></linearGradient>
      </defs>
      <rect width="120" height="140" rx="14" fill={"url(#bg"+id+")"}/>
      <circle cx="93" cy="25" r="30" fill="#78d9d1" opacity=".07"/>
      <path d="M9 140 C14 105 30 91 60 91 C90 91 106 105 111 140Z" fill={"url(#suit"+id+")"}/>
      <path d="M40 102 L60 119 L80 102 L91 140 L29 140Z" fill={suit}/>
      <path d="M47 101 L60 119 L73 101 L68 97 L60 108 L52 97Z" fill="#e8eeec"/>
      <path d="M53 105 L60 118 L67 105 L64 102 L60 109 L56 102Z" fill={seed%3===0?"#c9a45e":"#6d9ea4"}/>
      <path d="M49 85 L49 104 Q60 111 71 104 L71 85Z" fill={"url(#skin"+id+")"}/>
      <ellipse cx="60" cy="58" rx="27" ry="34" fill={"url(#skin"+id+")"}/>
      <ellipse cx="32" cy="62" rx="4" ry="8" fill={skin}/><ellipse cx="88" cy="62" rx="4" ry="8" fill={skin}/>
      <path d={female?"M31 57 C26 27 40 12 60 12 C84 12 97 31 89 66 C85 43 78 27 60 27 C43 27 36 42 31 57Z":"M31 53 C28 28 42 13 61 13 C81 13 94 29 88 55 C80 40 71 32 59 32 C48 32 39 40 31 53Z"} fill={hair}/>
      {female&&<path d={"M34 49 C25 70 29 94 45 102 M86 49 C95 70 91 94 75 102"} fill="none" stroke={hair} strokeWidth="8" strokeLinecap="round"/>}
      <path d="M42 52 Q50 48 55 51" fill="none" stroke={hair} strokeWidth="3" strokeLinecap="round"/>
      <path d="M65 51 Q71 48 78 52" fill="none" stroke={hair} strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="49" cy="61" rx="3" ry="2.4" fill="#182027"/><ellipse cx="71" cy="61" rx="3" ry="2.4" fill="#182027"/>
      <circle cx="50" cy="60.5" r=".8" fill="#e8f5f5"/><circle cx="72" cy="60.5" r=".8" fill="#e8f5f5"/>
      <path d="M60 61 L57 74 L62 75" fill="none" stroke="#744b3e" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M52 81 Q60 85 68 81" fill="none" stroke="#6d4038" strokeWidth="2" strokeLinecap="round"/>
      {!female&&<path d="M43 78 Q60 91 77 78 L73 88 Q60 94 47 88Z" fill={hair} opacity=".82"/>}
      <path d="M43 102 L60 119 L77 102" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5"/>
      <path d="M28 139 L35 111 L47 104 L60 119 L73 104 L85 111 L92 139" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="2"/>
    </svg>
  </div>;
}function Terrain({ detailed = false }: { detailed?: boolean }) {
  return <g className="terrain-layer"><path className="terrain-lowland" d="M42 218 C92 190 134 201 174 223 C216 247 257 247 298 226 C345 202 394 207 454 225 L454 312 L42 312 Z"/><path className="terrain-shadow" d="M70 151 C104 118 140 120 169 145 C196 168 223 174 252 152 C283 128 317 130 347 151 C379 174 404 165 434 143 L444 185 C408 204 377 207 343 190 C310 173 282 176 251 197 C216 220 188 210 158 190 C126 168 101 170 73 188 Z"/><path className="ridge major" d="M73 104 C91 78 107 75 123 98 C138 73 154 72 171 99 C188 67 209 69 226 98 C243 78 257 80 271 104"/><path className="ridge major second" d="M274 111 C292 77 309 75 327 103 C343 70 360 73 376 105 C392 82 407 87 426 116"/><path className="ridge light" d="M88 117 C101 99 112 98 124 115 M138 116 C150 95 160 97 171 117 M292 122 C306 99 316 100 327 119 M344 121 C356 99 366 102 378 120"/><path className="contour" d="M55 132 C89 108 126 110 155 129 C187 151 214 159 245 142 C276 124 304 124 337 141 C370 158 401 153 439 130"/><path className="contour" d="M52 154 C89 131 123 135 151 153 C184 175 214 183 247 165 C279 146 307 148 338 164 C369 180 400 177 442 153"/><path className="contour" d="M57 178 C94 155 125 160 157 178 C189 197 218 205 250 186 C283 167 311 170 343 186 C374 202 402 199 435 179"/><path className="river" d="M221 74 C218 100 228 113 218 138 C207 163 199 183 207 203 C215 223 231 232 239 251 C245 267 241 282 231 296"/><path className="river" d="M302 79 C293 105 298 126 313 146 C327 164 341 175 348 194 C355 213 351 231 342 248"/><path className="river thin" d="M156 108 C173 127 178 143 170 164 C163 181 168 198 181 214"/><ellipse className="lake" cx="145" cy="226" rx="19" ry="8"/><ellipse className="lake" cx="376" cy="214" rx="14" ry="6"/><path className="snow" d="M178 73 L191 59 L205 73 L194 79 Z M317 75 L329 60 L343 75 L333 81 Z"/>{detailed&&<g className="terrain-detail"><path d="M91 244 C119 231 141 231 164 244 M182 257 C211 246 232 247 254 259 M282 241 C311 229 337 230 360 243 M366 261 C390 250 411 251 430 260"/><path d="M108 199 C126 190 143 191 158 201 M344 201 C362 190 379 191 394 201"/></g>}</g>;
}
function AtlasMap({ selected, onSelect, showCompanies = false, onCompany, holdings, home }: { selected: string; onSelect: (id: string) => void; showCompanies?: boolean; onCompany?: (company: CompanyPreview) => void; holdings?: Record<string,number>; home?: {housing:string;label:string} }) {
  return <Atlas3D countries={countries} selected={selected} onSelect={onSelect} showCompanies={showCompanies} onCompany={onCompany} holdings={holdings} home={home} />;
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
      <div className="brand large"><div className="brand-mark image"><img src="/marketarena-logo.svg" alt="MarketArena"/></div><div><b>MarketArena</b><small>СИМУЛЯТОР ЭКОНОМИЧЕСКОЙ ЖИЗНИ</small></div></div>
      <div className="auth-copy"><span className="eyebrow">НАЧАЛО ИГРЫ</span><h1>Построй капитал<br/><em>с нуля.</em></h1><p>Работа, расходы, накопления, компании и рынок — одна игровая система, в которой твои решения постепенно меняют финансовую историю.</p></div>
      <div className="auth-tabs"><button className={register?"active":""} onClick={()=>setRegister(true)}>Регистрация</button><button className={!register?"active":""} onClick={()=>setRegister(false)}>Войти</button></div>
      <label className="field"><span>Имя игрока</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Например, Алексей"/></label>
      <button className="primary" disabled={!name.trim()} onClick={()=>onContinue(name.trim())}>{register?"Создать профиль":"Продолжить"} <b>→</b></button>
      <div className="auth-note">Профиль офлайн-режима хранится локально. Online будет добавлен отдельным этапом.</div>
    </div>
    <div className="auth-visual" aria-hidden="true">
      <div className="auth-orbit orbit-a"/><div className="auth-orbit orbit-b"/>
      <div className="auth-visual-grid"/>
      <div className="auth-visual-core"><img src="/marketarena-logo.svg" alt="MarketArena"/><b>ТВОЯ ЭКОНОМИЧЕСКАЯ<br/>ИСТОРИЯ</b><small>РЕШЕНИЯ · КАПИТАЛ · РЫНОК</small></div>
      <div className="auth-float auth-float-a"><span>КАПИТАЛ</span><b>СТАРТ С НУЛЯ</b><small>ЗАРАБАТЫВАЙ И КОПИ</small></div>
      <div className="auth-float auth-float-b"><span>РЫНОК</span><b>60 КОМПАНИЙ</b><small>ПОКУПАЙ · ПРОДАВАЙ · АНАЛИЗИРУЙ</small></div>
      <div className="auth-float auth-float-c"><span>МИР</span><b>5 СТРАН</b><small>ВЫБЕРИ СВОЮ ЭКОНОМИКУ</small></div>
    </div>
  </div>;
}

function ModeScreen({ onChoose }:{onChoose:(mode:"offline"|"online")=>void}) {
  return <div className="setup-screen"><div className="setup-inner"><div className="step">02 / 04</div><span className="eyebrow">РЕЖИМ ИГРЫ</span><h1>Выбери формат своей истории.</h1><p className="setup-lead">Личная экономика — твои деньги, работа, расходы и инвестиционные решения. Общий рынок — живой слой компаний и новостей, который связывает личный капитал с экономикой страны. Сейчас доступна офлайн-история с симуляцией рынка; сетевой режим подключим отдельным этапом.</p><div className="mode-cards">
    <button className="mode-card selected" onClick={()=>onChoose("offline")}><span className="mode-icon">◒</span><b>ОФЛАЙН</b><strong>Личная экономика</strong><p>Работаешь, создаёшь денежный поток, копишь резерв, покупаешь компании и сам управляешь темпом дней. Каждое решение влияет на твой капитал и доступные возможности.</p><i>ДОСТУПНО СЕЙЧАС →</i></button>
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
    <div className="first-week-brief">
      <div><span>ПЕРВЫЕ 7 ДНЕЙ</span><b>Сначала стабилизируй жизнь</b><small>1. Найди источник дохода · 2. Определи жильё и расходы · 3. Создай резерв · 4. Сделай первую рыночную позицию.</small></div>
      <div><span>ТВОЙ СТАРТ</span><b>{country.name}</b><small>{country.capital} · {country.exchange} · экономика страны будет влиять на рынок каждый день.</small></div>
    </div>
    <div className="start-summary"><span>СТАРТ</span><b>{country.name}</b><i>·</i><b>{d.name}</b><i>·</i><b>{d.money}</b><button className="primary small" onClick={()=>onStart(selected)}>Начать игру<span className="button-arrow">→</span></button></div>
    <button className="text-back" onClick={onBack}>← Вернуться к выбору страны</button>
  </div></div>;
}

function NavIcon({id}:{id:GameTab}) {
  const common={viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round" as const,strokeLinejoin:"round" as const,ariaHidden:true};
  if(id==="overview") return <svg {...common}><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-5h5v5"/></svg>;
  if(id==="exchange") return <svg {...common}><path d="M4 17 9 12l3 3 7-8"/><path d="M15 7h4v4"/><path d="M4 20h16"/></svg>;
  if(id==="portfolio") return <svg {...common}><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M8 5V3h8v2M3 10h18"/><path d="M10 14h4"/></svg>;
  if(id==="companies") return <svg {...common}><path d="M4 21V6l8-3 8 3v15"/><path d="M8 9h2M14 9h2M8 13h2M14 13h2M8 17h2M14 17h2"/></svg>;
  if(id==="life") return <svg {...common}><circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M4 13h4M16 13h4"/></svg>;
  if(id==="map") return <svg {...common}><path d="M4 6l6-3 8 3 2-1v15l-6 3-8-3-2 1V6Z"/><path d="M10 3v17M18 6v17"/></svg>;
  if(id==="news") return <svg {...common}><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>;
  if(id==="events") return <svg {...common}><path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z"/></svg>;
  if(id==="history") return <svg {...common}><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2M4 5 2 7"/></svg>;
  if(id==="profile") return <svg {...common}><circle cx="12" cy="8" r="3"/><path d="M5 21a7 7 0 0 1 14 0M18 5l2 2-2 2"/></svg>;
  return <svg {...common}><path d="M4 5h16M4 12h16M4 19h16"/><path d="M8 3v4M16 10v4M10 17v4"/></svg>;
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
const chartRangeLabels:[ChartRange,string][]=[["1D","1 день"],["1W","1 неделя"],["1M","1 месяц"],["6M","6 месяцев"],["1Y","1 год"],["5Y","5 лет"],["10Y","10 лет"],["ALL","Весь период"]];
type CandlePoint={period:number;open:number;high:number;low:number;close:number};
function CandleChart({company,candles,range}:{company:CompanyPreview;candles:CandlePoint[];range:ChartRange}) {
  const safe=candles.length?candles:[{period:0,open:priceForFallback(company),high:priceForFallback(company),low:priceForFallback(company),close:priceForFallback(company)}];
  const min=Math.min(...safe.map(c=>c.low)),max=Math.max(...safe.map(c=>c.high)),span=Math.max(1,max-min);
  const width=560,height=300,padX=18,padTop=16,padBottom=28,plotH=height-padTop-padBottom;
  const stepX=(width-padX*2)/Math.max(1,safe.length);
  const bodyW=Math.max(3,Math.min(11,stepX*.62));
  const y=(v:number)=>padTop+(max-v)/span*plotH;
  const first=safe[0].open,last=safe[safe.length-1].close,change=first?((last-first)/first)*100:0;
  const lastC=safe[safe.length-1];
  const formatPeriod=(p:number)=>range==="1D"?`${Math.max(1,Math.round(p)+1)} · 5 мин`:range==="1W"?`${Math.max(1,Math.round(p)+1)} · 3 ч`:range==="1M"?`${Math.max(1,Math.round(p)+1)} · день`:`${Math.max(1,Math.round(p)+1)}`;
  return <div className="candle-terminal">
    <div className="candle-head"><div><span>ЯПОНСКИЕ СВЕЧИ · ИНТЕРВАЛ {range}</span><b>{last.toLocaleString("ru-RU")} VLR</b></div><strong className={change>=0?"gain":"loss"}>{change>=0?"+":""}{change.toFixed(2)}%</strong></div>
    <div className="candle-ohlc"><span>O <b>{lastC.open.toLocaleString("ru-RU")}</b></span><span>H <b>{lastC.high.toLocaleString("ru-RU")}</b></span><span>L <b>{lastC.low.toLocaleString("ru-RU")}</b></span><span>C <b>{lastC.close.toLocaleString("ru-RU")}</b></span><em>{formatPeriod(lastC.period)}</em></div>
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label={`Японские свечи ${company.ticker}, интервал ${range}`}>
      <path d={`M${padX} ${y(min)}H${width-padX} M${padX} ${y((min+max)/2)}H${width-padX} M${padX} ${y(max)}H${width-padX}`} className="grid-line"/>
      {safe.map((c,i)=>{
        const x=padX+stepX*(i+.5),up=c.close>=c.open,top=y(Math.max(c.open,c.close)),bottom=y(Math.min(c.open,c.close)),body=Math.max(2,bottom-top);
        return <g className={up?"candle up":"candle down"} key={i}>
          <line x1={x} x2={x} y1={y(c.high)} y2={y(c.low)} />
          <rect x={x-bodyW/2} y={top} width={bodyW} height={body} />
        </g>;
      })}
    </svg>
    <div className="candle-axis"><span>{formatPeriod(safe[0].period)}</span><span>{formatPeriod(safe[Math.floor(safe.length/2)].period)}</span><span>{formatPeriod(safe[safe.length-1].period)}</span></div>
  </div>;
}
function priceForFallback(company:CompanyPreview){const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);return 6500+(seed%18)*850;}

function Panel({title,eyebrow,children}:{title:string;eyebrow:string;children:ReactNode}){return <div className="game-panel"><div className="panel-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>{children}</div>;}
function PortfolioChart({points}:{points:number[]}){const max=Math.max(...points),min=Math.min(...points),span=Math.max(1,max-min);const path=points.map((v,i)=>{const x=(i/(points.length-1))*100;const y=92-((v-min)/span)*78;return (i?"L":"M")+x.toFixed(2)+" "+y.toFixed(2)}).join(" ");const delta=points.length>1?((points[points.length-1]-points[0])/Math.max(1,points[0]))*100:0;return <div className="portfolio-chart"><div className="portfolio-chart-head"><div><span>ДИНАМИКА КАПИТАЛА</span><b>30 игровых дней</b></div><strong className={delta>=0?"gain":"loss"}>{delta>=0?"+":""}{delta.toFixed(2)}%</strong></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="График стоимости портфеля"><defs><linearGradient id="portfolioFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#43e6ff" stopOpacity=".28"/><stop offset="1" stopColor="#43e6ff" stopOpacity="0"/></linearGradient></defs><path d={path+" L100 100 L0 100 Z"} fill="url(#portfolioFill)"/><path d={path} fill="none" stroke="#62d6a4" strokeWidth="1.8" vectorEffect="non-scaling-stroke"/></svg><div className="portfolio-chart-axis"><span>30 дней назад</span><span>15 дней</span><span>сегодня</span></div></div>}


function ExchangeScreen({country,day,cash,holdings,exchangeCompany,setExchangeCompany,priceFor,priceChange,buy,sell,timePaused,setTimePaused,timeSpeed,setTimeSpeed}:{country:Country;day:number;cash:number;holdings:Record<string,number>;exchangeCompany:CompanyPreview|null;setExchangeCompany:(c:CompanyPreview)=>void;priceFor:(c:CompanyPreview,d?:number)=>number;priceChange:(c:CompanyPreview)=>number;buy:(c:CompanyPreview,quantity?:number)=>void;sell:(c:CompanyPreview,quantity?:number)=>void;timePaused:boolean;setTimePaused:(v:boolean)=>void;timeSpeed:1|1.5|2;setTimeSpeed:(v:1|1.5|2)=>void}) {
  const company=exchangeCompany??country.companies[0]??null;
  return <div className="exchange-safe">
    <div className="exchange-safe-top"><div><span className="eyebrow">РЫНОЧНАЯ ИГРА</span><h2>Биржа · {country.name}</h2><p>Игровой день {day} · Q{Math.floor((day-1)/90)+1}</p></div><div className="exchange-safe-clock"><b>ДЕНЬ {day}</b><span>{Math.floor((day-1)/30)+1} месяц · {timePaused?"пауза":"рынок активен"}</span><div><button type="button" onClick={()=>setTimePaused(!timePaused)}>{timePaused?"▶":"Ⅱ"}</button>{[1,1.5,2].map(x=><button type="button" key={x} className={timeSpeed===x?"active":""} onClick={()=>setTimeSpeed(x as 1|1.5|2)}>×{x}</button>)}</div></div></div>
    <div className="exchange-safe-marketline"><span>Компаний: <b>{country.companies.length}</b></span><span>Кэш: <b>{cash.toLocaleString("ru-RU")} VLR</b></span><span>Рынок: <b>{country.exchange}</b></span></div>
    <div className="exchange-safe-companies">{country.companies.map(c=><button type="button" key={c.ticker} className={company?.ticker===c.ticker?"selected":""} onClick={()=>setExchangeCompany(c)}><b>{c.ticker}</b><span>{c.name}</span><small>{c.sector}</small><strong>{priceFor(c).toLocaleString("ru-RU")} VLR</strong><em className={priceChange(c)>=0?"gain":"loss"}>{priceChange(c)>=0?"+":""}{priceChange(c).toFixed(2)}%</em></button>)}</div>
    {company&&<div className="exchange-safe-focus"><div className="exchange-safe-focushead"><div><span className="ticker">{company.ticker}</span><h2>{company.name}</h2><p>{company.sector} · CEO {company.ceo}</p></div><div><b>{priceFor(company).toLocaleString("ru-RU")} VLR</b><strong className={priceChange(company)>=0?"gain":"loss"}>{priceChange(company)>=0?"+":""}{priceChange(company).toFixed(2)}%</strong></div></div>
      <div className="exchange-safe-chart"><div className="chart-title"><span>КОТИРОВКА · ЖИВОЙ РЫНОК</span><b>{priceFor(company).toLocaleString("ru-RU")} VLR</b></div><div className="exchange-placeholder-chart"><div/><div/><div/><div/><div/></div></div>
      <div className="exchange-safe-metrics"><div><span>В ПОРТФЕЛЕ</span><b>{holdings[company.ticker]||0} акций</b></div><div><span>СЕКТОР</span><b>{company.sector}</b></div><div><span>ЦЕНА</span><b>{priceFor(company).toLocaleString("ru-RU")} VLR</b></div><div><span>ДЕНЬ</span><b>{day}</b></div></div>
      <div className="exchange-safe-report"><span>РЫНОЧНЫЙ СИГНАЛ</span><h3>{company.name}</h3><p>Котировка меняется вместе с игровым днём, новостями, сырьевыми факторами и экономикой страны.</p></div>
      <div className="exchange-safe-actions"><span>Позиция: <b>{holdings[company.ticker]||0} акций</b></span><div><button type="button" disabled={!(holdings[company.ticker]>0)} onClick={()=>sell(company)}>Продать</button><button type="button" className="primary small" onClick={()=>buy(company,1000)}>Купить 1 000 акций</button></div></div>
    </div>}
  </div>;
}

function GameScreen({player,country,difficulty,onRestart,onLogout}:{player:string;country:Country;difficulty:string;onRestart:()=>void;onLogout:()=>void}) {
  const saveKey=`marketarena.save.v5.${player.toLowerCase().trim().replace(/\\s+/g,"-")}`;
  const initialSave=useMemo<GameSave|null>(()=>{try{const raw=window.localStorage.getItem(saveKey);return raw?JSON.parse(raw) as GameSave:null;}catch{return null;}},[saveKey]);
  const [tab,setTab]=useState<GameTab>(()=>initialSave?.tab??"overview");
  const [cash,setCash]=useState(()=>initialSave?.cash??(difficulty==="easy"?500000:difficulty==="hard"?25000:100000));
  const [holdings,setHoldings]=useState<Record<string,number>>(()=>initialSave?.holdings??{});
  const [day,setDay]=useState(()=>initialSave?.day??1);
  const [notice,setNotice]=useState("Сегодня доступны работа, рынок и первые инвестиции.");
  const [selectedCompany,setSelectedCompany]=useState<CompanyPreview|null>(null);
  const [exchangeCompany,setExchangeCompany]=useState<CompanyPreview|null>(null);
  
  const [selectedNews,setSelectedNews]=useState<string|null>(null);
  const [newsFilter,setNewsFilter]=useState<"all"|"macro"|"company"|"commodity"|"sector"|"market">("all");
  const [completedMissions,setCompletedMissions]=useState<string[]>(initialSave?.campaignMissions??[]);
  const [earnedIncome,setEarnedIncome]=useState(()=>initialSave?.earnedIncome??0);
  const [economyVisited,setEconomyVisited]=useState(()=>initialSave?.economyVisited??false);
  const [miniGamesCompleted,setMiniGamesCompleted]=useState(()=>initialSave?.miniGamesCompleted??0);
  const [crisisSurvived,setCrisisSurvived]=useState(()=>initialSave?.crisisSurvived??false);
  const initialCapital=(initialSave?.startingCapital??(difficulty==="easy"?500000:difficulty==="hard"?25000:100000));
  const [jobCooldown,setJobCooldown]=useState<string|null>(null);
  const [jobGame,setJobGame]=useState<{jobId:string}|null>(null);
  const [miniGame,setMiniGame]=useState<{active:boolean;score:number;target:number;started:number}>({active:false,score:0,target:1,started:0});
  const [transactions,setTransactions]=useState<Transaction[]>(()=>initialSave?.transactions??[]);
  const [careerXP,setCareerXP]=useState(()=>initialSave?.careerXP??0);
  const [jobXP,setJobXP]=useState<Partial<Record<JobId,number>>>(()=>initialSave?.jobXP??{});
  const [achievements,setAchievements]=useState<string[]>(()=>initialSave?.achievements??[]);
  const [loan,setLoan]=useState<GameSave["loan"]>(()=>initialSave?.loan??null);
  const [ownedCompanies,setOwnedCompanies]=useState<string[]>(()=>initialSave?.ownedCompanies??[]);
  const [lastJobDay,setLastJobDay]=useState(()=>initialSave?.lastJobDay??0);
  const [miniGameRewardDay,setMiniGameRewardDay]=useState(()=>initialSave?.miniGameRewardDay??0);
  const [workActions,setWorkActions]=useState(()=>initialSave?.workActionsDay===day?initialSave?.workActions??0:0);
  const [housing,setHousing]=useState<keyof typeof GAME_CONFIG.housing>(()=>initialSave?.housing??(difficulty==="easy"?"apartment":difficulty==="hard"?"dormitory":"studio"));
  const [food,setFood]=useState<keyof typeof GAME_CONFIG.food>(()=>initialSave?.food??(difficulty==="easy"?"premium":difficulty==="hard"?"basic":"balanced"));
  const [transport,setTransport]=useState<keyof typeof GAME_CONFIG.transport>(()=>initialSave?.transport??(difficulty==="easy"?"car":"public"));
  const [appearance,setAppearance]=useState<keyof typeof GAME_CONFIG.appearance>(()=>initialSave?.appearance??(difficulty==="easy"?"professional":difficulty==="hard"?"basic":"neat"));
  const [energy,setEnergy]=useState(()=>initialSave?.energy??GAME_CONFIG.food[food].energy);
  const [chartRange,setChartRange]=useState<ChartRange>("1Y");
  const [marketPulse,setMarketPulse]=useState(0);
  const [timeSpeed,setTimeSpeed]=useState<1|1.5|2>(1);
  const [timePaused,setTimePaused]=useState(false);
  const [campaignFinished,setCampaignFinished]=useState(()=>((initialSave?.day??1)>=120));
  useEffect(()=>{if(tab!=="exchange"){setSelectedCompany(null);setExchangeCompany(null)}},[tab]);
  useEffect(()=>{if(tab==="economy")setEconomyVisited(true)},[tab]);
  useEffect(()=>{if(timePaused||campaignFinished)return; const timer=window.setInterval(()=>setMarketPulse(Date.now()),1500);return()=>window.clearInterval(timer)},[timePaused,campaignFinished]);
  useEffect(()=>{if(timePaused||campaignFinished)return; const ms=Math.round(300000/timeSpeed); const timer=window.setInterval(()=>setDay(v=>Math.min(120,v+1)),ms);return()=>window.clearInterval(timer)},[timeSpeed,timePaused,campaignFinished]);
  useEffect(()=>{if(day<=1)return; setWorkActions(0); const comfortRecovery=8+(GAME_CONFIG.housing[housing].comfort*0.10); const nextEnergy=Math.min(100,energy+GAME_CONFIG.food[food].energy*0.48+comfortRecovery); setCash(v=>Math.max(0,v-lifestyleCost)); setEnergy(nextEnergy); setNotice(`День ${day}: жизнь −${lifestyleCost.toLocaleString("ru-RU")} VLR · энергия ${Math.round(nextEnergy)}/100.`);},[day]);
  useEffect(()=>{if(day>=120){setDay(120);setCampaignFinished(true);setTimePaused(true);setNotice("Кампания завершена. Рынок остановлен: теперь можно оценить результат.");}},[day]);
  useEffect(()=>{const payload:GameSave={player,countryId:country.id,difficulty,cash,holdings,day,transactions,tab,savedAt:new Date().toISOString(),careerXP,achievements,campaignMissions:completedMissions,earnedIncome,economyVisited,miniGamesCompleted,crisisSurvived,startingCapital:initialCapital,loan,ownedCompanies,jobXP,lastJobDay,miniGameRewardDay,workActionsDay:day,workActions,housing,food,transport,appearance,energy};try{window.localStorage.setItem(saveKey,JSON.stringify(payload));}catch{}},[saveKey,player,country.id,difficulty,cash,holdings,day,transactions,tab,careerXP,achievements,completedMissions,earnedIncome,economyVisited,miniGamesCompleted,crisisSurvived,initialCapital,loan,ownedCompanies,lastJobDay,miniGameRewardDay,workActions,housing,food,transport,appearance,energy,jobXP]);
  const countryMarketProfile:Record<string,{bias:number;sectors:Record<string,number>;strength:string;risk:string}>={
    slavoriya:{bias:.006,sectors:{"Металлы":.018,"Энергетика":.012,"Машиностроение":.014,"Финансы":.009},strength:"сильный внутренний спрос и промышленная база",risk:"циклический спрос на металлы и стоимость кредита"},
    lirania:{bias:.004,sectors:{"Судоходство":.020,"Порты":.018,"Страхование":.013,"Финансы":.010},strength:"торговые маршруты и портовая инфраструктура",risk:"зависимость от мирового товарооборота и фрахта"},
    darvast:{bias:-.002,sectors:{"Нефть":.028,"Металлы":.020,"Логистика":.010},strength:"огромная ресурсная база и дешёвая энергия",risk:"волатильность сырьевых цен и экспортных доходов"},
    estraviya:{bias:.009,sectors:{"Биотех":.026,"Технологии":.024,"Электроника":.020,"Робототехника":.022},strength:"инновации, университеты и высокий человеческий капитал",risk:"длинный цикл исследований и дорогие компоненты"},
    saverniya:{bias:.005,sectors:{"Агро":.024,"Ритейл":.018,"Логистика":.012},strength:"плодородные земли и большой потребительский рынок",risk:"погода, урожайность и инфляция спроса"}
  };
  const marketProfile=countryMarketProfile[country.id]??countryMarketProfile.slavoriya;

  const commodityPulse=(sector:string,atDay:number)=>commoditySignal(sector,atDay);
  const marketEvent=(company:CompanyPreview, atDay:number)=>{
    return companyMarketSignal(company,atDay,marketProfile.bias,marketProfile.sectors[company.sector]??0,country.id);
  };
  const macroCrisis=(atDay:number)=>{
    const event=macroEventForDay(atDay);
    return event ? {...event,remaining:Math.max(0,event.end-atDay)} : null;
  };
  const quarterlyReport=(company:CompanyPreview,atDay:number)=>{
    return quarterlyFinancials(company,atDay,marketProfile.bias,marketProfile.sectors[company.sector]??0,country.id);
  };
  const priceFor=(company:CompanyPreview, atDay=day)=>{
    return marketPriceAtDay(company,atDay,country.id,marketProfile.bias,marketProfile.sectors[company.sector]??0);
  };
  const priceChange=(company:CompanyPreview)=>{
    const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);
    const oldDay=day>1?day-1:0.5;
    const old=day>1?priceFor(company,oldDay):priceFor(company,1)*(1-(Math.sin(seed*1.91)*0.006+Math.cos(seed*0.73)*0.003));
    return ((priceFor(company,day)-old)/old)*100;
  };

  const marketSnapshot=useMemo(()=>{
    const rows=country.companies.map(c=>({company:c,price:priceFor(c),change:priceChange(c),news:marketEvent(c,day)}));
    const breadth=rows.length?rows.filter(x=>x.change>0).length/rows.length:.5;
    const index=rows.length?rows.reduce((sum,x)=>sum+x.price/Math.max(.01,priceFor(x.company,1)),0)/rows.length*100:100;
    const sentiment=rows.length?rows.reduce((sum,x)=>sum+x.news.impact,0)/rows.length:0;
    return {rows,breadth,index,sentiment};
  },[country.companies,day,marketPulse]);  const history=(company:CompanyPreview, range:ChartRange=chartRange)=>{const lengths:Record<ChartRange,number>={ALL:20,"10Y":10,"5Y":20,"1Y":12,"6M":6,"1M":30,"1W":8,"1D":1};const steps:Record<ChartRange,number>={ALL:365,"10Y":365,"5Y":90,"1Y":30,"6M":30,"1M":1,"1W":7,"1D":1};const count=lengths[range],step=steps[range];return Array.from({length:count},(_,i)=>{const end=day-(count-1-i)*step;const start=end-step+1;return priceFor(company,start)+(priceFor(company,end)-priceFor(company,start));});};
  const candleSeries=(company:CompanyPreview,range:ChartRange=chartRange):CandlePoint[]=>{
    // One candle = one real interval of the selected range.
    const configs:Record<ChartRange,{count:number;step:number;vol:number;label:string}>={
      "1D":{count:78,step:1/288,vol:0.0032,label:"5 мин"},
      "1W":{count:56,step:0.125,vol:0.0060,label:"3 ч"},
      "1M":{count:30,step:1,vol:0.0105,label:"1 день"},
      "6M":{count:60,step:3,vol:0.0130,label:"3 дня"},
      "1Y":{count:73,step:5,vol:0.0155,label:"5 дней"},
      "5Y":{count:60,step:30,vol:0.0200,label:"1 месяц"},
      "10Y":{count:60,step:60,vol:0.0240,label:"2 месяца"},
      "ALL":{count:80,step:91,vol:0.0290,label:"3 месяца"}
    };
    const cfg=configs[range];
    const seed=company.ticker.split("").reduce((n,ch,i)=>n+ch.charCodeAt(0)*(i+11),17);
    const rand=(n:number)=>{const x=Math.sin(seed*12.9898+n*78.233)*43758.5453;return x-Math.floor(x);};
    const signed=(n:number)=>((rand(n)-.5)*2+(rand(n+0.73)-.5)*.8)/1.4;
    const anchor=priceFor(company,day);
    const raw:number[]=[];
    let level=1;
    for(let i=0;i<cfg.count;i++){
      const candleDay=Math.max(1,day-(cfg.count-1-i)*cfg.step);
      const event=marketEvent(company,candleDay).impact;
      const cycle=Math.sin((candleDay+seed)*0.047)*cfg.vol*0.12;
      const gap=signed(i*11+1)*cfg.vol*0.20;
      const jump=i>0 && i%17===0 ? signed(i*13+5)*cfg.vol*0.65 : 0;
      const ret=cycle+event*0.035+signed(i*17+3)*cfg.vol*0.72+jump;
      const open=level*Math.exp(gap);
      const close=open*Math.exp(ret);
      level=close;
      raw.push(level);
    }
    const scale=anchor/Math.max(0.0001,raw[raw.length-1]);
    return raw.map((base,i)=>{
      const close=Math.max(0.1,base*scale);
      const prevClose=i===0 ? close*(1-signed(900)*cfg.vol*0.35) : raw[i-1]*scale;
      const open=Math.max(0.1,prevClose*Math.exp(signed(i*23+7)*cfg.vol*0.22));
      const body=Math.abs(close-open);
      const bodyFactor=0.35+rand(i*29+2)*0.95;
      const wickUp=Math.max(close,open)*(cfg.vol*(0.10+rand(i*31+4)*0.42))+body*bodyFactor*0.30;
      const wickDown=Math.max(close,open)*(cfg.vol*(0.10+rand(i*37+5)*0.42))+body*(0.18+rand(i*41+6)*0.48);
      const high=Math.max(open,close)+wickUp;
      const low=Math.max(.1,Math.min(open,close)-wickDown);
      return {period:i,open:Math.round(open*100)/100,high:Math.round(high*100)/100,low:Math.round(low*100)/100,close:Math.round(close*100)/100};
    });
  };
  const portfolioValue=useMemo(()=>country.companies.reduce((sum,c)=>sum+(holdings[c.ticker]||0)*priceFor(c),0),[country.companies,holdings,day,marketPulse]);
  const totalWealth=cash+portfolioValue;
  const lifestyleCost=dailyLifestyleCost(housing,food,transport,appearance);
  const lifestyleReputation=GAME_CONFIG.housing[housing].reputation+GAME_CONFIG.food[food].reputation+GAME_CONFIG.transport[transport].reputation+GAME_CONFIG.appearance[appearance].reputation;
  const negotiation=GAME_CONFIG.housing[housing].negotiation+GAME_CONFIG.appearance[appearance].negotiation;
  const careerLevel=Math.min(10,1+Math.floor(careerXP/3));
  const careerTitle=careerLevel>=10?"Руководитель направления":careerLevel>=8?"Старший специалист":careerLevel>=6?"Профессионал":careerLevel>=4?"Опытный сотрудник":"Начинающий специалист";
  const careerMultiplier=1+(careerLevel-1)*0.12;
  const mobilityFactor=Math.max(0.72,1-GAME_CONFIG.transport[transport].mobility/500);
  const jobEnergyCost=(jobId:string)=>{
    const id=jobId as JobId;
    const base=jobId==="courier"?18:jobId==="analyst"?12:jobId==="junioranalyst"?15:jobId==="cashier"?13:16;
    return Math.max(8,Math.round(base*mobilityFactor*(jobLevel(id,jobXP[id]??0)>=3?.90:jobLevel(id,jobXP[id]??0)>=2?.95:1)));
  };
  const jobPay=(job:{pay:number;sector?:string},id?:JobId)=>{
    const jid=id??"janitor";
    return Math.round(job.pay*wageIndexAtDay(day,country.id,job.sector)*careerMultiplier*(1+Math.max(0,negotiation)*0.012)*jobBonusMultiplier(jid,jobXP[jid]??0));
  };
  const jobLevelLabel=(id:JobId)=>jobProgression[id].names[jobLevel(id,jobXP[id]??0)-1];
  const jobNextXP=(id:JobId)=>{const xp=jobXP[id]??0;const next=jobProgression[id].levels.find(v=>v>xp);return next??15;};
  const ownedPositions=Object.values(holdings).filter(v=>v>0).length;
  const countryInfluence=Math.min(100,ownedPositions*12+Math.min(40,Math.floor(careerXP/2))+Math.min(30,Math.floor(totalWealth/1000000)*5));
  const campaignGoals=[
    {id:"first-job",title:"1 · Создай денежный поток",text:"Заверши первую оплачиваемую работу и получи первые XP.",done:careerXP>0},
    {id:"secure-home",title:"2 · Закрепись в городе",text:"Выбери жильё, которое соответствует твоему капиталу и стратегии.",done:housing!=="studio"},
    {id:"first-investment",title:"3 · Открой рынок",text:"Купи первую акцию и сформируй первую рыночную позицию.",done:ownedPositions>0},
    {id:"ten-deals",title:"4 · Научись торговать",text:"Соверши 10 сделок и изучи хотя бы два сектора.",done:transactions.length>=10},
    {id:"career-three",title:"5 · Получи профессию",text:"Достигни 3 уровня карьеры и открой финансовую работу.",done:careerLevel>=3},
    {id:"first-loan",title:"6 · Освой капитал",text:"Возьми первый кредит и используй его осознанно.",done:achievements.includes("loan")},
    {id:"first-takeover",title:"7 · Получи влияние",text:"Сформируй контрольный пакет 51% первой публичной компании.",done:ownedCompanies.length>0},
    {id:"million",title:"8 · Первый миллион",text:"Достигни капитала 1 000 000 VLR.",done:totalWealth>=1000000},
    {id:"influence",title:"9 · Экономическая сила",text:"Достигни 25 пунктов влияния в своей стране.",done:countryInfluence>=25},
    {id:"year",title:"10 · Полный цикл",text:"Пройди 120 игровых дней и оцени итог кампании.",done:day>=120}
  ];
  const controlledValue=ownedCompanies.reduce((sum,ticker)=>{const c=country.companies.find(x=>x.ticker===ticker);return sum+(c?priceFor(c)*GAME_CONFIG.startingSharesPerCompany*.51:0)},0);
  const influenceTier=countryInfluence>=75?"Стратегический игрок":countryInfluence>=51?"Влиятельный инвестор":countryInfluence>=33?"Значимый акционер":countryInfluence>=10?"Устойчивый инвестор":"Новый игрок";
  const qualityOfLife=Math.max(0,Math.min(100,Math.round(
  GAME_CONFIG.housing[housing].comfort*.34+
  GAME_CONFIG.food[food].energy*.22+
  GAME_CONFIG.transport[transport].mobility*.16+
  (50+GAME_CONFIG.appearance[appearance].negotiation*2)*.10+
  Math.min(100,energy)*.18
)));
const qualityLabel=qualityOfLife>=85?"Отличное":qualityOfLife>=70?"Комфортное":qualityOfLife>=50?"Стабильное":qualityOfLife>=30?"Напряжённое":"Критическое";
const missionChecks=useMemo<Record<string,boolean>>(()=>({
  start: earnedIncome>=5000 && transactions.length>0,
  market: Object.entries(holdings).some(([ticker,qty])=>qty>0 && transactions.some(t=>t.type==="BUY"&&t.ticker===ticker&&t.day<day)),
  research: economyVisited,
  life: qualityOfLife>60,
  career: careerLevel>=3,
  portfolio: ownedPositions>=3,
  crisis: crisisSurvived,
  control: country.companies.some(c=>(holdings[c.ticker]||0)>=Math.ceil(GAME_CONFIG.startingSharesPerCompany*.10)),
  mini: miniGamesCompleted>=3,
  final: day>=120 && totalWealth>initialCapital
}),[earnedIncome,transactions,holdings,day,economyVisited,qualityOfLife,careerLevel,ownedPositions,crisisSurvived,country.companies,miniGamesCompleted,totalWealth,initialCapital]);
const missionState=useMemo(()=>CAMPAIGN_MISSIONS.map(m=>({ ...m,done:completedMissions.includes(m.id)||!!missionChecks[m.id]})),[completedMissions,missionChecks]);
const nextMission=missionState.find(m=>!m.done)??missionState[missionState.length-1];
const completedGoals=campaignGoals.filter(g=>g.done).length;
  const currentCrisis=macroCrisis(day);
  useEffect(()=>{
    if(currentCrisis && totalWealth>0 && !crisisSurvived)setCrisisSurvived(true);
  },[currentCrisis,totalWealth,crisisSurvived]);
  
  const nextGoal=campaignGoals.find(g=>!g.done)??campaignGoals[campaignGoals.length-1];
  const takeoverCost=(company:CompanyPreview)=>{const owned=holdings[company.ticker]||0;const target=Math.ceil(GAME_CONFIG.startingSharesPerCompany*GAME_CONFIG.ownershipThresholds.control);const missing=Math.max(0,target-owned);return Math.round(missing*priceFor(company)*(1+GAME_CONFIG.takeoverPremium)/100)*100;};
  const loanLimit=Math.max(0,Math.min(5000000,Math.round((totalWealth*0.65)/10000)*10000));
  const economyNow=economicSnapshot(day,country.id);
  const storyChapter = day <= 1
    ? {title:"Прибытие",text:"Ты начинаешь в своём районе. Первое решение — закрепиться, найти работу и понять стоимость жизни."}
    : day <= 4
      ? {title:"Первый денежный поток",text:"Работа превращает время и энергию в капитал. Твоя задача — перестать жить от расхода до расхода."}
      : day <= 7
        ? {title:"Финансовая подушка",text:"Собери резерв на несколько дней расходов. Рынок никуда не убежит — ликвидность важнее первой сделки."}
        : day <= 12
          ? {title:"Первый актив",text:"Теперь можно открыть карту предприятий, выбрать сектор и занять первую позицию."}
          : day <= 17
            ? {title:"Профессиональный рост",text:"Карьера снижает зависимость от случайных рыночных движений: хороший доход даёт больше свободы для инвестиций."}
            : day <= 24
              ? {title:"Первые доли влияния",text:"Небольшая доля — наблюдение. 10% — стратегический пакет. 25% — блокирующее влияние. 51% — контроль."}
              : day <= 30
                ? {title:"Проверка системы",text:"Экономика начинает отвечать цепными реакциями. Энергия, сырьё, логистика и спрос двигают компании вместе."}
                : {title:"Экономическая игра",text:"После первого месяца твоя задача — строить устойчивую группу, а не просто увеличивать число сделок."};
  const sectorLinks:Record<string,string[]> = {
    "Нефть":["Энергетика","Химия","Логистика","Ритейл"],
    "Энергетика":["Металлы","Машиностроение","Логистика","Ритейл"],
    "Металлы":["Машиностроение","Строительство","Логистика"],
    "Агро":["Ритейл","Логистика","Порты"],
    "Порты":["Судоходство","Логистика","Страхование"],
    "Судоходство":["Порты","Страхование","Ритейл"],
    "Технологии":["Электроника","Робототехника","Финансы"],
    "Электроника":["Робототехника","Машиностроение","Технологии"],
    "Финансы":["Недвижимость","Машиностроение","Ритейл"],
    "Логистика":["Ритейл","Порты","Машиностроение"],
    "Робототехника":["Машиностроение","Электроника","Технологии"],
    "Ритейл":["Агро","Логистика","Финансы"],
    "Недвижимость":["Финансы","Машиностроение","Энергетика"],
    "Химия":["Нефть","Агро","Электроника"]
  };
  const companyChain=(sector:string)=>sectorLinks[sector]??["Спрос","Капитал","Труд"];
  const portfolioHistory=useMemo(()=>Array.from({length:30},(_,i)=>cash+country.companies.reduce((sum,c)=>sum+(holdings[c.ticker]||0)*priceFor(c,Math.max(1,day-29+i)),0)),[cash,country.companies,holdings,day,marketPulse]);
  const takeLoan=(amount:number)=>{
    if(loan?.balance){setNotice("Сначала погаси текущий кредит.");return;}
    const normalized=Math.min(Math.max(100000,Math.round(amount/10000)*10000),loanLimit);
    if(normalized<100000){setNotice("Для кредита нужен капитал минимум 100 000 VLR.");return;}
    setCash(v=>v+normalized);
    setLoan({principal:normalized,balance:normalized,lastChargeDay:day,rate:.025});
    setAchievements(v=>v.includes("loan")?v:[...v,"loan"]);
    setNotice("Кредит получен: "+normalized.toLocaleString("ru-RU")+" VLR. Ставка 2,5% каждые 30 игровых дней.");
  };
  const repayLoan=(amount:number)=>{
    if(!loan?.balance)return;
    const pay=Math.min(loan.balance,Math.max(0,Math.round(amount/10000)*10000),cash);
    if(pay<=0){setNotice("Недостаточно свободных денег для погашения.");return;}
    setCash(v=>v-pay);
    const next=loan.balance-pay;
    setLoan(next<=1?null:{...loan,balance:next});
    setNotice(next<=1?"Кредит полностью погашен.":"Погашено "+pay.toLocaleString("ru-RU")+" VLR. Остаток: "+next.toLocaleString("ru-RU")+" VLR.");
  };
  const acquireCompany=(company:CompanyPreview)=>{
    const target=Math.ceil(GAME_CONFIG.startingSharesPerCompany*GAME_CONFIG.ownershipThresholds.control);
    const owned=holdings[company.ticker]||0;
    if(owned>=target){setOwnedCompanies(v=>v.includes(company.ticker)?v:[...v,company.ticker]);setNotice(company.name+" уже под твоим контролем.");return;}
    const cost=takeoverCost(company);
    if(cash<cost){setNotice("Для контроля 51% нужно "+cost.toLocaleString("ru-RU")+" VLR. Можно сначала накопить капитал или использовать кредит.");return;}
    setCash(v=>v-cost);
    setHoldings(v=>({...v,[company.ticker]:target}));
    setOwnedCompanies(v=>v.includes(company.ticker)?v:[...v,company.ticker]);
    setAchievements(v=>v.includes("takeover")?v:[...v,"takeover"]);
    setNotice("Контроль 51% получен: "+company.name+" теперь входит в твою группу, остальные 49% остаются у рынка.");
  };
  const buy=(company:CompanyPreview,quantity=1)=>{
    const price=priceFor(company),cost=price*quantity*(1+GAME_CONFIG.marketOrderFeeRate);
    if(cash<cost){setNotice("Недостаточно денег: нужно "+cost.toLocaleString("ru-RU")+" VLR с учётом комиссии.");return;}
    setCash(v=>v-cost);setHoldings(v=>({...v,[company.ticker]:(v[company.ticker]||0)+quantity}));
    setTransactions(v=>[{day,type:"BUY" as const,ticker:company.ticker,quantity,price},...v].slice(0,30));
    setNotice("Куплено "+quantity+" "+company.ticker+" по "+price.toLocaleString("ru-RU")+" VLR. Баланс списан: -"+cost.toLocaleString("ru-RU")+" VLR с учётом комиссии.");
  };
  const buyStake=(company:CompanyPreview,targetPct:number)=>{
    const target=Math.ceil(GAME_CONFIG.startingSharesPerCompany*(targetPct/100));
    const owned=holdings[company.ticker]||0;
    const quantity=Math.max(0,target-owned);
    if(quantity<=0){setNotice(company.name+" уже имеет пакет "+targetPct+"%.");return;}
    const price=priceFor(company);
    const cost=Math.round(quantity*price*(1+GAME_CONFIG.marketOrderFeeRate)*100)/100;
    if(cash<cost){setNotice("Для пакета "+targetPct+"% нужно "+cost.toLocaleString("ru-RU")+" VLR.");return;}
    setCash(v=>v-cost);
    setHoldings(v=>({...v,[company.ticker]:owned+quantity}));
    setTransactions(v=>[{day,type:"BUY" as const,ticker:company.ticker,quantity,price},...v].slice(0,30));
    if(targetPct>=51)setOwnedCompanies(v=>v.includes(company.ticker)?v:[...v,company.ticker]);
    setNotice("Пакет "+targetPct+"% сформирован в "+company.ticker+": +"+quantity.toLocaleString("ru-RU")+" акций.");
  };
  const sell=(company:CompanyPreview,quantity=1)=>{
    const owned=holdings[company.ticker]||0;
    if(owned<quantity){setNotice("У тебя нет "+quantity+" акций "+company.ticker+" для продажи.");return;}
    const price=priceFor(company),proceeds=price*quantity*(1-GAME_CONFIG.marketOrderFeeRate);const nextOwned=owned-quantity;setCash(v=>v+proceeds);setHoldings(v=>({...v,[company.ticker]:nextOwned}));
    if(nextOwned < Math.ceil(GAME_CONFIG.startingSharesPerCompany*GAME_CONFIG.ownershipThresholds.control)){setOwnedCompanies(v=>v.filter(t=>t!==company.ticker));}
    setTransactions(v=>[{day,type:"SELL" as const,ticker:company.ticker,quantity,price},...v].slice(0,30));
    setNotice("Продано "+quantity+" "+company.ticker+" по "+price.toLocaleString("ru-RU")+" VLR. После комиссии 0,25% зачислено: +"+proceeds.toLocaleString("ru-RU")+" VLR.");
  };
  const startJobGame=(id:string)=>{
    if(energy<jobEnergyCost(id)){setNotice("Недостаточно энергии для этой смены. Улучши питание, жильё или транспорт.");return;}
    if(workActions>=GAME_CONFIG.workActionsPerDay){setNotice("Дневной лимит рабочих действий исчерпан.");return;}
    if(campaignFinished){setNotice("Кампания завершена: новый год пока не начат.");return;}
    const offer=jobs.find(x=>x.id===id);
    if(!offer || careerLevel<offer.unlock){setNotice("Эта должность откроется на "+(offer?.unlock??0)+" уровне карьеры.");return;}
    setJobGame({jobId:id});
  };
  const finishJobGame=(performance:number)=>{
    if(!jobGame)return;
    const job=jobs.find(x=>x.id===jobGame.jobId);
    if(!job)return;
    const quality=Math.max(.65,Math.min(1.2,.65+performance*.55));
    const jobId=job.id as JobId;
    const reward=Math.round(jobPay(job,jobId)*quality);
    const gainedXP=Math.max(1,Math.round(1+performance*2));
    const previousJobLevel=jobLevel(jobId,jobXP[jobId]??0);
    const nextJobXP=Math.min(15,(jobXP[jobId]??0)+gainedXP);
    const nextJobLevel=jobLevel(jobId,nextJobXP);
    setEnergy(v=>Math.max(0,v-jobEnergyCost(job.id)));
    setWorkActions(v=>v+1);
    setCash(v=>v+reward);
    setEarnedIncome(v=>v+reward);
    setCareerXP(v=>Math.min(30,v+gainedXP));
    setJobXP(v=>({...v,[jobId]:nextJobXP}));
    setLastJobDay(day);
    setMiniGamesCompleted(v=>v+1);
    setJobCooldown(job.id);
    setNotice(job.title+" выполнена: +"+reward.toLocaleString("ru-RU")+" VLR · профессиональный XP +"+gainedXP+"."+(nextJobLevel>previousJobLevel?" Новый уровень профессии: "+jobProgression[jobId].names[nextJobLevel-1]+" — "+jobProgression[jobId].bonuses[nextJobLevel-1]+".":""));
    setJobGame(null);
    setTimeout(()=>setJobCooldown(null),700);
  };
  const advance=()=>{
    if(day>=120){setCampaignFinished(true);setTimePaused(true);setNotice("Год завершён. Открой профиль, чтобы оценить результат кампании.");return;}
    const nextDay=Math.min(120,day+1);
    setWorkActions(0); setDay(nextDay);
    setNotice(`День ${nextDay}: ${storyChapter.title}. ${storyChapter.text}`);
  };
  useEffect(()=>{
    if(day<=1)return;
    if(loan?.balance && day-loan.lastChargeDay>=30){
      const charged=Math.round(loan.balance*loan.rate);
      setLoan({...loan,balance:loan.balance+charged,lastChargeDay:day});
      setNotice("Начислены проценты по кредиту: +"+charged.toLocaleString("ru-RU")+" VLR.");
    }
    if(day%30===0 && ownedCompanies.length){
      const income=ownedCompanies.reduce((sum,ticker)=>{const company=country.companies.find(c=>c.ticker===ticker);return sum+(company?Math.round(takeoverCost(company)*.12):0);},0);
      if(income>0){setCash(v=>v+income);setNotice("Доход холдинга: +"+income.toLocaleString("ru-RU")+" VLR.");}
    }
  },[day]);
  useEffect(()=>{
    const newlyCompleted=CAMPAIGN_MISSIONS.filter(m=>missionChecks[m.id]&&!completedMissions.includes(m.id));
    if(!newlyCompleted.length)return;
    setCompletedMissions(v=>Array.from(new Set([...v,...newlyCompleted.map(m=>m.id)])));
    const reward=newlyCompleted.reduce((sum,m)=>sum+m.reward,0);
    if(reward>0){
      setCash(v=>v+reward);
      setNotice("Новая цель выполнена: "+newlyCompleted.map(m=>m.title).join(", ")+" · награда +"+reward.toLocaleString("ru-RU")+" VLR.");
    }
  },[missionChecks,completedMissions]);
  const startMiniGame=()=>setMiniGame({active:true,score:0,target:Math.floor(Math.random()*6),started:Date.now()});
  const hitMiniGame=(index:number)=>{if(!miniGame.active)return; if(index===miniGame.target){const reward=miniGameRewardDay===day?0:3500+Math.max(0,2500-Math.min(2500,Date.now()-miniGame.started));if(reward>0){setCash(v=>v+reward);setMiniGameRewardDay(day);setNotice("Точная реакция: +"+Math.round(reward).toLocaleString("ru-RU")+" VLR. Бонус мини-игры на сегодня получен.");}else setNotice("Точная реакция. Денежный бонус за сегодня уже получен.");setMiniGame({active:true,score:miniGame.score+1,target:Math.floor(Math.random()*6),started:Date.now()});}else{setNotice("Промах. Следующая цель появится после точного клика.");}};
  const tabs:[GameTab,string][]= [["overview","Обзор"],["exchange","Биржа"],["portfolio","Портфель"],["companies","Компании"],["life","Жизнь"],["map","Карта"],["news","Новости"],["events","Задания"],["economy","Экономика"],["history","История"],["updates","Обновления"],["profile","Профиль"]];
  const cashPct=Math.min(100,Math.max(8,cash/(totalWealth||1)*100));
  const openExchange=(company?:CompanyPreview)=>{
    setSelectedCompany(null);
    if(company) setExchangeCompany(company);
    setTab("exchange");
  };

  return <div className="game-shell">
    <header className="game-topbar"><button type="button" className="topbar-logout" onClick={onLogout}>Выйти</button><button className="game-profile-button" type="button" onClick={()=>setTab("profile")}><span>{player.trim().slice(0,1).toUpperCase()}</span><b>{player}</b></button><button className="game-brand" onClick={()=>setTab("overview")} aria-label="MarketArena"><img src="/marketarena-logo.svg" alt="MarketArena"/></button><div className="topbar-context"><span>ЭКОНОМИЧЕСКИЙ МИР</span><b>{country.name}</b></div><div className="game-right"><div className="topbar-time-controls" aria-label="Управление временем"><div className="topbar-time-status"><span>ИГРОВОЕ ВРЕМЯ</span><b>ДЕНЬ {day}</b><em>{timePaused?"ПАУЗА":"ИДЁТ"} · 5 мин/день · ×{timeSpeed}</em></div><button type="button" className={timePaused?"time-main paused":"time-main"} onClick={()=>setTimePaused(v=>!v)} aria-label={timePaused?"Продолжить время":"Поставить время на паузу"}>{timePaused?"▶":"Ⅱ"} <span>{timePaused?"Продолжить":"Пауза"}</span></button><div className="time-speed-group">{[1,1.5,2].map(x=><button type="button" key={x} className={timeSpeed===x?"active":""} onClick={()=>{setTimePaused(false);setTimeSpeed(x as 1|1.5|2)}} aria-label={"Скорость ×"+x}>×{x}</button>)}</div></div><b className="topbar-wealth">{totalWealth.toLocaleString("ru-RU")} VLR</b></div></header>
    <div className="game-body">
      <aside className="game-sidebar">
        <div className="sidebar-player">
          <div className="sidebar-avatar">{player.trim().slice(0,1).toUpperCase()}</div>
          <div><b>{player}</b><small>Ур. {careerLevel} · {careerTitle}</small></div>
        </div>
        <div className="sidebar-section"><span>УПРАВЛЕНИЕ</span>
          {tabs.slice(0,9).map(([id,label])=><button type="button" key={id} className={tab===id?"active":""} onClick={()=>id==="exchange"?openExchange():setTab(id)}><span className="nav-glyph"><NavIcon id={id}/></span>{label}</button>)}
        </div>
        <div className="sidebar-section"><span>АНАЛИТИКА</span>
          {tabs.slice(9).map(([id,label])=><button type="button" key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><span className="nav-glyph"><NavIcon id={id}/></span>{label}</button>)}
        </div>
        <div className="sidebar-next"><span>СЛЕДУЮЩИЙ ХОД</span><b>{campaignGoals.find(g=>!g.done)?.title??"Новая цель"}</b><small>{campaignGoals.find(g=>!g.done)?.text??"Продолжай развивать экономическую силу."}</small><button type="button" onClick={()=>{const g=campaignGoals.find(x=>!x.done);if(g?.id==="first-job")setTab("life");else if(g?.id==="first-investment")setTab("exchange");else if(g?.id==="first-takeover")setTab("companies");else setTab("profile")}}>Открыть цель →</button></div>
        <div className="sidebar-status"><span>СТАТУС РЫНКА</span><b className={currentCrisis?"loss":"gain"}>{currentCrisis?currentCrisis.name:"Рынок стабилен"}</b><small>Влияние {countryInfluence}/100 · Контроль {ownedCompanies.length}</small></div>
      </aside>
      <main className="game-main">
        {tab==="overview"&&<><div className="game-heading"><div><span className="eyebrow">ДЕНЬ {day} · {country.name.toUpperCase()}</span><h1>Экономическая карта {country.name}</h1><p>{notice}</p></div><button className="day-button" onClick={advance}>Следующий день →</button></div>{currentCrisis&&<div className="macro-event-banner compact"><div><span className="eyebrow">МИРОВАЯ НОВОСТЬ · ДЕНЬ {day}</span><h2>{currentCrisis.name}</h2><p>{currentCrisis.short}</p></div><strong className="loss">{currentCrisis.impact>=0?"+":""}{(currentCrisis.impact*100).toFixed(1)}%</strong><small>Событие влияет на разные отрасли по-разному. Открой «События», чтобы увидеть цепочку.</small></div>}
          <div className="economy-live-strip"><div><span>ВВП</span><b>{(economyNow.gdpGrowth*100).toFixed(1)}%</b></div><div><span>ИНФЛЯЦИЯ</span><b>{(economyNow.inflation*100).toFixed(1)}%</b></div><div><span>СТАВКА</span><b>{(economyNow.policyRate*100).toFixed(1)}%</b></div><div><span>ЗАРПЛАТЫ</span><b>{Math.round(economyNow.wageIndex*100)}%</b></div><div><span>СПРОС</span><b>{Math.round(economyNow.consumerDemand*100)}%</b></div></div><section className="daily-goals-board"><div className="daily-goals-head"><div><span>СЕГОДНЯ</span><h2>Три действия, которые двигают тебя вперёд</h2><p>Не обязательно делать всё. Выбери то, что лучше отвечает ситуации на рынке.</p></div><b>{[workActions>=Math.min(2,GAME_CONFIG.workActionsPerDay),energy>=60,transactions.some(t=>t.day===day)].filter(Boolean).length}/3</b></div><div className="daily-goals-grid">
<button className={workActions>=Math.min(2,GAME_CONFIG.workActionsPerDay)?"done":""} onClick={()=>setTab("life")}><span>РАБОТА</span><b>{workActions>=Math.min(2,GAME_CONFIG.workActionsPerDay)?"✓":"2 смены"}</b><small>{workActions>=Math.min(2,GAME_CONFIG.workActionsPerDay)?"Денежный поток создан":"Заработай деньги и XP профессии"}</small></button>
<button className={energy>=60?"done":""} onClick={()=>setTab("life")}><span>ЖИЗНЬ</span><b>{energy>=60?"✓":"Энергия ≥ 60"}</b><small>{energy>=60?"Ресурс в норме":"Улучши питание или восстановление"}</small></button>
<button className={transactions.some(t=>t.day===day)?"done":""} onClick={()=>{if(currentCrisis)setTab("events");else openExchange();}}><span>РЫНОК</span><b>{transactions.some(t=>t.day===day)?"✓":"Прими решение"}</b><small>{currentCrisis?"Оцени влияние кризиса перед сделкой":"Купи, продай или осознанно пропусти сделку"}</small></button>
</div></section><section className="command-map-layout">
            <section className="market-map-card command-map-main">
              <div className="card-head">
                <div><span>ЖИВОЙ ЭКОНОМИЧЕСКИЙ АТЛАС</span><h2>{country.name} · предприятия и влияние</h2><p className="map-subline">Нажми на предприятие: открой котировку, купи долю и оставь свой след на карте.</p></div>
                <div className="map-head-stats"><b>{country.companies.length}</b><span>компаний</span><b>{ownedPositions}</b><span>позиций</span><b>{ownedCompanies.length}</b><span>контроль</span></div>
              </div>
              <AtlasMap selected={country.id} onSelect={()=>{}} showCompanies onCompany={openExchange} holdings={holdings} home={{housing,label: (housing==="dormitory"?"Общежитие":housing==="shared"?"Общий дом":housing==="studio"?"Студия":housing==="apartment"?"Апартаменты":"Премиум-дом")+" · МОЙ ДОМ"}}/>
            </section>
            <aside className="command-map-rail">
              <div className="command-rail-card capital-focus"><span>ОБЩИЙ КАПИТАЛ</span><strong>{totalWealth.toLocaleString("ru-RU")} VLR</strong><small>Кэш {cash.toLocaleString("ru-RU")} · активы {portfolioValue.toLocaleString("ru-RU")}</small><div className="money-bar"><i style={{width:cashPct+"%"}}/></div></div>
              <div className="command-rail-card next-focus"><span>СЛЕДУЮЩИЙ ХОД</span><b>{nextGoal.title}</b><p>{nextGoal.text}</p><button onClick={()=>{const g=nextGoal;if(g.id==="first-job")setTab("life");else if(g.id==="first-investment")openExchange();else if(g.id==="first-takeover")setTab("companies");else setTab("profile")}}>Открыть действие →</button></div>
              <div className="command-rail-card influence-focus"><span>ВЛИЯНИЕ В СТРАНЕ</span><strong>{countryInfluence}/100</strong><small>{influenceTier}</small><div className="influence-meter"><i style={{width:countryInfluence+"%"}}/></div><small>Контроль: {ownedCompanies.length} · долей: {ownedPositions}</small></div>
              <div className="command-rail-card market-focus"><span>РЫНОК</span><b className={currentCrisis?"loss":"gain"}>{currentCrisis?currentCrisis.name:"Рынок стабилен"}</b><small>{currentCrisis?currentCrisis.short:"Следи за цепочками отраслей и новостями."}</small><button onClick={()=>setTab("events")}>События →</button></div>
            </aside>
          </section>
          <section className="command-strip">
            <button onClick={()=>setTab("life")}><span>КАРЬЕРА</span><b>Ур. {careerLevel}</b><small>{careerTitle} · {workActions}/{GAME_CONFIG.workActionsPerDay} смен</small></button>
            <button onClick={()=>setTab("portfolio")}><span>ПОРТФЕЛЬ</span><b>{portfolioValue.toLocaleString("ru-RU")} VLR</b><small>{ownedPositions} открытых позиций</small></button>
            <button onClick={()=>setTab("life")}><span>ОБРАЗ ЖИЗНИ</span><b>{lifestyleNames.housing[housing]}</b><small>{lifestyleCost.toLocaleString("ru-RU")} VLR/день · энергия {Math.round(energy)}</small></button>
            <button onClick={()=>setTab("companies")}><span>ХОЛДИНГ</span><b>{ownedCompanies.length} компаний</b><small>{controlledValue.toLocaleString("ru-RU")} VLR под контролем</small></button>
          </section>
          <section className="home-news-card command-news"><div className="card-head"><div><span>ЛЕНТА РЫНКА · ДЕНЬ {day}</span><h2>Что меняется прямо сейчас</h2></div><button onClick={()=>setTab("news")}>Все новости →</button></div><div className="home-news-list">{country.companies.slice(0,4).map(c=>{const e=marketEvent(c,day);return <button key={c.ticker} onClick={()=>openExchange(c)}><span className={e.impact>=0?"news-signal positive":"news-signal negative"}>{e.impact>=0?"▲":"▼"}</span><div><b>{c.name}</b><p>{e.headline}</p></div><strong className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"+":""}{(e.impact*100).toFixed(1)}%</strong></button>})}</div></section>
        </>}        {tab==="exchange"&&<Panel title={"Биржа · "+country.name} eyebrow="РЫНОЧНАЯ ИГРА">
          <div className="exchange-safe">
            <div className="exchange-safe-top">
              <div><span className="eyebrow">ТОРГОВЫЙ ТЕРМИНАЛ</span><h2>Фондовый рынок {country.name}</h2><p>Один бар = один выбранный интервал · OHLC · японские свечи</p></div>
              <div className="exchange-safe-clock"><b>ДЕНЬ {day}</b><span>{Math.floor((day-1)/30)+1} месяц · {timePaused?"рынок на паузе":"рынок открыт"}</span><div><button type="button" onClick={()=>setTimePaused(v=>!v)}>{timePaused?"▶ Продолжить":"Ⅱ Пауза"}</button>{[1,1.5,2].map(x=><button type="button" key={x} className={timeSpeed===x?"active":""} onClick={()=>setTimeSpeed(x as 1|1.5|2)}>×{x}</button>)}</div></div>
            </div>
            <div className="exchange-safe-marketline"><span>Компаний: <b>{country.companies.length}</b></span><span>Индекс рынка: <b>{marketSnapshot.index.toFixed(1)}</b></span><span>Ширина: <b>{Math.round(marketSnapshot.breadth*100)}%</b></span><span>Настроение: <b className={marketSnapshot.sentiment>=0?"gain":"loss"}>{marketSnapshot.sentiment>=0?"+":""}{(marketSnapshot.sentiment*100).toFixed(2)}%</b></span><span>Кэш: <b>{cash.toLocaleString("ru-RU")} VLR</b></span><button type="button" onClick={advance}>Следующий день →</button></div>
            <div className="exchange-safe-companies">{country.companies.map(c=><button type="button" key={c.ticker} className={exchangeCompany?.ticker===c.ticker?"selected":""} onClick={()=>{setExchangeCompany(c);setSelectedCompany(null);setTab("exchange")}}><b>{c.ticker}</b><span>{c.name}</span><small>{c.sector}</small><strong>{priceFor(c).toLocaleString("ru-RU")} VLR</strong><em className={priceChange(c)>=0?"gain":"loss"}>{priceChange(c)>=0?"+":""}{priceChange(c).toFixed(2)}%</em></button>)}</div>
            {!exchangeCompany&&<div className="exchange-recovery"><b>Биржа готова к работе</b><p>Выбери компанию ниже, чтобы открыть котировку, японские свечи, аналитику и досье.</p><button type="button" className="primary small" onClick={()=>{const first=country.companies[0];if(first){setExchangeCompany(first);setSelectedCompany(first);}}}>Открыть первую компанию</button></div>}
            {exchangeCompany&&(()=>{
              const focus=exchangeCompany, profile=companyProfile(focus,country), report=quarterlyReport(focus,day), candles=candleSeries(focus,chartRange), current=priceFor(focus), owned=holdings[focus.ticker]||0, econProfile=companyEconomicProfile(focus,country.id), currentCap=current*econProfile.shares;
              return <div className="exchange-safe-focus">
                <div className="exchange-safe-focushead"><div><span className="ticker">{focus.ticker}</span><h2>{focus.name}</h2><p>{focus.sector} · Уровень компании {profile.companyLevel??3}/5 · CEO {ownedCompanies.includes(focus.ticker)?"Ты":focus.ceo}</p></div><div><b>{current.toLocaleString("ru-RU")} VLR</b><strong className={priceChange(focus)>=0?"gain":"loss"}>{priceChange(focus)>=0?"+":""}{priceChange(focus).toFixed(2)}%</strong></div></div>
                <div className="company-quick-dossier">
                  <div className="quick-dossier-main"><span className="eyebrow">ДОСЬЕ КОМПАНИИ</span><h3>{focus.name}</h3><p>{profile.description}</p><div className="quick-dossier-facts"><div><span>ГЕНЕРАЛЬНЫЙ ДИРЕКТОР</span><b>{focus.ceo}</b><small>{focus.ceoAge} лет · {focus.ceoRole}</small></div><div><span>ОСНОВАНА</span><b>{profile.founded}</b><small>{profile.headquarters}</small></div><div><span>ШТАТ</span><b>{profile.employees}</b><small>штаб: {profile.headquarters}</small></div><div><span>РЕСУРСЫ</span><b>{profile.materials}</b><small>{focus.sector}</small></div></div></div>
                  <div className="quick-dossier-news"><span className="eyebrow">ПОСЛЕДНЯЯ НОВОСТЬ</span><b>{marketEvent(focus,day).headline}</b><p>{marketEvent(focus,day).category} · сырьё: {marketEvent(focus,day).commodity.name} ({marketEvent(focus,day).commodity.impact>=0?"+":""}{(marketEvent(focus,day).commodity.impact*100).toFixed(1)}%).</p><strong className={marketEvent(focus,day).impact>=0?"gain":"loss"}>{marketEvent(focus,day).impact>=0?"+":""}{(marketEvent(focus,day).impact*100).toFixed(2)}% влияние</strong></div>
                </div>
                <div className="exchange-safe-chart"><CandleChart company={focus} candles={candles} range={chartRange}/><div className="chart-range-tabs">{chartRangeLabels.map(([id,label])=><button type="button" key={id} className={chartRange===id?"active":""} onClick={()=>setChartRange(id)}>{label}</button>)}</div></div>
                <div className="exchange-safe-actions"><span>В портфеле: <b>{owned} акций</b> · Кэш: <b>{cash.toLocaleString("ru-RU")} VLR</b></span><div><button type="button" className="secondary-action" onClick={()=>setSelectedCompany(focus)}>Открыть досье</button><button type="button" onClick={()=>sell(focus)} disabled={!owned}>Продать</button><button type="button" className="primary small" onClick={()=>buy(focus,1000)}>Купить 1 000 акций</button></div></div><div className="ownership-ladder"><button type="button" onClick={()=>buyStake(focus,5)}><b>5%</b><span>Наблюдение</span><small>{owned/econProfile.shares>=.05?"достигнуто":"ещё "+Math.max(0,5-owned/econProfile.shares*100).toFixed(1)+" п.п."}</small></button><button type="button" onClick={()=>buyStake(focus,10)}><b>10%</b><span>Стратегический пакет</span><small>{owned/econProfile.shares>=.10?"достигнуто":"нужно "+Math.max(0,10-owned/econProfile.shares*100).toFixed(1)+" п.п."}</small></button><button type="button" onClick={()=>buyStake(focus,25)}><b>25%</b><span>Блокирующий пакет</span><small>{owned/econProfile.shares>=.25?"достигнуто":"нужно "+Math.max(0,25-owned/econProfile.shares*100).toFixed(1)+" п.п."}</small></button><button type="button" onClick={()=>buyStake(focus,33)}><b>33%</b><span>Значимое влияние</span><small>{owned/econProfile.shares>=.33?"достигнуто":"нужно "+Math.max(0,33-owned/econProfile.shares*100).toFixed(1)+" п.п."}</small></button><button type="button" className="control" onClick={()=>buyStake(focus,51)}><b>51%</b><span>Контроль</span><small>{owned/econProfile.shares>=.51?"компания под контролем":"главная цель"}</small></button><button type="button" onClick={()=>buyStake(focus,75)}><b>75%</b><span>Полный контроль</span><small>{owned/econProfile.shares>=.75?"достигнуто":"следующий крупный рубеж"}</small></button></div><div className="trade-help"><b>Как читать сделку:</b> купить — добавить акцию в портфель по текущей цене; продать — закрыть часть позиции. <b>Контроль 51%</b> — отдельная корпоративная сделка, которая требует капитализации компании и премии за контроль.</div>
                <div className="company-intel">
                  <div><span className="eyebrow">АНАЛИТИКА</span><h3>Прогноз рынка</h3><p>Базовый сценарий: <b className={priceChange(focus)>=0?"gain":"loss"}>{priceChange(focus)>=0?"умеренный рост":"осторожный сценарий"}</b>. Драйверы: {focus.sector}, страна, сырьё и последний корпоративный сигнал.</p><span className="analyst-quote">«{priceChange(focus)>=0?"Мы видим пространство для роста, если текущий спрос сохранится.":"Мы сохраняем осторожность: рынок уже закладывает существенные риски в оценку."}» — аналитик MarketArena</span><div className="analyst-bars"><span style={{width:`${Math.max(12,Math.min(88,50+priceChange(focus)*5))}%`}}>Рост</span><span style={{width:`${Math.max(12,Math.min(88,50-priceChange(focus)*3))}%`}}>Стабильность</span></div></div>
                  <div><span className="eyebrow">НОВОСТИ КОМПАНИИ</span><h3>Последние события</h3>{[0,1,2].map(i=>{const e=marketEvent(focus,Math.max(1,day-i*3));return <article className="company-news-item" key={i}><b>ДЕНЬ {Math.max(1,day-i*3)}</b><p>{e.headline}.</p><strong className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"+":""}{(e.impact*100).toFixed(2)}% к настроению</strong></article>})}</div>
                </div>
                <div className="exchange-safe-metrics"><div><span>КАПИТАЛИЗАЦИЯ</span><b>{(currentCap/1_000_000).toFixed(2).replace(".",",")} млн VLR</b><small>{econProfile.tier==="mega"?"Мега":econProfile.tier==="large"?"Крупная":econProfile.tier==="medium"?"Средняя":econProfile.tier==="small"?"Малая":"Микро"} компания</small></div><div><span>ВЫРУЧКА</span><b>{profile.revenue}</b></div><div><span>P / E</span><b>{profile.pe}</b></div><div><span>P / B</span><b>{profile.pb}</b></div></div>
                <div className="exchange-safe-report"><div><span>КВАРТАЛЬНЫЙ ОТЧЁТ · Q{report.quarter}</span><b>{report.outlook.toUpperCase()}</b></div><h3>{focus.name}: результаты против ожиданий</h3><p>{report.event.headline} Для сектора «{focus.sector}» ключевой фактор — цены {report.commodity.name}. Рынок сравнивает фактические результаты с ожиданиями и переносит сюрприз в котировку.</p><div className="financial-report-grid"><strong><small>ВЫРУЧКА</small><b>{(report.revenue/1_000_000).toFixed(2).replace(".",",")} млн VLR</b><small>{report.revenueGrowth>=0?"+":""}{report.revenueGrowth.toFixed(1)}% г/г</small></strong><strong><small>ЧИСТАЯ ПРИБЫЛЬ</small><b>{(report.profit/1_000_000).toFixed(2).replace(".",",")} млн VLR</b><small>{report.profitGrowth>=0?"+":""}{report.profitGrowth.toFixed(1)}% г/г</small></strong><strong><small>СЮРПРИЗ ВЫРУЧКИ</small><b>{report.revenueSurprise>=0?"+":""}{(report.revenueSurprise*100).toFixed(1)}%</b><small>ожидание рынка</small></strong><strong><small>СЮРПРИЗ ПРИБЫЛИ</small><b>{report.profitSurprise>=0?"+":""}{(report.profitSurprise*100).toFixed(1)}%</b><small>ожидание рынка</small></strong></div><div className="quarter-history"><span>ЭКОНОМИКА ОТЧЁТНОГО КВАРТАЛА</span><div><span>Сырьё</span><b>{report.commodity.name}</b><em>{report.commodity.impact>=0?"+":""}{(report.commodity.impact*100).toFixed(2)}%</em></div><div><span>Рыночный сигнал</span><b>{report.event.category}</b><em className={report.event.impact>=0?"gain":"loss"}>{report.event.impact>=0?"+":""}{(report.event.impact*100).toFixed(2)}%</em></div></div></div><div className="economic-chain-card"><div><span className="eyebrow">ЭКОНОМИЧЕСКАЯ ЦЕПОЧКА</span><h3>Если меняется «{focus.sector}»</h3><p>Эта компания не существует отдельно: изменения спроса, сырья и логистики передаются связанным отраслям.</p></div><div className="chain-flow"><b className="chain-current">{focus.sector}</b>{companyChain(focus.sector).map((sector,i)=><span key={sector}><i>→</i>{sector}</span>)}</div></div>
              </div>;
            })()}
          </div>
        </Panel>}
{tab==="economy"&&<Panel title="Экономика" eyebrow="КАК РАБОТАЕТ МИР"><p className="panel-lead">Здесь можно понять не только цифры, но и причинно-следственные связи. Все показатели ниже — индексы относительно нормального состояния экономики: 100% означает базовый уровень, а не «процент зарплаты» или «вероятность».</p><div className="economy-explainer-grid">
<div className="economy-explainer-card"><span>ВВП</span><b>{(economyNow.gdpGrowth*100).toFixed(1)}%</b><p>Темп роста экономики. Положительное значение означает расширение производства и услуг; отрицательное — спад.</p></div>
<div className="economy-explainer-card"><span>ИНФЛЯЦИЯ</span><b>{(economyNow.inflation*100).toFixed(1)}%</b><p>Скорость роста цен. Чем выше инфляция, тем быстрее дорожают жизнь и ресурсы и тем сильнее давление на реальные доходы.</p></div>
<div className="economy-explainer-card"><span>СТАВКА</span><b>{(economyNow.policyRate*100).toFixed(1)}%</b><p>Цена денег в экономике. Высокая ставка делает кредиты дороже и обычно давит на инвестиции и дорогие активы.</p></div>
<div className="economy-explainer-card"><span>ЗАРПЛАТЫ</span><b>{Math.round(economyNow.wageIndex*100)}%</b><p>Индекс зарплат относительно базового уровня. 101% = зарплаты примерно на 1% выше базы, а не «зарплата на 101%».</p></div>
<div className="economy-explainer-card"><span>СПРОС</span><b>{Math.round(economyNow.consumerDemand*100)}%</b><p>Индекс потребительского спроса. 104% = спрос примерно на 4% выше базового уровня; это поддерживает выручку ритейла и части услуг.</p></div>
<div className="economy-explainer-card"><span>БЕЗРАБОТИЦА</span><b>{(economyNow.unemployment*100).toFixed(1)}%</b><p>Доля рабочей силы без работы. Рост безработицы обычно снижает потребительский спрос и переговорную силу работников.</p></div>
</div><div className="economy-chain-board"><div><span className="eyebrow">ПРИМЕР ЦЕПОЧКИ</span><h2>Как одна новость доходит до твоего портфеля</h2><p>Шок энергии → растут затраты → меняется прибыль компании → меняется ожидание рынка → меняется капитализация → меняется стоимость твоей позиции.</p></div><div className="economy-chain-steps"><span>Событие</span><i>→</i><span>Затраты / спрос</span><i>→</i><span>Прибыль</span><i>→</i><span>Капитализация</span><i>→</i><span>Твоя позиция</span></div></div><div className="economy-live-table"><div><span>РЫНОЧНЫЙ ИНДЕКС</span><b>{marketSnapshot.index.toFixed(1)}</b><small>100 = уровень на старте</small></div><div><span>ШИРИНА РЫНКА</span><b>{Math.round(marketSnapshot.breadth*100)}%</b><small>доля растущих компаний</small></div><div><span>НАСТРОЕНИЕ</span><b className={marketSnapshot.sentiment>=0?"gain":"loss"}>{marketSnapshot.sentiment>=0?"+":""}{(marketSnapshot.sentiment*100).toFixed(2)}%</b><small>средний новостной импульс</small></div></div></Panel>}
        {tab==="events"&&<Panel title="Задания" eyebrow="КАРТА ПРОГРЕССА"><p className="panel-lead">Каждый этап кампании даёт конкретную цель. Здесь видно прогресс, условие, награду и следующий шаг.</p><div className="mission-hero"><div><span className="eyebrow">СЛЕДУЮЩАЯ ЦЕЛЬ</span><h2>{nextMission.title}</h2><p>{nextMission.text}</p></div><b>НАГРАДА · {nextMission.reward.toLocaleString("ru-RU")} VLR</b></div><div className="mission-grid">{missionState.map(m=><article className={"mission-card "+(m.done?"done":"")} key={m.id}><div><span>ГЛАВА {m.chapter}</span><h3>{m.title}</h3><p>{m.text}</p><small>{m.done?"Условие выполнено":"Условие проверяется автоматически во время игры"}</small></div><strong>{m.done?"✓ ВЫПОЛНЕНО":"В РАБОТЕ"}</strong></article>)}</div></Panel>}
        {tab==="portfolio"&&<Panel title="Портфель" eyebrow="ТВОЙ КАПИТАЛ"><div className="portfolio-summary"><div><span>СТОИМОСТЬ АКТИВОВ</span><b>{portfolioValue.toLocaleString("ru-RU")} VLR</b></div><div><span>СВОБОДНЫЕ ДЕНЬГИ</span><b>{cash.toLocaleString("ru-RU")} VLR</b></div><div><span>ВСЕГО</span><b>{totalWealth.toLocaleString("ru-RU")} VLR</b></div></div><PortfolioChart points={portfolioHistory}/><div className="portfolio-insights"><div><span>ДИВЕРСИФИКАЦИЯ</span><b>{Object.values(holdings).filter(Boolean).length} позиций</b><small>открытые позиции</small></div><div><span>ДЕНЕЖНАЯ ДОЛЯ</span><b>{((cash/Math.max(1,totalWealth))*100).toFixed(1)}%</b><small>ликвидность</small></div><div><span>РЫНОЧНАЯ ЭКСПОЗИЦИЯ</span><b>{portfolioValue.toLocaleString("ru-RU")} VLR</b><small>стоимость акций</small></div></div><div className="table-card portfolio-table">{country.companies.filter(c=>(holdings[c.ticker]||0)>0).map(c=><div className="table-row" key={c.ticker}><button className="ticker-link" onClick={()=>openExchange(c)}>{c.ticker}</button><span>{c.name}</span><span>{holdings[c.ticker]} акций</span><strong>{(holdings[c.ticker]*priceFor(c)).toLocaleString("ru-RU")} VLR</strong><div className="trade-actions"><button onClick={()=>buy(c,1000)}>+ Купить</button><button onClick={()=>sell(c)}>- Продать</button></div></div>)}{portfolioValue===0&&<div className="empty-state">Портфель пуст. Открой «Биржу» и купи первую акцию.</div>}</div></Panel>}
        {tab==="companies"&&<Panel title={"Компании · "+country.name} eyebrow="ПУБЛИЧНЫЕ КОМПАНИИ"><p className="panel-lead">Каждая компания живёт внутри общего рынка: котировка реагирует на новости, сырьё, кризисы, страновой цикл и связанные отрасли. Нажми на карточку для подробностей.</p><div className="company-grid">{country.companies.map((c,index)=><article className={"company-focus-card company-variant-"+(index%5)+" "+sectorClass(c.sector)} key={c.ticker} onClick={()=>openExchange(c)}><div className="company-focus-top"><span className="ticker">{c.ticker}</span><span className={"sector-chip "+sectorClass(c.sector)}>{c.sector}</span></div><h3>{c.name}</h3><p>{c.note}</p><div className="company-ceo"><CEOAvatar company={c}/><div><span className="eyebrow">CEO · {c.ceoRole}</span><b>{c.ceo}</b><small>{c.ceoAge} лет</small></div></div><div className="company-focus-footer"><span>Котировка <b>{priceFor(c).toLocaleString("ru-RU")} VLR</b>{ownedCompanies.includes(c.ticker)&&<small className="owned-company-tag">ПОД КОНТРОЛЕМ · CEO: ТЫ</small>}</span><div><button onClick={e=>{e.stopPropagation();buy(c,1000)}}>Купить 1 000 акций</button>{!ownedCompanies.includes(c.ticker)&&<button className="takeover-button" onClick={e=>{e.stopPropagation();acquireCompany(c)}}>Контроль 51% · {takeoverCost(c).toLocaleString("ru-RU")}</button>}</div><small className="control-help">51% = контроль компании, не полный выкуп. Стоимость рассчитывается от капитализации + премия за контроль.</small></div></article>)}</div></Panel>}
        {tab==="life"&&<Panel title="Жизнь" eyebrow="КАРЬЕРА И ЖИЗНЬ"><p className="panel-lead">Работа — это первый денежный поток, но не единственный. Выбирай занятие, развивай карьеру и используй доход как стартовый капитал.</p>{(()=>{const preset={housing,food,transport,appearance};const cost=lifestyleCost;
const lifeUnlockCount=[...Object.keys(lifestyleUnlock.housing),...Object.keys(lifestyleUnlock.food),...Object.keys(lifestyleUnlock.transport),...Object.keys(lifestyleUnlock.appearance)].filter((k,i,a)=>a.indexOf(k)===i).length;
const lifeUnlocked=[
  ...Object.entries(lifestyleUnlock.housing).filter(([k,v])=>totalWealth>=v).map(([k])=>"housing:"+k),
  ...Object.entries(lifestyleUnlock.food).filter(([k,v])=>totalWealth>=v).map(([k])=>"food:"+k),
  ...Object.entries(lifestyleUnlock.transport).filter(([k,v])=>totalWealth>=v).map(([k])=>"transport:"+k),
  ...Object.entries(lifestyleUnlock.appearance).filter(([k,v])=>totalWealth>=v).map(([k])=>"appearance:"+k)
].length;
const lifeLevel=Math.min(10,Math.max(1,1+Math.floor((qualityOfLife+Math.min(60,lifeUnlocked*4)+Math.min(30,Math.floor(totalWealth/100000))) / 20)));
const lifeNextTarget=[...Object.entries(lifestyleUnlock.housing).map(([k,v])=>({group:"Жильё",key:k,cost:v,label:lifestyleNames.housing[k as keyof typeof lifestyleNames.housing]})),...Object.entries(lifestyleUnlock.appearance).map(([k,v])=>({group:"Одежда",key:k,cost:v,label:lifestyleNames.appearance[k as keyof typeof lifestyleNames.appearance]})),...Object.entries(lifestyleUnlock.food).map(([k,v])=>({group:"Питание",key:k,cost:v,label:lifestyleNames.food[k as keyof typeof lifestyleNames.food]})),...Object.entries(lifestyleUnlock.transport).map(([k,v])=>({group:"Транспорт",key:k,cost:v,label:lifestyleNames.transport[k as keyof typeof lifestyleNames.transport]}))].filter(x=>x.cost>totalWealth).sort((a,b)=>a.cost-b.cost)[0];
return <><div className="life-progress-hero">
  <div className="life-progress-main"><span className="eyebrow">ЛИЧНАЯ ПРОГРЕССИЯ</span><h2>Уровень жизни {lifeLevel} <span>· {qualityOfLife}/100</span></h2><p>Ты строишь не набор покупок, а собственную траекторию: комфорт → энергия → репутация → доступ к более дорогой жизни и сильным карьерным возможностям.</p><div className="life-progress-track"><i style={{width:Math.min(100,qualityOfLife)+"%"}}/></div></div>
  <div className="life-progress-next"><span>СЛЕДУЮЩИЙ РУБЕЖ</span>{lifeNextTarget?<><b>{lifeNextTarget.label}</b><small>{lifeNextTarget.group} · нужно ещё {Math.max(0,lifeNextTarget.cost-totalWealth).toLocaleString("ru-RU")} VLR</small></>:<><b>Все базовые улучшения открыты</b><small>Теперь цель — удерживать качество жизни и наращивать капитал.</small></>}</div>
</div>
<div className="life-goals-grid">
  <div className="life-goal-card"><span>ЭНЕРГИЯ</span><b>{Math.round(energy)}/100</b><small>{energy>=75?"Готов к длинной смене":"Улучши питание или отдохни, чтобы повысить восстановление"}</small></div>
  <div className="life-goal-card"><span>КАПИТАЛ НА ЖИЗНЬ</span><b>{totalWealth.toLocaleString("ru-RU")} VLR</b><small>Капитал открывает новые уровни жилья, одежды, питания и транспорта.</small></div>
  <div className="life-goal-card"><span>ЕЖЕДНЕВНАЯ ЦЕНА</span><b>{cost.toLocaleString("ru-RU")} VLR</b><small>Чем выше уровень жизни, тем больше постоянная нагрузка на бюджет.</small></div>
  <div className="life-goal-card"><span>СЛЕДУЮЩАЯ ЦЕЛЬ</span><b>{lifeNextTarget?lifeNextTarget.group:"Мастерство"}</b><small>{lifeNextTarget?lifeNextTarget.label:"Держи качество жизни выше 80 и развивай карьеру."}</small></div>
</div><div className="life-quality-card"><div><span className="eyebrow">КАЧЕСТВО ЖИЗНИ</span><h2>{qualityLabel} · {qualityOfLife}/100</h2><p>Итоговый показатель соединяет жильё, питание, транспорт, внешний вид и текущую энергию. Он влияет на то, насколько устойчиво ты работаешь и развиваешься.</p></div><div className="life-quality-meter"><i style={{width:qualityOfLife+"%"}}/></div><div className="life-quality-factors"><span>Жильё <b>{GAME_CONFIG.housing[housing].comfort}/100</b></span><span>Питание <b>{GAME_CONFIG.food[food].energy}/100</b></span><span>Транспорт <b>{GAME_CONFIG.transport[transport].mobility}/100</b></span><span>Энергия <b>{Math.round(energy)}/100</b></span></div></div><div className="life-profile-grid"><div className="life-character-card"><LifeAvatar appearance={appearance} careerTitle={careerTitle} name={player} housing={housing} food={food} transport={transport}/></div><div className="life-stats-card"><span className="eyebrow">ЛИЧНЫЙ КОНТУР</span><h2>Образ жизни</h2><div className="life-option-grid"><div className="life-option"><span>ЖИЛЬЁ</span><b>{lifestyleNames.housing[preset.housing]}</b><small>Комфорт {GAME_CONFIG.housing[preset.housing].comfort}/100 · репутация {GAME_CONFIG.housing[preset.housing].reputation>=0?"+":""}{GAME_CONFIG.housing[preset.housing].reputation}</small></div><div className="life-option"><span>ОДЕЖДА</span><b>{lifestyleNames.appearance[preset.appearance]}</b><small>Переговоры +{GAME_CONFIG.appearance[preset.appearance].negotiation}</small></div><div className="life-option"><span>ПИТАНИЕ</span><b>{lifestyleNames.food[preset.food]}</b><small>Энергия {GAME_CONFIG.food[preset.food].energy}/100</small></div><div className="life-option"><span>ТРАНСПОРТ</span><b>{lifestyleNames.transport[preset.transport]}</b><small>Мобильность {GAME_CONFIG.transport[preset.transport].mobility}/100</small></div></div><div className="life-control-grid"><label><span>ЖИЛЬЁ</span><select value={housing} onChange={e=>{const v=e.target.value as keyof typeof GAME_CONFIG.housing;if(totalWealth < lifestyleUnlock.housing[v]){setNotice("Недоступно: нужно "+lifestyleUnlock.housing[v].toLocaleString("ru-RU")+" VLR капитала.");return;} setHousing(v)}}>{Object.keys(GAME_CONFIG.housing).map(k=><option key={k} value={k} disabled={totalWealth<lifestyleUnlock.housing[k as keyof typeof lifestyleUnlock.housing]}>{lifestyleNames.housing[k as keyof typeof lifestyleNames.housing]} {totalWealth<lifestyleUnlock.housing[k as keyof typeof lifestyleUnlock.housing]?"· 🔒 "+lifestyleUnlock.housing[k as keyof typeof lifestyleUnlock.housing].toLocaleString("ru-RU")+" VLR":""}</option>)}</select><small>Открывается по капиталу · сейчас жильё.</small></label><label><span>ОДЕЖДА</span><select value={appearance} onChange={e=>{const v=e.target.value as keyof typeof GAME_CONFIG.appearance;if(totalWealth < lifestyleUnlock.appearance[v]){setNotice("Недоступно: нужно "+lifestyleUnlock.appearance[v].toLocaleString("ru-RU")+" VLR капитала.");return;} setAppearance(v)}}>{Object.keys(GAME_CONFIG.appearance).map(k=><option key={k} value={k} disabled={totalWealth<lifestyleUnlock.appearance[k as keyof typeof lifestyleUnlock.appearance]}>{lifestyleNames.appearance[k as keyof typeof lifestyleNames.appearance]} {totalWealth<lifestyleUnlock.appearance[k as keyof typeof lifestyleUnlock.appearance]?"· 🔒 "+lifestyleUnlock.appearance[k as keyof typeof lifestyleUnlock.appearance].toLocaleString("ru-RU")+" VLR":""}</option>)}</select><small>Открывается по капиталу · сейчас репутация.</small></label><label><span>ПИТАНИЕ</span><select value={food} onChange={e=>{const v=e.target.value as keyof typeof GAME_CONFIG.food;if(totalWealth < lifestyleUnlock.food[v]){setNotice("Недоступно: нужно "+lifestyleUnlock.food[v].toLocaleString("ru-RU")+" VLR капитала.");return;} setFood(v)}}>{Object.keys(GAME_CONFIG.food).map(k=><option key={k} value={k} disabled={totalWealth<lifestyleUnlock.food[k as keyof typeof lifestyleUnlock.food]}>{lifestyleNames.food[k as keyof typeof lifestyleNames.food]} {totalWealth<lifestyleUnlock.food[k as keyof typeof lifestyleUnlock.food]?"· 🔒 "+lifestyleUnlock.food[k as keyof typeof lifestyleUnlock.food].toLocaleString("ru-RU")+" VLR":""}</option>)}</select><small>Открывается по капиталу · сейчас питание.</small></label><label><span>ТРАНСПОРТ</span><select value={transport} onChange={e=>{const v=e.target.value as keyof typeof GAME_CONFIG.transport;if(totalWealth < lifestyleUnlock.transport[v]){setNotice("Недоступно: нужно "+lifestyleUnlock.transport[v].toLocaleString("ru-RU")+" VLR капитала.");return;} setTransport(v)}}>{Object.keys(GAME_CONFIG.transport).map(k=><option key={k} value={k} disabled={totalWealth<lifestyleUnlock.transport[k as keyof typeof lifestyleUnlock.transport]}>{lifestyleNames.transport[k as keyof typeof lifestyleNames.transport]} {totalWealth<lifestyleUnlock.transport[k as keyof typeof lifestyleUnlock.transport]?"· 🔒 "+lifestyleUnlock.transport[k as keyof typeof lifestyleUnlock.transport].toLocaleString("ru-RU")+" VLR":""}</option>)}</select><small>Открывается по капиталу · сейчас мобильность.</small></label></div><div className="life-impact"><div><span>РАСХОД В ДЕНЬ</span><b>{cost.toLocaleString("ru-RU")} VLR</b></div><div><span>РЕПУТАЦИЯ</span><b>{GAME_CONFIG.housing[preset.housing].reputation+GAME_CONFIG.food[preset.food].reputation+GAME_CONFIG.transport[preset.transport].reputation+GAME_CONFIG.appearance[preset.appearance].reputation>=0?"+":""}{GAME_CONFIG.housing[preset.housing].reputation+GAME_CONFIG.food[preset.food].reputation+GAME_CONFIG.transport[preset.transport].reputation+GAME_CONFIG.appearance[preset.appearance].reputation}</b></div><div><span>ПЕРЕГОВОРЫ</span><b>+{negotiation}</b></div><div><span>ЭНЕРГИЯ</span><b>{Math.round(energy)}/100</b></div></div></div></div></>})()}<div className="career-banner"><div><span className="eyebrow">КАРЬЕРНЫЙ ПРОГРЕСС</span><h2>{careerTitle}</h2><p>Уровень {careerLevel} · {careerXP}/30 XP · выполнено работ: {careerXP}</p></div><div className="career-level-bar"><i style={{width:Math.min(100,(careerXP/30)*100)+"%"}}/></div></div><div className="mini-game-card"><div><span className="eyebrow">2D · REACTION TEST</span><h2>Рыночный сигнал</h2><p>Нажми на активную точку раньше, чем исчезнет импульс. Это первый простой мини-тест; награда сразу добавляется в капитал.</p></div><div className="mini-game-board">{miniGame.active?Array.from({length:6},(_,i)=><button key={i} className={i===miniGame.target?"mini-target":""} onClick={()=>hitMiniGame(i)} aria-label={"Точка "+(i+1)}>{i===miniGame.target?"◆":""}</button>):<button className="mini-start" onClick={startMiniGame}>Запустить тест</button>}</div><div className="mini-game-meta"><span>Серия <b>{miniGame.score}</b></span><button onClick={startMiniGame}>{miniGame.active?"Новая попытка":"Начать"}</button></div></div><div className="career-track"><div className="career-track-head"><div><span className="eyebrow">РЫНОК ТРУДА</span><h2>Карьера</h2><p>Общий карьерный уровень открывает новые должности, а каждая профессия развивается отдельно. Чем больше практики, тем ниже энергозатраты и выше оплата.</p></div><div className="career-next"><span>ОБЩИЙ УРОВЕНЬ</span><b>{careerLevel}</b><small>{careerLevel<10?Math.max(0,3-careerXP%3)+" XP до следующего уровня":"максимальный уровень"}</small></div></div><div className="career-job-grid">{jobs.map(j=>{const id=j.id as JobId;const xp=jobXP[id]??0;const level=jobLevel(id,xp);const locked=careerLevel<j.unlock;const pay=jobPay(j,id);const next=jobNextXP(id);const currentFloor=jobProgression[id].levels[level-1]??0;const progress=level>=5?100:Math.min(100,((xp-currentFloor)/Math.max(1,next-currentFloor))*100);return <article className={locked?"career-job locked":"career-job"} key={j.id}><div><span>УР. {j.unlock} · {j.sector}</span><h3>{j.title}</h3><p>{j.text}</p><div className="profession-level-row"><b>Проф. ур. {level} · {jobLevelLabel(id)}</b><span>{xp}/15 XP</span></div><div className="profession-xp-bar"><i style={{width:progress+"%"}}/></div><small className="profession-bonus">{jobProgression[id].bonuses[level-1]} · {level>=5?"максимум":("до ур. "+(level+1)+": "+Math.max(0,next-xp)+" XP")}</small></div><div className="career-job-foot"><b>{pay.toLocaleString("ru-RU")} VLR</b><small>−{jobEnergyCost(j.id)} энергии</small><button disabled={locked||workActions>=GAME_CONFIG.workActionsPerDay||jobCooldown===j.id} onClick={()=>startJobGame(j.id)}>{locked?"🔒 Ур. "+j.unlock:workActions>=GAME_CONFIG.workActionsPerDay?"Лимит":"Работать"}</button></div></article>})}</div></div></Panel>}
        {tab==="map"&&<Panel title={"Карта "+country.name} eyebrow="АТЛАС"><p className="panel-lead">Карта теперь является игровым пространством: камера стартует в твоём районе, а тип жилья определяет район, размер дома и плотность застройки.</p><AtlasMap selected={country.id} onSelect={()=>{}} showCompanies onCompany={openExchange} holdings={holdings} home={{housing,label:`${housing==="dormitory"?"Общежитие":housing==="shared"?"Общий дом":housing==="studio"?"Студия":housing==="apartment"?"Апартаменты":"Премиум-дом"} · МОЙ ДОМ`}}/></Panel>}
        {tab==="events"&&<Panel title="События" eyebrow="РЫНОЧНЫЕ СОБЫТИЯ"><p className="panel-lead">Экономические события связывают страну, отрасли и компании. Мир симулируется по игровым дням: сырьё, ставки, торговля, войны, климат и технологические циклы меняют ожидания и котировки.</p>{currentCrisis&&<div className="macro-event-banner"><div><span className="eyebrow">ГЛОБАЛЬНОЕ СОБЫТИЕ · ДЕНЬ {day}</span><h2>{currentCrisis.name}</h2><p>{currentCrisis.headline}</p></div><strong className={currentCrisis.impact>=0?"gain":"loss"}>{currentCrisis.impact>=0?"+":""}{(currentCrisis.impact*100).toFixed(1)}%</strong><small>Ещё {currentCrisis.remaining} дн. · рынок адаптируется через отраслевые эффекты</small></div>}<div className="event-grid">{country.companies.map(c=>{const e=marketEvent(c,day);return <button className="event-card" key={c.ticker} onClick={()=>{setSelectedNews(c.ticker);setTab("news")}}><div><span className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"ПОЛОЖИТЕЛЬНО":"РИСК"}</span><b>{c.name}</b><small>{c.sector} · {c.ticker}</small></div><p>{e.headline}</p><strong className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"+":""}{(e.impact*100).toFixed(2)}%</strong><span className="event-card-action">Открыть новость →</span></button>})}</div></Panel>}
        {tab==="history"&&<Panel title="История игры" eyebrow="ИСТОРИЯ ИГРЫ"><p className="panel-lead">Здесь сохраняются финансовые решения игрока: сделки, дни, изменения капитала и ключевые действия.</p><div className="history-milestones"><div><span>ТЕКУЩИЙ ДЕНЬ</span><b>{day}</b><small>рынок продолжает двигаться</small></div><div><span>КАПИТАЛ</span><b>{totalWealth.toLocaleString("ru-RU")} VLR</b><small>ликвидность + позиции</small></div><div><span>РЕЖИМ</span><b>ОФЛАЙН</b><small>локальная история</small></div></div><div className="history-list">{transactions.map((t,i)=><div key={i}><span>День {t.day}</span><b className={t.type==="BUY"?"loss":"gain"}>{t.type==="BUY"?"ПОКУПКА":"ПРОДАЖА"}</b><strong>{t.ticker}</strong><span>{t.quantity} шт.</span><em>{(t.price*t.quantity).toLocaleString("ru-RU")} VLR</em></div>)}{transactions.length===0&&<div className="empty-state">История пока пуста. Соверши первую сделку на бирже.</div>}</div><div className="history-stat-grid">
  <div><span>ДНЕЙ СЫГРАНО</span><b>{day}</b><small>пройдено игровых дней</small></div>
  <div><span>СДЕЛОК</span><b>{transactions.length}</b><small>{transactions.length?"активность на рынке":"пока без сделок"}</small></div>
  <div><span>ПОЗИЦИЙ</span><b>{Object.values(holdings).filter(Boolean).length}</b><small>{Object.values(holdings).filter(Boolean).length?"открытые активы":"портфель пуст"}</small></div>
</div></Panel>}
        {tab==="profile"&&<Panel title={"Профиль · "+player} eyebrow="ПРОФИЛЬ ИГРОКА">
          <div className="profile-hero-card">
            <div className="profile-avatar">{player.trim().slice(0,1).toUpperCase()}</div>
            <div><span className="eyebrow">АККАУНТ И ПРОГРЕСС</span><h2>{player}</h2><p>{country.name} · {difficultyLevels.find(x=>x.id===difficulty)?.name??difficulty} · День {day}</p></div>
            <button type="button" className="profile-logout" onClick={onLogout}>Выйти из аккаунта</button>
          </div>
          <div className="campaign-goals-card"><div><span className="eyebrow">ГЛОБАЛЬНАЯ КАМПАНИЯ</span><h3>120 игровых дней до экономической империи</h3><p>Сначала работа и капитал, затем влияние и контроль компаний. Международные активы во всех пяти странах станут следующим большим этапом.</p></div><div className="goal-list">{campaignGoals.map(g=><div className={g.done?"goal-row done":"goal-row"} key={g.id}><span>{g.done?"✓":"○"}</span><div><b>{g.title}</b><small>{g.text}</small></div></div>)}</div></div>
          <div className="profile-stat-grid">
            <div><span>КАПИТАЛ</span><b>{totalWealth.toLocaleString("ru-RU")} VLR</b><small>текущее состояние</small></div>
            <div><span>ДЕНЬ</span><b>{day}</b><small>игровой прогресс</small></div>
            <div><span>СДЕЛОК</span><b>{transactions.length}</b><small>покупки и продажи</small></div>
            <div><span>ПОЗИЦИЙ</span><b>{Object.values(holdings).filter(Boolean).length}</b><small>активы в портфеле</small></div><div><span>ВЛИЯНИЕ</span><b>{countryInfluence}/100</b><small>экономический вес</small></div><div><span>КАРЬЕРА</span><b>Ур. {careerLevel}</b><small>{careerTitle}</small></div>
          </div>
          <div className="profile-records">
            <div><span className="eyebrow">РЕКОРДЫ</span><h3>Личные достижения</h3>
              <div className="profile-record-row"><span>Лучший капитал</span><b>{totalWealth.toLocaleString("ru-RU")} VLR</b></div>
              <div className="profile-record-row"><span>Самая крупная сделка</span><b>{transactions.length?Math.max(...transactions.map(t=>t.price*t.quantity)).toLocaleString("ru-RU")+" VLR":"—"}</b></div>
              <div className="profile-record-row"><span>Максимальная позиция</span><b>{Math.max(0,...Object.values(holdings))} акций</b></div>
              <div className="profile-record-row"><span>Активных компаний</span><b>{Object.values(holdings).filter(Boolean).length} / {country.companies.length}</b></div>
            </div>
            <div className="profile-account-card"><span className="eyebrow">АККАУНТ</span><h3>Смена игрока</h3><p>Выйди из текущего аккаунта, чтобы вернуться на экран входа и выбрать другого игрока. Сохранение текущей игры останется в браузере.</p><button type="button" className="secondary-action" onClick={onLogout}>Выйти и сменить аккаунт</button></div>
          </div>
        </Panel>}
        {tab==="updates"&&<Panel title="Обновления и патчноуты" eyebrow="ИСТОРИЯ РАЗВИТИЯ"><p className="panel-lead">История обновлений MarketArena: новые функции, улучшения и исправления.</p><div className="patch-timeline">{PATCH_NOTES.map(p=><article className="patch-item" key={p.version}><div className="patch-dot"/><div className="patch-card"><div className="patch-head"><div><span>{p.version}</span><h2>{p.title}</h2></div><time>{p.date}</time></div><div className="patch-columns"><div><b>Добавлено</b>{p.added.map(x=><span key={x}>+ {x}</span>)}</div><div><b>Улучшено</b>{p.improved.map(x=><span key={x}>↗ {x}</span>)}</div><div><b>Исправлено</b>{p.fixed.map(x=><span key={x}>✓ {x}</span>)}</div></div></div></article>)}</div></Panel>}
        {tab==="news"&&<Panel title="Новости" eyebrow="ЭКОНОМИЧЕСКИЕ НОВОСТИ"><p className="panel-lead">Новости поступают в живую ленту симуляции: информационные импульсы меняют котировки, а новые сообщения появляются независимо от нажатия «Следующий день».</p><div className="news-filter-bar"><button className={newsFilter==="all"?"active":""} onClick={()=>setNewsFilter("all")}>Все</button><button className={newsFilter==="company"?"active":""} onClick={()=>setNewsFilter("company")}>Компании</button><button className={newsFilter==="commodity"?"active":""} onClick={()=>setNewsFilter("commodity")}>Сырьё</button><button className={newsFilter==="macro"?"active":""} onClick={()=>setNewsFilter("macro")}>Макроэкономика</button><button className={newsFilter==="sector"?"active":""} onClick={()=>setNewsFilter("sector")}>Отрасли</button><button className={newsFilter==="market"?"active":""} onClick={()=>setNewsFilter("market")}>Рынок</button></div><div className="news-list">{country.companies.filter(c=>newsFilter==="all"||newsFilter==="company"||(newsFilter==="sector"&&!!c.sector)||(newsFilter==="commodity"&&["Нефть","Энергетика","Металлы","Агро"].includes(c.sector))).slice(0,10).map((c,i)=>{const e=marketEvent(c,day);return <button className={selectedNews===c.ticker?"news-item active":"news-item"} key={c.ticker} onClick={()=>setSelectedNews(c.ticker)}><span>{String(8+i*2).padStart(2,"0")}:30</span><div><b>{c.name}: {e.headline}</b><p><strong>{e.category}</strong> · импульс <strong className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"+":""}{(e.impact*100).toFixed(2)}%</strong>. Сырьё: {e.commodity.name} ({e.commodity.impact>=0?"+":""}{(e.commodity.impact*100).toFixed(1)}%). Рынок учитывает спрос, риск и цепочку отраслей.</p></div><strong>{c.sector.toUpperCase()}</strong></button>})}</div>{selectedNews&&(()=>{const focus=country.companies.find(c=>c.ticker===selectedNews);if(!focus)return null;const e=marketEvent(focus,day);return <article className="news-detail-card"><div className="news-detail-head"><div><span className="eyebrow">ПОДРОБНЫЙ РЕПОРТАЖ · {focus.ticker}</span><h2>{focus.name}</h2></div><button onClick={()=>setSelectedNews(null)}>Закрыть</button></div><p>{focus.name} {e.headline}. Новости меняют спрос и затраты, сырьё меняет себестоимость, а рынок переводит итог в будущую прибыль и капитализацию.</p><div className="news-detail-grid"><div><span>СЕКТОР</span><b>{focus.sector}</b></div><div><span>НОВОСТЬ</span><b className={e.impact>=0?"gain":"loss"}>{e.impact>=0?"+":""}{(e.impact*100).toFixed(2)}%</b></div><div><span>СЫРЬЁ</span><b>{e.commodity.impact>=0?"+":""}{(e.commodity.impact*100).toFixed(1)}%</b></div><div><span>КОТИРОВКА</span><b>{priceFor(focus).toLocaleString("ru-RU")} VLR</b></div></div></article>})()}<div className="news-transactions"><span className="eyebrow">ИСТОРИЯ СДЕЛОК</span>{transactions.slice(0,6).map((t,i)=><div key={i}><b className={t.type==="BUY"?"loss":"gain"}>{t.type}</b><span>День {t.day} · {t.ticker} · {t.quantity} шт.</span><strong>{(t.price*t.quantity).toLocaleString("ru-RU")} VLR</strong></div>)}{transactions.length===0&&<p>Сделок пока нет. Первая покупка появится здесь сразу после подтверждения.</p>}</div></Panel>}
      </main>
    </div>
    {selectedCompany&&<div className="company-modal-backdrop" onClick={()=>setSelectedCompany(null)}><div className="company-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelectedCompany(null)}>×</button><div className="modal-company-head"><CEOAvatar company={selectedCompany}/><div><span className="ticker">{selectedCompany.ticker}</span><h2>{selectedCompany.name}</h2><p>{selectedCompany.sector} · публичная компания · {country.name}</p></div></div><div className="modal-grid"><div><span className="eyebrow">О КОМПАНИИ</span><p className="company-description">{companyProfile(selectedCompany,country).description}</p><div className="company-metrics">{[["КАПИТАЛИЗАЦИЯ",companyProfile(selectedCompany,country).marketCap],["ВЫРУЧКА",companyProfile(selectedCompany,country).revenue],["ЧИСТАЯ ПРИБЫЛЬ",companyProfile(selectedCompany,country).netProfit],["P / E",companyProfile(selectedCompany,country).pe],["P / B",companyProfile(selectedCompany,country).pb]].map(([label,value])=><div key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="chart-range-tabs">{chartRangeLabels.map(([id,label])=><button key={id} className={chartRange===id?"active":""} onClick={()=>setChartRange(id)}>{label}</button>)}</div><CandleChart company={selectedCompany} candles={candleSeries(selectedCompany,chartRange)} range={chartRange}/><div className="quote-box"><span>ТЕКУЩАЯ КОТИРОВКА</span><b>{priceFor(selectedCompany).toLocaleString("ru-RU")} VLR</b><small className={priceChange(selectedCompany)>=0?"gain":"loss"}>{priceChange(selectedCompany)>=0?"+":""}{priceChange(selectedCompany).toFixed(2)}% за день</small></div><div className="modal-buy"><span>В портфеле: <b>{holdings[selectedCompany.ticker]||0} шт.</b></span><div><button className="secondary-action" onClick={()=>sell(selectedCompany)}>Продать</button><button className="primary small" onClick={()=>buy(selectedCompany,1000)}>Купить 1 000 акций</button>{!ownedCompanies.includes(selectedCompany.ticker)&&<button className="takeover-button" onClick={()=>acquireCompany(selectedCompany)}>Контроль 51% · {takeoverCost(selectedCompany).toLocaleString("ru-RU")} VLR</button>}</div></div></div><div className="ceo-profile"><span className="eyebrow">CEO · ПЕРСОНАЖ</span><h3>{selectedCompany.ceo}</h3><div className="takeover-explainer"><b>ПОГЛОЩЕНИЕ</b><span>Покупка контрольного пакета 51% компании по оценке капитализации с премией 8%. Это не покупка одной акции и не 100% выкуп. Ты покупаешь контрольный пакет 51% по оценке капитализации с премией 8% — компания входит в твою группу, а остальные 49% остаются у других акционеров.</span></div><b>{selectedCompany.ceoAge} лет · {selectedCompany.ceoRole}</b><p>{selectedCompany.ceoBio}</p><p><strong>Стратегия:</strong> {companyProfile(selectedCompany,country).strategy}</p><p><strong>Цели на игровой год:</strong> {companyProfile(selectedCompany,country).goals}</p><div className="company-facts"><span>Основана</span><b>{companyProfile(selectedCompany,country).founded}</b><span>Штат</span><b>{companyProfile(selectedCompany,country).employees}</b><span>Штаб-квартира</span><b>{companyProfile(selectedCompany,country).headquarters}</b><span>Ресурсы</span><b>{companyProfile(selectedCompany,country).materials}</b></div><div className="ceo-tags"><span>Биография</span><span>Репутация</span><span>Стиль управления</span></div></div></div></div></div>}
    {jobGame&&(()=>{const job=jobs.find(x=>x.id===jobGame.jobId);if(!job)return null;return <JobMiniGame jobId={jobGame.jobId as "janitor"|"courier"|"cashier"|"analyst"|"junioranalyst"} title={job.title} basePay={job.pay} professionLevel={jobLevel(jobGame.jobId as JobId,jobXP[jobGame.jobId as JobId]??0)} marketContext={country.companies.map(c=>({ticker:c.ticker,name:c.name,sector:c.sector,price:priceFor(c),change:priceChange(c),news:marketEvent(c,day).headline}))} onComplete={finishJobGame} onCancel={()=>setJobGame(null)}/>})()}

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
  return <GameScreen player={player} country={country} difficulty={difficulty} onLogout={()=>{try{window.localStorage.removeItem("marketarena.screen");}catch{} setScreen("auth");setPlayer("Игрок");}} onRestart={()=>{try{window.localStorage.removeItem(`marketarena.save.v5.${player.toLowerCase().trim().replace(/\\s+/g,"-")}`);window.localStorage.removeItem("marketarena.screen");}catch{} setScreen("mode")}}/>;
}

export default App;
