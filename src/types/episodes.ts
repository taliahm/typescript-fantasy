export interface episode {
  _id: string,
  prevAirDate: Date | null,
  airDate: Date,
  season: string,
  number: number
}