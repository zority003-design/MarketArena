export type CompanyPreview = {
  name: string;
  ticker: string;
  sector: string;
  note: string;
};

export type Country = {
  id: string;
  name: string;
  capital: string;
  currency: string;
  currencySymbol: string;
  exchange: string;
  economy: string;
  population: string;
  color: string;
  description: string;
  region: string;
  companies: CompanyPreview[];
  mapPath: string;
  capitalX: number;
  capitalY: number;
};

export const countries: Country[] = [
  {
    id: "slovenia",
    name: "Словения",
    capital: "Любляна",
    currency: "евро",
    currencySymbol: "EUR",
    exchange: "Люблянский рынок капитала",
    economy: "Промышленность • Фармацевтика • Логистика",
    population: "2,1 млн",
    color: "#2d6da3",
    region: "Центральная Европа",
    description: "Небольшая открытая экономика между Альпами и Адриатикой. Сильны промышленность, фармацевтика, экспорт и транспортные связи.",
    companies: [
      { name: "Alpina Motors", ticker: "ALM", sector: "Промышленность", note: "компоненты и инженерные системы" },
      { name: "Sava Medica", ticker: "SMD", sector: "Фармацевтика", note: "лекарственные препараты" },
      { name: "Adria Freight", ticker: "ADF", sector: "Логистика", note: "складские и портовые перевозки" },
      { name: "Triglav Systems", ticker: "TRS", sector: "Технологии", note: "промышленная автоматизация" }
    ],
    mapPath: "M236 178 L250 168 L267 173 L274 188 L267 204 L252 211 L239 201 L230 188 Z",
    capitalX: 252,
    capitalY: 190
  },
  {
    id: "slavoriya",
    name: "Славория",
    capital: "Велиград",
    currency: "сольд",
    currencySymbol: "SLD",
    exchange: "Велиградская биржа",
    economy: "Промышленность • Энергетика • Финансы",
    population: "48,7 млн",
    color: "#527f9e",
    region: "Центральный материк",
    description: "Крупная индустриальная экономика с развитой энергетикой, машиностроением и большим внутренним рынком.",
    companies: [
      { name: "Slavor Steel", ticker: "SVS", sector: "Металлы", note: "сталь и промышленный прокат" },
      { name: "NordPower", ticker: "NDP", sector: "Энергетика", note: "электроэнергия и сети" },
      { name: "Veligrad Bank", ticker: "VLB", sector: "Финансы", note: "банковские и инвестиционные услуги" },
      { name: "Krona Machinery", ticker: "KRM", sector: "Машиностроение", note: "оборудование для заводов" }
    ],
    mapPath: "M150 138 L184 119 L220 126 L238 151 L230 181 L210 204 L181 211 L154 197 L136 173 Z",
    capitalX: 196,
    capitalY: 166
  },
  {
    id: "lirania",
    name: "Лирания",
    capital: "Элион",
    currency: "лирон",
    currencySymbol: "LRN",
    exchange: "Лиранская фондовая биржа",
    economy: "Финансы • Судоходство • Страхование",
    population: "31,2 млн",
    color: "#657f9f",
    region: "Западное побережье",
    description: "Морская финансовая экономика с крупными портами, страхованием и международными перевозками.",
    companies: [
      { name: "Elion Maritime", ticker: "ELM", sector: "Судоходство", note: "контейнерные перевозки" },
      { name: "Lira Insurance", ticker: "LIS", sector: "Страхование", note: "корпоративное страхование" },
      { name: "Westline Bank", ticker: "WLB", sector: "Финансы", note: "кредитование и управление активами" },
      { name: "Blueport Terminals", ticker: "BPT", sector: "Порты", note: "терминалы и складская инфраструктура" }
    ],
    mapPath: "M65 113 L92 91 L126 88 L151 105 L157 132 L143 151 L112 158 L83 148 L61 132 Z",
    capitalX: 111,
    capitalY: 123
  },
  {
    id: "darvast",
    name: "Дарваст",
    capital: "Кадар",
    currency: "дарст",
    currencySymbol: "DVT",
    exchange: "Дарвастская биржа",
    economy: "Нефть • Металлы • Тяжёлая промышленность",
    population: "56,4 млн",
    color: "#9a6d52",
    region: "Восточные ресурсы",
    description: "Сырьевая держава с нефтяными месторождениями, металлургией и экспортными железнодорожными коридорами.",
    companies: [
      { name: "Darvast Oil", ticker: "DOL", sector: "Нефть", note: "добыча и переработка" },
      { name: "Kadar Metals", ticker: "KMT", sector: "Металлы", note: "медь и сталь" },
      { name: "EastRail Cargo", ticker: "ERC", sector: "Логистика", note: "железнодорожные перевозки" },
      { name: "DVT Energy", ticker: "DVE", sector: "Энергетика", note: "газовые электростанции" }
    ],
    mapPath: "M286 93 L321 72 L362 77 L391 98 L405 126 L394 157 L368 176 L330 171 L302 151 L280 120 Z",
    capitalX: 346,
    capitalY: 116
  },
  {
    id: "estraviya",
    name: "Эстравия",
    capital: "Селена",
    currency: "эстель",
    currencySymbol: "EST",
    exchange: "Эстравийская биржа",
    economy: "Технологии • Биотех • Электроника",
    population: "27,9 млн",
    color: "#4e8178",
    region: "Южное побережье",
    description: "Технологический кластер с университетами, биотехнологиями и производством электроники.",
    companies: [
      { name: "Selena Devices", ticker: "SLD", sector: "Электроника", note: "сенсоры и микросистемы" },
      { name: "Estra Bio", ticker: "ESB", sector: "Биотех", note: "лабораторные разработки" },
      { name: "Vector Cloud", ticker: "VCL", sector: "Технологии", note: "облачная инфраструктура" },
      { name: "Esteron Robotics", ticker: "ESR", sector: "Робототехника", note: "промышленные роботы" }
    ],
    mapPath: "M188 246 L214 226 L249 228 L273 247 L278 278 L263 304 L235 315 L204 304 L184 281 Z",
    capitalX: 231,
    capitalY: 265
  },
  {
    id: "saverniya",
    name: "Саверния",
    capital: "Ривен",
    currency: "савер",
    currencySymbol: "SVR",
    exchange: "Ривенская биржа",
    economy: "Агро • Логистика • Потребительский сектор",
    population: "39,6 млн",
    color: "#718b62",
    region: "Юго-восточные равнины",
    description: "Агропромышленная и логистическая экономика с речными портами и большим внутренним потребительским рынком.",
    companies: [
      { name: "Riven Foods", ticker: "RVF", sector: "Агро", note: "продукты и переработка" },
      { name: "Savera Logistics", ticker: "SVL", sector: "Логистика", note: "сухопутные перевозки" },
      { name: "GreenField Retail", ticker: "GFR", sector: "Ритейл", note: "розничные сети" },
      { name: "Delta Grain", ticker: "DGR", sector: "Агро", note: "зерно и экспорт" }
    ],
    mapPath: "M278 192 L309 176 L345 183 L371 205 L377 239 L361 265 L331 276 L300 264 L278 238 Z",
    capitalX: 328,
    capitalY: 222
  }
];

export const worldStats = {
  totalCountries: countries.length,
  publicCompanies: 60,
  exchanges: countries.length,
  currencies: countries.length,
  sectors: 15
};

export const difficultyLevels = [
  {
    id: "easy",
    name: "Старт",
    money: "₽ 500 000",
    description: "Большой запас прочности. Подходит, чтобы спокойно изучить работу, расходы и первые сделки.",
    rules: "Низкие расходы • мягкая волатильность • подсказки включены"
  },
  {
    id: "normal",
    name: "Инвестор",
    money: "₽ 250 000",
    description: "Сбалансированный режим: капитал уже есть, но ошибки в стратегии ощущаются.",
    rules: "Средние расходы • обычная волатильность • подсказки по ключевым событиям"
  },
  {
    id: "hard",
    name: "Профессионал",
    money: "₽ 100 000",
    description: "Минимальная подушка. Придётся совмещать карьеру, накопления и рынок.",
    rules: "Высокий риск • строгий бюджет • минимум подсказок"
  }
] as const;
