export type MacroEventType =
  | "banking" | "energy" | "trade" | "recession" | "commodity"
  | "war" | "pandemic" | "climate" | "techBoom" | "foodShock" | "peace";

export type MacroEvent = {
  type: MacroEventType;
  name: string;
  headline: string;
  short: string;
  impact: number;
  sectors: Record<string, number>;
  start: number;
  end: number;
};

const events: Array<Omit<MacroEvent, "start"|"end">> = [
  {type:"banking",name:"Банковский шок",headline:"Кредитный рынок замер: банки ужесточают условия финансирования.",short:"ликвидность сжимается, кредит дорожает",impact:-0.055,sectors:{"Финансы":-0.050,"Недвижимость":-0.028,"Машиностроение":-0.018}},
  {type:"energy",name:"Энергетический кризис",headline:"Скачок цен на энергию повышает себестоимость промышленности.",short:"топливо и энергия резко дорожают",impact:-0.062,sectors:{"Энергетика":0.028,"Нефть":0.018,"Металлы":-0.035,"Ритейл":-0.018,"Логистика":-0.028}},
  {type:"trade",name:"Торговая блокада",headline:"Геополитическое обострение нарушило часть торговых маршрутов.",short:"международная торговля и экспорт проседают",impact:-0.058,sectors:{"Порты":-0.050,"Судоходство":-0.062,"Логистика":-0.040,"Страхование":-0.025}},
  {type:"recession",name:"Мировая рецессия",headline:"Мировой спрос снижается, компании режут инвестиционные планы.",short:"спрос и инвестиции замедляются",impact:-0.072,sectors:{"Финансы":-0.035,"Металлы":-0.045,"Машиностроение":-0.050,"Ритейл":-0.035,"Технологии":-0.028}},
  {type:"commodity",name:"Сырьевой обвал",headline:"Цены на ключевые сырьевые товары резко упали.",short:"сырьевые цены падают быстрее ожиданий",impact:-0.065,sectors:{"Нефть":-0.075,"Металлы":-0.068,"Агро":-0.042,"Логистика":-0.018}},
  {type:"war",name:"Военный конфликт",headline:"Военный конфликт нарушил цепочки поставок и резко поднял премию за риск.",short:"геополитический риск и перебои поставок растут",impact:-0.082,sectors:{"Энергетика":0.018,"Нефть":0.025,"Металлы":0.010,"Судоходство":-0.065,"Порты":-0.052,"Логистика":-0.058,"Финансы":-0.040,"Ритейл":-0.030}},
  {type:"pandemic",name:"Пандемический шок",headline:"Новая эпидемическая волна ограничивает мобильность и меняет структуру спроса.",short:"услуги и мобильность проседают, цифровой спрос растёт",impact:-0.055,sectors:{"Технологии":0.028,"Электроника":0.022,"Ритейл":-0.038,"Судоходство":-0.032,"Порты":-0.025,"Логистика":-0.020}},
  {type:"climate",name:"Климатический шок",headline:"Экстремальная погода нарушила урожай и инфраструктуру нескольких регионов.",short:"продовольствие и логистика становятся дороже",impact:-0.045,sectors:{"Агро":-0.070,"Ритейл":-0.028,"Логистика":-0.030,"Порты":-0.020,"Энергетика":-0.018}},
  {type:"techBoom",name:"Технологический бум",headline:"Новый технологический цикл ускоряет инвестиции в автоматизацию и цифровую инфраструктуру.",short:"инвестиции и производительность ускоряются",impact:0.052,sectors:{"Технологии":0.075,"Электроника":0.060,"Робототехника":0.068,"Машиностроение":0.030,"Финансы":0.018}},
  {type:"foodShock",name:"Продовольственный дефицит",headline:"Сбои поставок продовольствия резко меняют цены и потребительское поведение.",short:"цены на продукты растут, маржа ритейла сжимается",impact:-0.038,sectors:{"Агро":0.042,"Ритейл":-0.052,"Логистика":-0.025}},
  {type:"peace",name:"Разрядка",headline:"Геополитическая напряжённость снижается, торговые маршруты постепенно открываются.",short:"премия за риск снижается, торговля восстанавливается",impact:0.040,sectors:{"Порты":0.045,"Судоходство":0.052,"Логистика":0.040,"Страхование":0.030,"Финансы":0.022}}
];

export function macroEventForDay(day:number): MacroEvent | null {
  if (day < 20) return null;
  const slot = Math.floor((day - 20) / 45);
  const start = 20 + slot * 45;
  if (day > start + 14) return null;
  const base = events[slot % events.length];
  return {...base, start, end:start+14};
}

const commodityMap:Record<string,{name:string;wave:number}> = {
  "Нефть":{name:"нефти",wave:.032},"Металлы":{name:"металлов",wave:.024},
  "Агро":{name:"зерна и продовольствия",wave:.020},"Энергетика":{name:"газа и электроэнергии",wave:.016},
  "Машиностроение":{name:"стали и оборудования",wave:.011},"Логистика":{name:"топлива",wave:.013},
  "Порты":{name:"фрахта",wave:.018},"Судоходство":{name:"фрахта",wave:.022}
};

const links:Record<string,string[]> = {
  "Металлы":["Машиностроение","Логистика"],"Энергетика":["Металлы","Машиностроение","Логистика"],
  "Нефть":["Логистика","Химия","Ритейл"],"Агро":["Ритейл","Логистика","Порты"],
  "Порты":["Судоходство","Логистика","Страхование"],"Судоходство":["Порты","Страхование"],
  "Технологии":["Электроника","Робототехника"],"Электроника":["Робототехника","Машиностроение"],
  "Финансы":["Недвижимость","Машиностроение"],"Ритейл":["Агро","Логистика","Финансы"]
};

export function commoditySignal(sector:string, day:number) {
  const c=commodityMap[sector];
  if(!c) return {name:"ключевых компонентов",impact:Math.sin((day+sector.length)*.083)*.006};
  return {name:c.name,impact:Math.sin((day+sector.length*11)*.071)*c.wave+Math.cos((day+sector.length)*.031)*c.wave*.45};
}

export function companyMarketSignal(company:{ticker:string;sector:string},day:number, countryBias=0, sectorBias=0) {
  const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);
  const eventsLocal=[
    ["новый экспортный контракт улучшил прогноз выручки",.032],
    ["рост стоимости сырья усилил давление на маржу",-.027],
    ["компания объявила расширение мощностей",.021],
    ["слабый спрос заставил рынок пересмотреть прогнозы",-.024],
    ["регулятор одобрил важный отраслевой проект",.017],
    ["перебои поставок увеличили издержки",-.019],
    ["результаты квартала оказались выше ожиданий",.028],
    ["рынок зафиксировал прибыль после сильного роста",-.014]
  ] as const;
  const local=eventsLocal[Math.floor((day+seed)/3)%eventsLocal.length];
  const commodity=commoditySignal(company.sector,day);
  const macro=macroEventForDay(day);
  const linked=links[company.sector]??[];
  const chain=linked.reduce((sum,s,i)=>sum+Math.sin((day+seed+s.length*13)*(.051+i*.004))*.0035,0);
  const cycle=Math.sin((day+seed*.17)*.045)*.012;
  const macroSector=macro?.sectors[company.sector]??0;
  const headline=macro
    ? macro.headline+" Для сектора "+company.sector+" эффект "+(macroSector>=0?"положительный":"негативный")+"."
    : local[0]+"; цены "+commodity.name+" меняются, цепочка "+(linked[0]??"спроса")+" реагирует.";
  return {headline, impact:local[1]+commodity.impact+countryBias+sectorBias+cycle+chain+(macro?.impact??0)*.35+macroSector};
}

export function quarterlyFinancials(company:{ticker:string;sector:string},day:number,countryBias=0,sectorBias=0) {
  const quarter=Math.max(1,Math.floor((day-1)/90)+1);
  const seed=company.ticker.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0);
  const current=companyMarketSignal(company,Math.max(1,quarter*90-1),countryBias,sectorBias);
  const previous=companyMarketSignal(company,Math.max(1,(quarter-1)*90-1),countryBias,sectorBias);
  const commodity=commoditySignal(company.sector,Math.max(1,quarter*90-1));
  const revenue=Math.max(.4,(4.8+(seed%120)/10)*(1+current.impact*1.9));
  const profit=Math.max(.05,(.42+(seed%38)/20)*(1+current.impact*4+commodity.impact*2));
  const prevRevenue=Math.max(.4,(4.8+(seed%120)/10)*(1+previous.impact*1.9));
  const prevProfit=Math.max(.05,(.42+(seed%38)/20)*(1+previous.impact*4+commodity.impact*1.3));
  return {
    quarter,revenue,profit,
    revenueGrowth:(revenue/prevRevenue-1)*100,
    profitGrowth:(profit/prevProfit-1)*100,
    event:current,commodity,
    outlook:current.impact>=0?"Прогноз повышен":"Прогноз снижен"
  };
}
