export enum MovieCategories {
  Action = 'Action',
  Adventure = 'Adventure',
  Animation = 'Animation',
  Biography = 'Biography',
  Comedy = 'Comedy',
  Crime = 'Crime',
  Documentary = 'Documentary',
  Drama = 'Drama',
  Family = 'Family',
  Fantasy = 'Fantasy',
  History = 'History',
  Horror = 'Horror',
  Music = 'Music',
  Mystery = 'Mystery',
  Romance = 'Romance',
  ScienceFiction = 'Science Fiction',
  TVMovie = 'TV Movie',
  Thriller = 'Thriller',
  War = 'War',
  Western = 'Western',
  Foreign = 'Foreign',
  Independent = 'Independent',
  Classic = 'Classic',
  Cult = 'Cult',
  Mythology = 'Mythology',
}

export const PossibleMovieCategories = Object.values(MovieCategories)

export interface Movie {
  Id: string
  Name: string
  Description: string
  Category: MovieCategories
  ReleaseDate: Date
}