import { economicPowerScore } from "./economy";

export type RankingPlayer = {
  id: string;
  name: string;
  country: string;
  netWorth: number;
  controlledCompanyValue: number;
  influence: number;
  reputation: number;
  careerLevel: number;
  territoryDevelopment: number;
};

export type RankingEntry = RankingPlayer & { powerScore: number; rank: number };

export function buildRanking(players: RankingPlayer[]): RankingEntry[] {
  return players
    .map((player) => ({
      ...player,
      powerScore: economicPowerScore(player),
    }))
    .sort((a, b) => b.powerScore - a.powerScore)
    .map((player, index) => ({ ...player, rank: index + 1 }));
}
