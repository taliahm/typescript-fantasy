import { League } from './league';
import { Player, PlayerWithScores } from './player';


export interface BaseTeam {
  name: string
  _id: string
  league: League
  userName: string
  userPic: string
}

export interface TeamEpisode {
  airDate: Date,
  // _id: string,
  number: number,
  episodeId: string,
}

export interface TeamEpisodeWithPlayerId extends TeamEpisode {
  players: string[],
}

export interface TeamEpisodeWithFullPlayer extends TeamEpisode {
  players: Player[],
}

interface TeamEpisodeWithScoresPlayers extends TeamEpisode {
  players: PlayerWithScores[],
  total: number
}

export interface Team extends BaseTeam {
  players: string[],
  episodes: TeamEpisodeWithPlayerId[]
}

export interface TeamWithPlayers extends BaseTeam {
  players: Player[],
  isCurrentUserTeam: boolean,
  episodes: TeamEpisodeWithFullPlayer[],
}

export interface TeamWithPlayersWithScores extends BaseTeam {
  players: PlayerWithScores[]
  isCurrentUserTeam: boolean,
  teamTotal: number, 
  episodes: TeamEpisodeWithScoresPlayers[]
}

