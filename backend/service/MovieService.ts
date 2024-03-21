import { Injector} from '@sailplane/injector'

import { MovieRepository } from '../domain'
import { AWSMovieRepository } from '../infra/AWSMovieRepository'
import { AWSPinpointClient } from '../infra/AWSPinpointClient'

export class MovieService {
  constructor(private movieRepository: MovieRepository, private pinpointClient: AWSPinpointClient) {}

  async getMoviesByIds(ids: string[]) {
    return await this.movieRepository.getMoviesByIds(ids)
  }

  async getMoviesRecommendations(userId: string, numberOfRecommendations: number) {
    return this.movieRepository.getMoviesRecommendations(userId, numberOfRecommendations)
  }

  async getTrendingMovies(numberOfMovies: number) {
    return this.movieRepository.getTrendingMovies(numberOfMovies)
  }

  async createTrendingMovieCampaign() {
    const trendingMovies = await this.movieRepository.getTrendingMovies(1)
    const trendingMovie = trendingMovies[0]
    const segmentName = `did-not-watch-${trendingMovie.Name.replace(/ /g, '')}-segment`
    const segmentId = await this.pinpointClient.createDidNotWatchSegment(trendingMovie, segmentName)
    const campaignName = `did-not-watch-${trendingMovie.Name.replace(/ /g, '')}-campaign`
    await this.pinpointClient.createCampaignForTrendingMovie(trendingMovie, campaignName, segmentId)
  }

  async createRecommendationsCampaign() {
    await this.pinpointClient.createRecommenderModel('personalization-model')
    await this.pinpointClient.createRecommendationsTemplate('personalization-recommendations-template')
    await this.pinpointClient.createWeeklyRecommendationsCampaign('personalization-campaign')
  }
}

Injector.register(MovieService, [AWSMovieRepository, AWSPinpointClient])
