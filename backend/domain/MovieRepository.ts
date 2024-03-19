import { Movie, MovieCategoryRecord } from "./Movie";

export interface MovieRepository {
  getMoviesRecommendations(userId: string, numberOfRecommendations: number): Promise<Movie[]>
  getTrendingMovies(numberOfMovies: number): Promise<Movie[]>
  getMovies(): Promise<Movie[]>
  getMoviesByIds(ids: string[]): Promise<Movie[]>
  getMoviesByCategory(): Promise<MovieCategoryRecord>
}