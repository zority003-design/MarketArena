import { GAME_CONFIG } from "./economy";

export type MacroEventType =
  | "banking" | "energy" | "trade" | "recession" | "commodity"
  | "war" | "pandemic" | "climate" | "techBoom" | "foodShock" | "peace"
  | "rateHike" | "reconstruction";

export type MacroEvent = {
  type: MacroEventType;
  name: string;
  headline: string;
  short: string;
  impact: number;
  sectors: Record<string, number>;
  start: number;
  end: number;
  severity: "умеренное" | "сильное" | "экстремальное";
};

export type EconomicSnapshot = {
  gdpGrowth: number;
  inflation: number;
  policyRate: number;
  unemployment: number;
  wageIndex: number;
  consumerDemand: number;
  industrialDemand: number;
  commodityIndex: number;
  riskPremium: number;
};

export type CompanyEconomicProfile = {
  tier: "micro" | "small" | "medium" | "large" | "mega";
  marketCap: number;
  shares: number;
  basePrice: number;
  quality: number;
  growth: number;
  margin: number;
  leverage: number;
  beta: number;
};

const EVENT_POOL: Array<Omit<MacroEvent, "start" | "end">> = [
  {type:"banking",name:"Банковский шок",headline:"Кредитный рынок сжимается: банки повышают требования к заёмщикам, а стоимость капитала растёт.",short:"кредит дорожает, инвестиции и недвижимость слабее",impact:-.038,severity:"сильное",sectors:{"Финансы":-.075,"Недвижимость":-.050,"Машиностроение":-.028,"Ритейл":-.018,"Технологии":-.012}},
  {type:"energy",name:"Энергетический кризис",headline:"Сбой поставок энергии поднимает стоимость топлива и электроэнергии по всей экономике.",short:"энергия дорожает, промышленная маржа сжимается",impact:-.042,severity:"сильное",sectors:{"Энергетика":.032,"Нефть":.024,"Металлы":-.046,"Машиностроение":-.035,"Логистика":-.030,"Ритейл":-.020}},
  {type:"trade",name:"Торговая блокада",headline:"Часть торговых маршрутов закрыта: экспорт, импорт и сроки поставок становятся менее предсказуемыми.",short:"торговые потоки и логистика нарушены",impact:-.040,severity:"сильное",sectors:{"Порты":-.058,"Судоходство":-.068,"Логистика":-.045,"Страхование":-.022,"Ритейл":-.020,"Металлы":-.016}},
  {type:"recession",name:"Мировая рецессия",headline:"Слабый мировой спрос заставляет компании откладывать инвестиции и сокращать запасы.",short:"спрос и инвестиции замедляются",impact:-.052,severity:"экстремальное",sectors:{"Финансы":-.035,"Металлы":-.055,"Машиностроение":-.060,"Ритейл":-.040,"Технологии":-.025,"Логистика":-.030}},
  {type:"commodity",name:"Сырьевой обвал",headline:"Цены на сырьё резко снизились. Производителям ресурсов хуже, потребителям сырья — легче.",short:"сырьё дешевеет, выигрыш получают потребители",impact:-.030,severity:"сильное",sectors:{"Нефть":-.075,"Металлы":-.070,"Агро":-.040,"Химия":.026,"Машиностроение":.018,"Логистика":.012}},
  {type:"war",name:"Военный конфликт",headline:"Новый конфликт резко увеличивает премию за риск и ломает отдельные цепочки поставок.",short:"риск, сырьё и логистика расходятся в разные стороны",impact:-.062,severity:"экстремальное",sectors:{"Энергетика":.020,"Нефть":.038,"Металлы":.015,"Судоходство":-.075,"Порты":-.058,"Логистика":-.062,"Финансы":-.045,"Ритейл":-.030,"Страхование":-.040}},
  {type:"pandemic",name:"Пандемический шок",headline:"Эпидемическая волна ограничивает мобильность и меняет структуру потребительского спроса.",short:"мобильность слабее, цифровой спрос выше",impact:-.034,severity:"сильное",sectors:{"Технологии":.040,"Электроника":.032,"Биотех":.060,"Ритейл":-.035,"Судоходство":-.035,"Порты":-.025,"Логистика":-.018}},
  {type:"climate",name:"Климатический шок",headline:"Экстремальная погода ухудшает урожай и нарушает работу инфраструктуры.",short:"еда и логистика дорожают",impact:-.030,severity:"сильное",sectors:{"Агро":-.072,"Ритейл":-.034,"Логистика":-.032,"Порты":-.018,"Энергетика":-.020}},
  {type:"techBoom",name:"Технологический бум",headline:"Новый цикл инвестиций ускоряет автоматизацию, облачную инфраструктуру и спрос на электронику.",short:"инвестиции в технологии и производительность растут",impact:.044,severity:"сильное",sectors:{"Технологии":.075,"Электроника":.068,"Робототехника":.070,"Машиностроение":.035,"Финансы":.018}},
  {type:"foodShock",name:"Продовольственный дефицит",headline:"Неурожай и перебои поставок поднимают цены на продукты и меняют потребительскую корзину.",short:"агро выигрывает от цен, ритейл теряет маржу",impact:-.028,severity:"сильное",sectors:{"Агро":.055,"Ритейл":-.058,"Логистика":-.026,"Химия":-.014}},
  {type:"peace",name:"Разрядка",headline:"Геополитическая напряжённость снижается, торговые маршруты постепенно открываются.",short:"премия за риск снижается, торговля восстанавливается",impact:.032,severity:"умеренное",sectors:{"Порты":.052,"Судоходство":.060,"Логистика":.045,"Страхование":.032,"Финансы":.024,"Ритейл":.018}},
  {type:"rateHike",name:"Жёсткая денежная политика",headline:"Инфляция вынуждает центральные банки дольше держать высокие ставки.",short:"ставки выше, кредит и оценки компаний под давлением",impact:-.034,severity:"сильное",sectors:{"Финансы":.012,"Недвижимость":-.060,"Машиностроение":-.032,"Ритейл":-.025,"Технологии":-.030}},
  {type:"reconstruction",name:"Инвестиционный цикл",headline:"После периода слабого спроса начинается восстановление инвестиций в инфраструктуру и производство.",short:"капвложения и промышленный спрос растут",impact:.038,severity:"умеренное",sectors:{"Машиностроение":.065,"Металлы":.048,"Энергетика":.032,"Логистика":.030,"Строительство":.045,"Финансы":.020}}
];

const countryFactors: Record<string,{gdp:number;inflation:number;rate:number;wage:number;demand:number;risk:number}> = {
  slavoriya:{gdp:.022,inflation:.018,rate:.028,wage:1.00,demand:1.04,risk:.008},
  lirania:{gdp:.028,inflation:.016,rate:.026,wage:1.05,demand:1.01,risk:.012},
  darvast:{gdp:.018,inflation:.024,rate:.031,wage:.96,demand:.98,risk:.018},
  estraviya:{gdp:.034,inflation:.013,rate:.022,wage:1.12,demand:1.06,risk:.006},
  saverniya:{gdp:.025,inflation:.020,rate:.027,wage:.94,demand:1.08,risk:.010}
};

const sectorQuality: Record<string,{growth:number;margin:number;leverage:number;beta:number}> = {
  "Нефть":{growth:.030,margin:.24,leverage:.34,beta:1.18},"Металлы":{growth:.022,margin:.15,leverage:.42,beta:1.12},
  "Энергетика":{growth:.018,margin:.18,leverage:.50,beta:.82},"Финансы":{growth:.035,margin:.22,leverage:.62,beta:1.05},
  "Машиностроение":{growth:.040,margin:.12,leverage:.46,beta:1.18},"Логистика":{growth:.032,margin:.10,leverage:.48,beta:1.12},
  "Порты":{growth:.029,margin:.20,leverage:.44,beta:1.02},"Судоходство":{growth:.035,margin:.22,leverage:.52,beta:1.35},
  "Страхование":{growth:.027,margin:.16,leverage:.38,beta:.88},"Технологии":{growth:.065,margin:.19,leverage:.24,beta:1.28},
  "Электроника":{growth:.058,margin:.16,leverage:.30,beta:1.32},"Робототехника":{growth:.062,margin:.14,leverage:.34,beta:1.38},
  "Биотех":{growth:.055,margin:.12,leverage:.28,beta:1.40},"Агро":{growth:.026,margin:.11,leverage:.45,beta:.98},
  "Ритейл":{growth:.024,margin:.07,leverage:.40,beta:.86},"Недвижимость":{growth:.028,margin:.20,leverage:.70,beta:1.10},
  "Химия":{growth:.031,margin:.14,leverage:.44,beta:1.08},"Промышленность":{growth:.020,margin:.10,leverage:.50,beta:1.00},"Строительство":{growth:.030,margin:.09,leverage:.58,beta:1.16}
};

const links:Record<string,string[]> = {
  "Металлы":["Машиностроение","Логистика"],"Энергетика":["Металлы","Машиностроение","Логистика"],
  "Нефть":["Логистика","Химия","Ритейл"],"Агро":["Ритейл","Логистика","Порты"],
  "Порты":["Судоходство","Логистика","Страхование"],"Судоходство":["Порты","Страхование"],
  "Технологии":["Электроника","Робототехника"],"Электроника":["Робототехника","Машиностроение"],
  "Финансы":["Недвижимость","Машиностроение"],"Ритейл":["Агро","Логистика","Финансы"],
  "Недвижимость":["Финансы","Машиностроение","Энергетика"],"Химия":["Нефть","Агро","Электроника"]
};

const hash=(text:string)=>text.split("").reduce((n,ch)=>((n*31)+ch.charCodeAt(0))%1000003,17);
const noise=(seed:number,day:number)=>{const x=Math.sin(seed*12.9898+day*78.233)*43758.5453;return x-Math.floor(x);};

export function macroEventForDay(day:number): MacroEvent | null {
  if(day<18)return null;
  const slot=Math.floor((day-18)/42);
  const start=18+slot*42;
  const base=EVENT_POOL[(hash(String(slot*97+31)) + slot*7) % EVENT_POOL.length];
  const duration=base.type==="recession"||base.type==="war"?18:base.type==="peace"?12:14;
  if(day>start+duration)return null;
  const severity=base.severity;
  return {...base,start,end:start+duration};
}

export function economicSnapshot(day:number,countryId:string):EconomicSnapshot {
  const c=countryFactors[countryId]??countryFactors.slavoriya;
  const macro=macroEventForDay(day);
  const wave=Math.sin((day+hash(countryId)*.001)*.045)*.009;
  const commodity=Math.sin((day+hash(countryId)*.002)*.037)*.065+Math.cos(day*.019)*.025;
  const inflation=c.inflation+wave*.45+(macro?.type==="energy"||macro?.type==="foodShock"?0.009:0)+(macro?.type==="recession"?-.004:0);
  const rate=c.rate+Math.max(0,inflation-c.inflation)*.8+(macro?.type==="rateHike"?0.012:0);
  const demand=c.demand+Math.sin(day*.031+hash(countryId)*.0007)*.025+(macro?.sectors["Ритейл"]??0)*.5;
  const wage=c.wage*(1+day*.00055+Math.sin(day*.021+hash(countryId))*0.012);
  const unemployment=Math.max(.025,Math.min(.13,.055-(demand-1)*.12+(macro?.impact??0)*-.20));
  return {
    gdpGrowth:c.gdp+wave+(macro?.impact??0)*.25,
    inflation,policyRate:rate,unemployment,wageIndex:wage,
    consumerDemand:demand,industrialDemand:c.demand+wave*1.2+(macro?.sectors["Машиностроение"]??0)*.35,
    commodityIndex:1+commodity+(macro?.type==="commodity"?-.14:0),
    riskPremium:Math.max(0,c.risk+(macro?.impact??0)*-.35)
  };
}

export function companyEconomicProfile(company:{ticker:string;sector:string},countryId="slavoriya"):CompanyEconomicProfile {
  const seed=hash(company.ticker);
  const q=sectorQuality[company.sector]??{growth:.025,margin:.12,leverage:.45,beta:1};
  const tierRoll=seed%100;
  const tier=tierRoll<12?"micro":tierRoll<34?"small":tierRoll<72?"medium":tierRoll<91?"large":"mega";
  const ranges=GAME_CONFIG.companyMarketCaps[tier];
  const marketCap=Math.round((ranges.min+(seed%10001)/10000*(ranges.max-ranges.min))/100)*100;
  const shares=ranges.shares;
  const country=countryFactors[countryId]??countryFactors.slavoriya;
  const quality=Math.max(.35,Math.min(1.45,.72+(seed%41)/100+country.gdp*.8));
  return {
    tier,marketCap,shares,basePrice:marketCap/shares,
    quality,growth:q.growth+(quality-.8)*.018,margin:q.margin+(quality-.8)*.04,
    leverage:Math.max(.12,q.leverage-(quality-.8)*.12),beta:q.beta
  };
}

export function companyMarketSignal(
  company:{ticker:string;sector:string},
  day:number,
  countryBias=0,
  sectorBias=0,
  countryId="slavoriya"
) {
  const seed=hash(company.ticker);
  const profile=companyEconomicProfile(company,countryId);
  const q=sectorQuality[company.sector]??{growth:.025,margin:.12,leverage:.45,beta:1};
  const macro=macroEventForDay(day);
  const economy=economicSnapshot(day,countryId);
  const commodity=commoditySignal(company.sector,day);
  const linked=links[company.sector]??[];
  const localPool=[
    ["получила новый контракт и улучшила прогноз загрузки",.018],
    ["сообщила о росте себестоимости и давлении на маржу",-.016],
    ["объявила расширение мощностей и капитальных затрат",.014],
    ["пересмотрела прогноз спроса после слабых заказов",-.014],
    ["получила регуляторное одобрение нового проекта",.012],
    ["сократила издержки и повысила операционную эффективность",.016],
    ["показала результаты лучше ожиданий аналитиков",.024],
    ["рынок зафиксировал прибыль после сильного движения",-.010]
  ] as const;
  const local=localPool[(Math.floor(day/3)+seed)%localPool.length];
  const demandSignal=(economy.consumerDemand-1)*.20+(economy.industrialDemand-1)*.24;
  const valuationPressure=Math.sin((day+seed)*.023)*.006;
  const companyCycle=Math.sin((day+seed*.17)*.047)*.009;
  const chain=linked.reduce((sum,s,i)=>sum+Math.sin((day+seed+s.length*13)*(.043+i*.005))*.0025,0);
  const macroSector=macro?.sectors[company.sector]??0;
  const risk=-economy.riskPremium*profile.beta*.18;
  const headline=macro
    ? macro.headline+" Сектор «"+company.sector+"»: "+(macroSector>=0?"эффект положительный.":"эффект негативный.")
    : company.sector+" "+local[0]+". Цены "+commodity.name+" и спрос передают импульс по цепочке.";
  const impact=local[1]+commodity.impact+countryBias+sectorBias+q.growth*.08+demandSignal+valuationPressure+companyCycle+chain+(macro?.impact??0)*.28+macroSector+risk;
  return {
    headline,
    impact:Math.max(-.12,Math.min(.12,impact)),
    category:macro?"Макроэкономика":"Компания",
    duration:macro?macro.end-day:1,
    commodity,
    economy,
    macro,
    companyTier:profile.tier
  };
}

export function commoditySignal(sector:string,day:number) {
  const map:Record<string,{name:string;wave:number}> = {
    "Нефть":{name:"нефти",wave:.035},"Металлы":{name:"металлов",wave:.028},"Агро":{name:"зерна и продовольствия",wave:.024},
    "Энергетика":{name:"газа и электроэнергии",wave:.019},"Машиностроение":{name:"стали и оборудования",wave:.013},
    "Логистика":{name:"топлива",wave:.016},"Порты":{name:"фрахта",wave:.022},"Судоходство":{name:"фрахта",wave:.026},
    "Химия":{name:"нефти и сырья",wave:.018},"Электроника":{name:"микросхем",wave:.020}
  };
  const c=map[sector];
  const seed=hash(sector);
  if(!c)return {name:"ключевых компонентов",impact:Math.sin((day+seed)*.061)*.007};
  const shock=sector==="Нефть"||sector==="Металлы"||sector==="Агро"
    ? Math.sin((day+seed)*.041)*c.wave+Math.cos((day+seed)*.017)*c.wave*.45
    : Math.sin((day+seed)*.049)*c.wave;
  return {name:c.name,impact:shock};
}

export function quarterlyFinancials(company:{ticker:string;sector:string},day:number,countryBias=0,sectorBias=0,countryId="slavoriya") {
  const quarter=Math.max(1,Math.floor((day-1)/90)+1);
  const profile=companyEconomicProfile(company,countryId);
  const endDay=Math.max(1,quarter*90-1);
  const current=companyMarketSignal(company,endDay,countryBias,sectorBias,countryId);
  const previous=companyMarketSignal(company,Math.max(1,endDay-90),countryBias,sectorBias,countryId);
  const baseRevenue=profile.marketCap*(.30+profile.margin*.45);
  const revenue=Math.max(baseRevenue*.42,baseRevenue*(1+profile.growth*quarter+current.impact*1.6));
  const profit=Math.max(revenue*.025,revenue*(profile.margin+current.impact*.32));
  const prevRevenue=Math.max(baseRevenue*.42,baseRevenue*(1+profile.growth*Math.max(1,quarter-1)+previous.impact*1.6));
  const prevProfit=Math.max(prevRevenue*.025,prevRevenue*(profile.margin+previous.impact*.32));
  const expectedRevenue=prevRevenue*(1+profile.growth);
  const expectedProfit=prevProfit*(1+profile.growth*1.2);
  const revenueSurprise=revenue/Math.max(1,expectedRevenue)-1;
  const profitSurprise=profit/Math.max(1,expectedProfit)-1;
  const outlookScore=revenueSurprise*.55+profitSurprise*.45;
  return {
    quarter,revenue,profit,revenueGrowth:(revenue/prevRevenue-1)*100,profitGrowth:(profit/prevProfit-1)*100,
    expectedRevenue,expectedProfit,revenueSurprise,profitSurprise,
    event:current,commodity:current.commodity,
    outlook:outlookScore>=.025?"Прогноз повышен":outlookScore<=-.025?"Прогноз снижен":"Прогноз без изменений"
  };
}

export function marketPriceAtDay(
  company:{ticker:string;sector:string},
  day:number,
  countryId="slavoriya",
  countryBias=0,
  sectorBias=0
) {
  const profile=companyEconomicProfile(company,countryId);
  const d=Math.max(1,day);
  const seed=hash(company.ticker);
  const country=countryFactors[countryId]??countryFactors.slavoriya;
  const longTrend=(profile.growth+country.gdp*.45)*(d/365)*.65;
  const valuationCycle=Math.sin((d+seed)*.021)*.08+Math.cos((d+seed)*.009)*.045;
  const companyCycle=Math.sin((d+seed*.17)*.047)*.065;
  const noise=Math.sin(seed*0.017+d*1.73)*.018+Math.cos(seed*.031+d*.47)*.012;
  const economy=economicSnapshot(d,countryId);
  const macro=macroEventForDay(d);
  const signal=companyMarketSignal(company,d,countryBias,sectorBias,countryId).impact;
  const riskDrag=economy.riskPremium*profile.beta*.75;
  const regime=(economy.consumerDemand-1)*.75+(economy.industrialDemand-1)*.70+(economy.commodityIndex-1)*.25;
  const eventPulse=(macro?.impact??0)*.65+(macro?.sectors[company.sector]??0)*.95;
  const logReturn=longTrend+valuationCycle+companyCycle+noise+regime*.55+signal*.22+eventPulse-riskDrag;
  return Math.max(.10,Math.round(profile.basePrice*Math.exp(logReturn)*100)/100);
}

export function wageIndexAtDay(day:number,countryId="slavoriya",sector?:string) {
  const economy=economicSnapshot(day,countryId);
  const sectorPremium=sector==="Технологии"||sector==="Биотех"||sector==="Финансы"?1.10:sector==="Логистика"||sector==="Машиностроение"?1.04:1;
  return economy.wageIndex*sectorPremium*(1-economy.unemployment*.65);
}

export function explainMarketMove(company:{ticker:string;sector:string},day:number,countryId="slavoriya",countryBias=0,sectorBias=0) {
  const e=companyMarketSignal(company,day,countryBias,sectorBias,countryId);
  const parts=[
    {label:"Новости",value:e.macro?e.macro.impact:e.impact*.32},
    {label:"Сырьё",value:e.commodity.impact},
    {label:"Спрос",value:(e.economy.consumerDemand-1)*.18+(e.economy.industrialDemand-1)*.20},
    {label:"Ставки и риск",value:-e.economy.riskPremium*.18},
    {label:"Отрасль",value:(e.impact-e.commodity.impact-(e.macro?.impact??0)*.28)*.28}
  ];
  return {headline:e.headline,parts,category:e.category,commodity:e.commodity,economy:e.economy,macro:e.macro};
}
