import { Movie, MovieCategoryRecord } from "./Movie";

export interface MovieRepository {
  getMoviesRecommendations(userId: string, numberOfRecommendations: number): Promise<Movie[]>
  getMovies(): Promise<Movie[]>
  getMoviesByCategory(): Promise<MovieCategoryRecord>
}