export type JobId = "courier" | "cashier" | "janitor" | "taxi";

export type JobDefinition = {
  id: JobId;
  name: string;
  description: string;
  basePay: number;
  energyCost: number;
  xp: number;
  difficulty: 1 | 2 | 3;
};

export const JOBS: JobDefinition[] = [
  {
    id: "courier",
    name: "Курьер",
    description: "2D маршрут: доставь заказ по улицам быстрее конкурентов.",
    basePay: 900,
    energyCost: 18,
    xp: 28,
    difficulty: 2,
  },
  {
    id: "cashier",
    name: "Кассир",
    description: "2D поток покупателей: обслужи очередь без ошибок.",
    basePay: 750,
    energyCost: 14,
    xp: 24,
    difficulty: 1,
  },
  {
    id: "janitor",
    name: "Уборщик",
    description: "2D уборка: очисти зоны и не пропусти срочные задания.",
    basePay: 650,
    energyCost: 16,
    xp: 22,
    difficulty: 1,
  },
  {
    id: "taxi",
    name: "Такси",
    description: "2D городская езда: забери пассажира и довези его по маршруту.",
    basePay: 1_100,
    energyCost: 22,
    xp: 32,
    difficulty: 3,
  },
];

export function jobReward(job: JobDefinition, performance: number, careerMultiplier = 1) {
  const score = Math.max(0, Math.min(1, performance));
  const pay = Math.round(job.basePay * (0.65 + score * 0.55) * careerMultiplier);
  const xp = Math.round(job.xp * (0.7 + score * 0.6));
  return { pay, xp };
}
