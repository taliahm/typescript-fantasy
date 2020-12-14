import { League } from './league';
import { Player } from './player';
export interface Team {
  name: string,
  players: string[],
  _id: string,
  league: League,
  userName: string,
}

export interface TeamWithPlayers{
  name: string,
  players: Player[],
  _id: string,
  league: League,
  userName: string,
}

