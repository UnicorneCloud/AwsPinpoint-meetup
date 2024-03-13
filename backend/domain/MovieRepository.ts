import { Movie } from "./Movie";

export interface MovieRepository {
  getMoviesRecommendations(userId: string, numberOfRecommendations: number): Promise<Movie[]>
}