import { GAME_CONFIG, STARTING_CLASSES, type StartingClassId } from "./economy";

export type PlayerState = {
  name: string;
  classId: StartingClassId;
  day: number;
  cash: number;
  reputation: number;
  influence: number;
  energy: number;
  careerLevel: number;
  careerXp: number;
  housing: keyof typeof GAME_CONFIG.housing;
  food: keyof typeof GAME_CONFIG.food;
  transport: keyof typeof GAME_CONFIG.transport;
  appearance: keyof typeof GAME_CONFIG.appearance;
  netWorth: number;
  territoryDevelopment: number;
};

export function createPlayer(name: string, classId: StartingClassId): PlayerState {
  const profile = STARTING_CLASSES[classId];
  return {
    name,
    classId,
    day: 1,
    cash: profile.startingCash,
    reputation: profile.reputationStart,
    influence: profile.influenceStart,
    energy: 100,
    careerLevel: 1,
    careerXp: 0,
    housing: classId === "high" ? "apartment" : classId === "middle" ? "studio" : "dormitory",
    food: classId === "high" ? "balanced" : "basic",
    transport: classId === "high" ? "car" : "public",
    appearance: classId === "high" ? "professional" : classId === "basic" ? "basic" : "neat",
    netWorth: profile.startingCash,
    territoryDevelopment: 0,
  };
}

export function applyDailyRecovery(player: PlayerState): PlayerState {
  return { ...player, energy: Math.min(100, player.energy + 35) };
}

export function awardCareerXp(player: PlayerState, amount: number): PlayerState {
  const nextXp = player.careerXp + amount;
  const threshold = player.careerLevel * 100;
  if (nextXp < threshold) return { ...player, careerXp: nextXp };

  return {
    ...player,
    careerLevel: Math.min(6, player.careerLevel + 1),
    careerXp: nextXp - threshold,
    influence: player.influence + 2 + player.careerLevel,
    reputation: Math.min(100, player.reputation + 2),
  };
}
