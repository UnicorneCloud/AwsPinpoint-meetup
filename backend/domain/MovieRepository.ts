import { Movie } from "./Movie";

export interface MovieRepository {
  getMoviesRecommendations(userId: string): Promise<Movie[]>
}