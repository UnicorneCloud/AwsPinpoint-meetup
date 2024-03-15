import { faker } from '@faker-js/faker'
import { PossibleMovieCategories, Movie, MovieCategories, generateMovieEmptyBins, MovieCategoryRecord } from '~/backend/domain'

const DUNE: Movie = {
  Id: 'DUNE',
  Category: MovieCategories.ScienceFiction,
  Name: 'Dune',
  Description: 'A group of aliens invade Earth and try to take over the planet.',
  ReleaseDate: new Date('2021-12-01')
}

export const generateMovie = (id: string): Movie => {
  return {
    Id: id,
    Category: faker.helpers.arrayElement(PossibleMovieCategories),
    Name: faker.music.songName(),
    Description: faker.lorem.sentences(5),
    ReleaseDate: faker.date.between({ from: new Date('1925-01-01'), to: new Date() })
  }
}

export const generateMovies = (count: number): { movies: Movie[], moviesBins: MovieCategoryRecord } => {
  const moviesBins = generateMovieEmptyBins()
  const movies: Movie[] = []
  for (let i = 0; i < count; i++) {
    const movie = generateMovie(i.toString())
    movies.push(movie)
    moviesBins[movie.Category].push(movie)
  }
  movies.push(DUNE)
  moviesBins[DUNE.Category].push(DUNE)
  return {
    movies,
    moviesBins,
  }
}