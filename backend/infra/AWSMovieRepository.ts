import { Injector } from "@sailplane/injector";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { Movie, MovieRepository } from "../domain";
import { AWSPersonalizeMovieRecommender } from "./AWSPersonalizeMovieRecommender";
import { CsvStream } from "../data-generation/csv";

const BUCKET_NAME = 'test-meetup-personalize'

export class AWSMovieRepository implements MovieRepository {
  private movies: Record<string, Movie>
  constructor(
    private recommender: AWSPersonalizeMovieRecommender,
    private S3Client: S3Client,
    private csvStream: CsvStream,
  ) {}

  private async syncMovies(): Promise<void> {
    if (this.movies) {
      return
    }
    const request = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'movies_raw.csv'
    })
    const { Body } = await this.S3Client.send(request)
    if (Body) {
      const content = await Body.transformToString('utf-8')
      const movies = this.csvStream.read<Movie>(content)
      this.movies = {}
      movies.forEach(movie => this.movies[movie.Id] = movie)
    }
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
    new S3Client({ region: 'ca-central-1' }),
    Injector.get(CsvStream)!,
  )
}

Injector.register(AWSMovieRepository, create)