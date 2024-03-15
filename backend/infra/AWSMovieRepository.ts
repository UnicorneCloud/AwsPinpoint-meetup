import { Injector } from "@sailplane/injector";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { Movie, MovieRepository } from "../domain";
import { AWSPersonalizeMovieRecommender } from "./AWSPersonalizeMovieRecommender";
import { CsvStream } from "../data-generation/csv";
import { EnvKeys, getEnvVariable } from "../env";
import { S3CSVReader } from "./S3CSVReader";

export class AWSMovieRepository implements MovieRepository {
  private movies: Record<string, Movie>
  constructor(
    private recommender: AWSPersonalizeMovieRecommender,
    private reader: S3CSVReader
  ) {}

  private async syncMovies(): Promise<void> {
    if (this.movies) {
      return
    }
    const movies = await this.reader.sync<Movie>('movies_raw.csv')
    this.movies = {}
    movies.forEach(movie => this.movies[movie.Id] = movie)
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
    Injector.get(AWSPersonalizeMovieRecommender)!,
    Injector.get(S3CSVReader)!,
  )
}

Injector.register(AWSMovieRepository, create)