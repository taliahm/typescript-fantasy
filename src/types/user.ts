import { Team } from './team';

export interface User {
  _id: string;
  teams: Team[];
}