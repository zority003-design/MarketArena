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
};

export const countries: Country[] = [
  {
    id: "velmira",
    name: "Вельмира",
    capital: "Астэр",
    currency: "вельмирский динар",
    currencySymbol: "V₫",
    exchange: "Астэрская биржа",
    flag: "VM",
    economy: "Технологии • Финансы • Машиностроение",
    population: "86,4 млн",
    color: "#65d8ff",
    mapPath: "M84 135 C118 105 157 94 193 111 C218 123 229 150 216 174 C201 201 164 214 126 204 C95 196 68 166 84 135 Z"
  },
  {
    id: "norvessa",
    name: "Норвесса",
    capital: "Рейнхольм",
    currency: "норвесский сол",
    currencySymbol: "NS",
    exchange: "Рейнская биржа",
    flag: "NV",
    economy: "Энергетика • Логистика • Металлургия",
    population: "61,8 млн",
    color: "#9b8cff",
    mapPath: "M232 103 C269 78 315 82 343 108 C364 127 367 157 349 178 C327 202 286 209 251 194 C221 181 207 137 232 103 Z"
  },
  {
    id: "ardel",
    name: "Ардель",
    capital: "Меридион",
    currency: "ардельский лир",
    currencySymbol: "₳",
    exchange: "Меридионская биржа",
    flag: "AR",
    economy: "Фармацевтика • Биотех • Химия",
    population: "48,2 млн",
    color: "#61e7bd",
    mapPath: "M155 215 C184 196 225 198 251 220 C277 242 277 273 257 295 C235 318 195 321 164 306 C133 291 124 237 155 215 Z"
  },
  {
    id: "solven",
    name: "Сольвен",
    capital: "Кассар",
    currency: "сольвенский кроун",
    currencySymbol: "SK",
    exchange: "Кассарская биржа",
    flag: "SV",
    economy: "Потребительский сектор • Туризм • Агро",
    population: "37,6 млн",
    color: "#ffc66d",
    mapPath: "M45 224 C72 201 112 204 134 229 C154 252 148 285 125 302 C99 320 61 313 42 289 C24 266 22 242 45 224 Z"
  },
  {
    id: "tavren",
    name: "Таврен",
    capital: "Варис",
    currency: "тавренская марка",
    currencySymbol: "TM",
    exchange: "Варисская биржа",
    flag: "TV",
    economy: "Добыча • Автомобили • Оборона",
    population: "72,1 млн",
    color: "#ff7f9f",
    mapPath: "M281 221 C315 195 356 199 380 226 C403 252 397 286 370 306 C342 327 301 319 278 294 C256 270 254 241 281 221 Z"
  }
];

export const worldStats = {
  totalCountries: countries.length,
  publicCompanies: countries.length * 12,
  exchanges: countries.length,
  currencies: countries.length,
  sectors: 14,
};
