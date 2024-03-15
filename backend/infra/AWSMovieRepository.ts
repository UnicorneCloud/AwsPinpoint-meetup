import { Injector } from "@sailplane/injector";

import { Movie, MovieCategoryRecord, MovieRepository, generateMovieEmptyBins } from "../domain";
import { AWSPersonalizeRecommender } from "./AWSPersonalizeRecommender";
import { S3CSVReader } from "./S3CSVReader";
import { Logger } from "@sailplane/logger";

const logger = new Logger('AWSMovieRepository')

type RawMovie = Movie & {
  ReleaseDate: string
}

export class AWSMovieRepository implements MovieRepository {
  private movies: Record<string, Movie>
  private moviesByCategory: MovieCategoryRecord
  constructor(
    private recommender: AWSPersonalizeRecommender,
    private reader: S3CSVReader
  ) {
    this.moviesByCategory = generateMovieEmptyBins()
  }

  private mapRawMovie(rawMovie: RawMovie): Movie {
    return {
      ...rawMovie,
      ReleaseDate: new Date(rawMovie.ReleaseDate),
    }
  }

  private async syncMovies(): Promise<void> {
    if (this.movies) {
      return
    }
    const rawMovies = await this.reader.sync<RawMovie>('movies_raw.csv')
    const movies = rawMovies.map(raw => this.mapRawMovie(raw))
    this.movies = {}
    movies.forEach(movie => {
      this.movies[movie.Id] = movie
      this.moviesByCategory[movie.Category].push(movie)
    })
  }

  async getMovies(): Promise<Movie[]> {
    await this.syncMovies()
    return Object.values(this.movies)
  }

  async getMoviesByCategory(): Promise<MovieCategoryRecord> {
    await this.syncMovies()
    return this.moviesByCategory
  }

  public async getMoviesRecommendations(userId: string, numberOfRecommendations: number): Promise<Movie[]> {
    await this.syncMovies()

    if (this.movies) {
      const ids = await this.recommender.getMoviesIdsRecommendations(userId, numberOfRecommendations)
      return ids.map(id => this.movies[id])
    }

    return []
  }
}

const create = () => {
  return new AWSMovieRepository(
    Injector.get(AWSPersonalizeRecommender)!,
    Injector.get(S3CSVReader)!,
  )
}

Injector.register(AWSMovieRepository, create)