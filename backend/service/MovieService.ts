import { Injector} from '@sailplane/injector'
import { MovieRepository } from '../domain'
import { AWSMovieRepository } from '../infra/AWSMovieRepository'

export class MovieService {
  constructor(private movieRepository: MovieRepository) {}

  async getMoviesRecommendations(userId: string, numberOfRecommendations: number) {
    return this.movieRepository.getMoviesRecommendations(userId, numberOfRecommendations)
  }
}

Injector.register(MovieService, [AWSMovieRepository])
