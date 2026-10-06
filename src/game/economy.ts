// MarketArena core economy configuration — v1.0
// This module intentionally contains no React/UI code.
// It is the single source of truth for the first playable balance pass.

export type StartingClassId = "low" | "middle" | "high";

export type StartingClass = {
  id: StartingClassId;
  name: string;
  startingCash: number;
  dailySalary: number;
  dailyBaseLiving: number;
  creditLimit: number;
  careerMultiplier: number;
  reputationStart: number;
  influenceStart: number;
};

export const GAME_CONFIG = {
  seasonDays: 60,
  // One season is deliberately short enough to form a complete offline session.
  dayDurationMs: 300_000,
  workActionsPerDay: 2,
  maxOwnedCompaniesForEarlyGame: 3,
  startingSharesPerCompany: 1_000_000,
  marketOrderFeeRate: 0.0025,
  dividendPaymentDay: 30,
  dividendControlBonus: 0.25,
  takeoverPremium: 0.08,
  dailyInterestRate: 0.0012,
  inflationPerDay: 0.00035,

  // Ownership thresholds turn a stock purchase into a strategic game.
  ownershipThresholds: {
    visibleStake: 0.05,
    strategicStake: 0.10,
    blockingStake: 0.25,
    strongInfluence: 0.33,
    control: 0.51,
    fullControl: 0.75,
    nearTotalControl: 0.90,
  },

  // Company capitalization is deliberately reachable in stages.
  companyMarketCaps: {
    micro: { min: 80_000, max: 250_000, shares: 1_000_000 },
    small: { min: 250_000, max: 750_000, shares: 1_000_000 },
    medium: { min: 750_000, max: 2_500_000, shares: 1_000_000 },
    large: { min: 2_500_000, max: 8_000_000, shares: 1_000_000 },
    mega: { min: 8_000_000, max: 25_000_000, shares: 1_000_000 },
  },

  // Lifestyle is part of the economy, not a cosmetic menu.
  housing: {
    dormitory: { dailyCost: 120, comfort: 20, reputation: -2, negotiation: -1 },
    shared: { dailyCost: 250, comfort: 35, reputation: 0, negotiation: 0 },
    studio: { dailyCost: 500, comfort: 50, reputation: 2, negotiation: 1 },
    apartment: { dailyCost: 900, comfort: 68, reputation: 5, negotiation: 3 },
    premium: { dailyCost: 1_800, comfort: 82, reputation: 10, negotiation: 6 },
  },

  food: {
    basic: { dailyCost: 90, energy: 55, reputation: -1 },
    balanced: { dailyCost: 180, energy: 72, reputation: 0 },
    premium: { dailyCost: 360, energy: 88, reputation: 3 },
  },

  transport: {
    walk: { dailyCost: 20, mobility: 35, reputation: -1 },
    public: { dailyCost: 70, mobility: 60, reputation: 0 },
    scooter: { dailyCost: 140, mobility: 72, reputation: 2 },
    car: { dailyCost: 300, mobility: 86, reputation: 5 },
    executive: { dailyCost: 700, mobility: 95, reputation: 10 },
  },

  appearance: {
    basic: { dailyCost: 25, reputation: 0, negotiation: 0 },
    neat: { dailyCost: 80, reputation: 3, negotiation: 2 },
    professional: { dailyCost: 180, reputation: 7, negotiation: 5 },
    executive: { dailyCost: 400, reputation: 12, negotiation: 9 },
  },

  rankingWeights: {
    netWorth: 0.35,
    companyControl: 0.25,
    influence: 0.15,
    reputation: 0.10,
    careerLevel: 0.10,
    territoryDevelopment: 0.05,
  },
} as const;

export const STARTING_CLASSES: Record<StartingClassId, StartingClass> = {
  low: {
    id: "low",
    name: "Начальный",
    startingCash: 25_000,
    dailySalary: 1_200,
    dailyBaseLiving: 420,
    creditLimit: 4_000,
    careerMultiplier: 1,
    reputationStart: 28,
    influenceStart: 4,
  },
  middle: {
    id: "middle",
    name: "Средний",
    startingCash: 100_000,
    dailySalary: 2_800,
    dailyBaseLiving: 850,
    creditLimit: 18_000,
    careerMultiplier: 1.12,
    reputationStart: 42,
    influenceStart: 10,
  },
  high: {
    id: "high",
    name: "Высокий",
    startingCash: 500_000,
    dailySalary: 7_500,
    dailyBaseLiving: 1_600,
    creditLimit: 75_000,
    careerMultiplier: 1.25,
    reputationStart: 58,
    influenceStart: 18,
  },
};

export const CAREER_LEVELS = [
  { level: 1, title: "Стажёр", salaryMultiplier: 1.00, influence: 0 },
  { level: 2, title: "Специалист", salaryMultiplier: 1.20, influence: 2 },
  { level: 3, title: "Старший специалист", salaryMultiplier: 1.50, influence: 5 },
  { level: 4, title: "Менеджер", salaryMultiplier: 1.90, influence: 9 },
  { level: 5, title: "Руководитель", salaryMultiplier: 2.45, influence: 15 },
  { level: 6, title: "Директор", salaryMultiplier: 3.20, influence: 24 },
] as const;

export function companySharePrice(marketCap: number, shares = GAME_CONFIG.startingSharesPerCompany) {
  return marketCap / shares;
}

export function takeoverCost(
  marketCap: number,
  ownershipAlreadyHeld = 0,
  premium = GAME_CONFIG.takeoverPremium,
) {
  const targetOwnership = GAME_CONFIG.ownershipThresholds.control;
  const missingOwnership = Math.max(0, targetOwnership - ownershipAlreadyHeld);
  return marketCap * missingOwnership * (1 + premium);
}

export function dailyLifestyleCost(
  housing: keyof typeof GAME_CONFIG.housing,
  food: keyof typeof GAME_CONFIG.food,
  transport: keyof typeof GAME_CONFIG.transport,
  appearance: keyof typeof GAME_CONFIG.appearance,
  baseLiving = STARTING_CLASSES.middle.dailyBaseLiving,
) {
  return (
    baseLiving +
    GAME_CONFIG.housing[housing].dailyCost +
    GAME_CONFIG.food[food].dailyCost +
    GAME_CONFIG.transport[transport].dailyCost +
    GAME_CONFIG.appearance[appearance].dailyCost
  );
}

export function negotiationScore(
  reputation: number,
  appearance: keyof typeof GAME_CONFIG.appearance,
  housing: keyof typeof GAME_CONFIG.housing,
  transport: keyof typeof GAME_CONFIG.transport,
) {
  return Math.round(
    reputation * 0.45 +
    GAME_CONFIG.appearance[appearance].negotiation +
    GAME_CONFIG.housing[housing].negotiation +
    Math.floor(GAME_CONFIG.transport[transport].reputation / 2),
  );
}

export function economicPowerScore(input: {
  netWorth: number;
  controlledCompanyValue: number;
  influence: number;
  reputation: number;
  careerLevel: number;
  territoryDevelopment: number;
}) {
  const w = GAME_CONFIG.rankingWeights;
  const normalizedWealth = Math.min(100, (input.netWorth / 5_000_000) * 100);
  const normalizedControl = Math.min(100, (input.controlledCompanyValue / 10_000_000) * 100);
  const normalizedInfluence = Math.min(100, input.influence);
  const normalizedCareer = Math.min(100, input.careerLevel * 16.67);

  return Math.round(
    normalizedWealth * w.netWorth +
    normalizedControl * w.companyControl +
    normalizedInfluence * w.influence +
    input.reputation * w.reputation +
    normalizedCareer * w.careerLevel +
    input.territoryDevelopment * w.territoryDevelopment,
  );
}


export function dividendYield(ticker: string, sector = "") {
  const seed = ticker.split("").reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const sectorBonus: Record<string, number> = {
    "Финансы": 0.006,
    "Энергетика": 0.004,
    "Порты": 0.003,
    "Страхование": 0.004,
    "Ритейл": 0.002,
    "Технологии": -0.001,
    "Биотех": -0.002,
  };
  return Math.max(0.01, Math.min(0.055, 0.018 + (seed % 18) / 1000 + (sectorBonus[sector] ?? 0)));
}
