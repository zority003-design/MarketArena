export type JobId = "streetcleaner" | "courier" | "analyst" | "freelance";

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
  { id: "streetcleaner", name: "Дворник", description: "Очисти отмеченные зоны города без лишних движений.", basePay: 900, energyCost: 16, xp: 22, difficulty: 1 },
  { id: "courier", name: "Курьер", description: "Построй короткий маршрут и доставь три заказа.", basePay: 1400, energyCost: 18, xp: 28, difficulty: 2 },
  { id: "analyst", name: "Помощник аналитика", description: "Найди подтверждённые рыночные сигналы среди данных.", basePay: 2100, energyCost: 12, xp: 34, difficulty: 2 },
  { id: "freelance", name: "Фриланс-специалист", description: "Реши задачи клиента и избегай дорогих ошибок.", basePay: 2800, energyCost: 20, xp: 40, difficulty: 3 },
];

export function jobReward(job: JobDefinition, performance: number, careerMultiplier = 1) {
  const score = Math.max(0, Math.min(1, performance));
  const pay = Math.round(job.basePay * (0.65 + score * 0.55) * careerMultiplier);
  const xp = Math.round(job.xp * (0.7 + score * 0.6));
  return { pay, xp };
}
