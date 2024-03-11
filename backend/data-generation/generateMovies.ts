import { faker } from '@faker-js/faker'
import { PossibleMovieCategories, Movie } from '~/backend/domain'

export const generateMovie = (id: string): Movie => {
  return {
    Id: id,
    Category: faker.helpers.arrayElement(PossibleMovieCategories),
    Name: faker.music.songName(),
    Description: faker.lorem.lines(5),
    ReleaseDate: faker.date.between({ from: new Date('1925-01-01'), to: new Date() })
  }
}

export const generateUsers = (count: number): Movie[] => {
  const movies: Movie[] = []
  for (let i = 0; i < count; i++) {
    movies.push(generateMovie(i.toString()))
  }
  return movies
}