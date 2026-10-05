export type Country = {
  id: string;
  name: string;
  capital: string;
  currency: string;
  currencySymbol: string;
  exchange: string;
  flag: string;
  economy: string;
  population: string;
  color: string;
  mapPath: string;
  description: string;
};

export const countries: Country[] = [
  {
    id: "slavoriya",
    name: "Славория",
    capital: "Велиград",
    currency: "сольд",
    currencySymbol: "SLD",
    exchange: "Велиградская биржа",
    flag: "SL",
    economy: "Промышленность • Энергетика • Финансы",
    population: "48,7 млн",
    color: "#4f8fbd",
    mapPath: "M118 188 C145 158 188 143 229 151 C258 157 278 176 296 197 L285 238 C268 262 237 275 203 274 L157 259 C132 245 111 218 118 188 Z",
    description: "Крупнейшая индустриальная экономика материка. Сильный внутренний рынок, развитая энергетика и центральное положение между восточными и западными торговыми путями."
  },
  {
    id: "liraniya",
    name: "Лирания",
    capital: "Элион",
    currency: "лирон",
    currencySymbol: "LRN",
    exchange: "Лиранская фондовая биржа",
    flag: "LR",
    economy: "Финансы • Судоходство • Страхование",
    population: "31,2 млн",
    color: "#7187a6",
    mapPath: "M65 116 C90 91 125 78 161 86 L191 109 L183 143 L158 165 L119 168 L88 151 L65 137 Z",
    description: "Западный финансовый центр с крупными портами и развитым страховым рынком. Лирания особенно важна для международного капитала."
  },
  {
    id: "darvast",
    name: "Дарваст",
    capital: "Кадар",
    currency: "дарст",
    currencySymbol: "DVT",
    exchange: "Дарвастская биржа",
    flag: "DV",
    economy: "Нефть • Металлы • Тяжёлая промышленность",
    population: "56,4 млн",
    color: "#a87358",
    mapPath: "M294 93 C333 66 379 67 416 86 L447 119 L438 169 L420 205 L383 218 L344 201 L312 172 L286 133 Z",
    description: "Горная сырьевая держава. Экспорт нефти и металлов связывает её с промышленностью Славории и портами Лирании."
  },
  {
    id: "estraviya",
    name: "Эстравия",
    capital: "Селена",
    currency: "эстель",
    currencySymbol: "EST",
    exchange: "Эстравийская биржа",
    flag: "ES",
    economy: "Технологии • Биотех • Электроника",
    population: "27,9 млн",
    color: "#527d78",
    mapPath: "M214 284 C245 268 280 267 310 281 L331 314 L319 350 L287 371 L248 367 L214 345 L198 315 Z",
    description: "Молодая технологическая экономика южного побережья. Быстро растущие компании, университеты и экспорт электроники."
  },
  {
    id: "saverniya",
    name: "Саверния",
    capital: "Ривен",
    currency: "савер",
    currencySymbol: "SVR",
    exchange: "Ривенская биржа",
    flag: "SV",
    economy: "Агро • Логистика • Потребительский сектор",
    population: "39,6 млн",
    color: "#718f67",
    mapPath: "M329 226 C359 210 397 213 426 231 L455 262 L449 307 L421 338 L382 346 L348 327 L325 292 Z",
    description: "Зелёная торговая страна с плодородными равнинами, крупными речными портами и сильным агропромышленным сектором."
  }
];

export const worldStats = {
  totalCountries: countries.length,
  publicCompanies: countries.length * 12,
  exchanges: countries.length,
  currencies: countries.length,
  sectors: 15,
};
