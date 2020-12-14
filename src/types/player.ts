

export interface Episode {
   [property: string]: Score[],
}

export interface Player {
  _id: string,
  firstName: string,
  lastName: string,
  scores: Score[],
}

export interface Score {
  episodeNumber: string;
  eliminated: boolean;
  leagueId: string;
  text: string;
  count: number;
  pointValue: number;
  _id: string;
}

// Used in Players.js
export interface PlayerWithEpisodes extends Player {
  sortedScores: Episode,
  isEliminated: boolean,
}
export interface PlayerNormalized extends Player {
  organizedEps: Score[][],
  isEliminated: boolean,
}