import { Score } from './player';

export interface League {
  rules: Score[],
  _id: string,
  leagueName: string
}