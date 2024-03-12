import { faker } from "@faker-js/faker";
import { InteractionTypes, Movie, User, WatchInteraction } from "../domain";
import { MovieCategoryRecord, pickMovie } from "./generateMovies";

export function generateWatchInteraction(id: string, user: User, movie: Movie): WatchInteraction {
  return {
    Id: id,
    UserId: user.Id,
    UserGender: user.Gender,
    UserAge: user.Age,
    Type: InteractionTypes.Watch,
    // UNIX epoch
    Timestamp: faker.date.between({ from: new Date('2024-02-01'), to: new Date() }).getTime() / 1000,
    MovieId: movie.Id,
    MovieName: movie.Name,
    MovieCategory: movie.Category,
  }
}

export function generateWatchInteractions(count: number, users: User[], moviesBins: MovieCategoryRecord): WatchInteraction[] {
  const interactions: WatchInteraction[] = []
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users)
    const movie = pickMovie(moviesBins, user.Gender)
    const interaction = generateWatchInteraction(i.toString(), user, movie)
    interactions.push(interaction)
  }

  return interactions
}