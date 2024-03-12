import { MovieCategories } from "./Movie"

export enum InteractionTypes {
  Watch = 'Watch'
}

export interface WatchInteraction {
  Id: string
  UserId: string
  UserGender: string,
  UserAge: number,
  MovieId: string
  MovieName: string
  MovieCategory: MovieCategories
  Type: InteractionTypes
  // UNIX epoch
  Timestamp: number
}