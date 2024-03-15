import { da, faker } from "@faker-js/faker";
import { Event, InteractionTypes, Movie, MovieRepository, User, UserDemographic, UserRepository, pickMovie } from "../domain";
import { Injector } from "@sailplane/injector";
import pLimit from 'p-limit'
import { AWSMovieRepository, S3CSVUserRepository } from "../infra";
import { AWSPinpointClient, EventParam } from "../infra/AWSPinpointClient";
import { Logger } from "@sailplane/logger";

const logger = new Logger('InteractionsService')

export class InteractionsService {
  constructor(
    private userRepository: UserRepository,
    private movieRepository: MovieRepository,
    private pinpointClient: AWSPinpointClient,
  ) {}

  private createWatchEvent(movie: Movie, demographic: UserDemographic): Event<Record<string, string>> {
    return {
      Type: InteractionTypes.Watch,
      Timestamp: faker.date.recent(),
      Demographic: {
        AppVersion: demographic.AppVersion,
        Make: demographic.Make,
        Model: demographic.Model,
        ModelVersion: demographic.ModelVersion,
        Platform: demographic.Platform,
        PlatformVersion: demographic.PlatformVersion,
        Locale: demographic.Locale,
      },
      Location: {
        City: demographic.City,
        Country: demographic.Country,
        PostalCode: demographic.PostalCode,
        Latitude: demographic.Latitude,
        Longitude: demographic.Longitude,
      },
      Attributes: {
        ...movie,
        ReleaseDate: movie.ReleaseDate.toISOString(),
      },
    }
  }

  async createUsersInteraction(): Promise<void> {
    logger.info('Creating users interaction')

    const users = await this.userRepository.getUsers()

    logger.info('Users', users.length)

    const movieCategoryRecord = await this.movieRepository.getMoviesByCategory()
    const data: EventParam<Record<string, string>>[] = []

    await Promise.all(
      users.map(async (user) => {
        const demographic = await this.userRepository.getUserDemographics(user.Id)
        const movie = pickMovie(movieCategoryRecord, user.Gender)
        data.push({
          event: this.createWatchEvent(movie, demographic),
          user: user,
        })
      })
    )

    logger.info('Data to be pushed in clients', data.length)

    // Pinpoint has a limit of 100 items per batch
    const chunkSize = 100
    const chunked = []
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize)
      chunked.push(chunk)
    }

    logger.info('Number of batch to send', chunked.length)

    const limit = pLimit(5)
    const promises = chunked.map((chunk) => limit(() => this.pinpointClient.sendEvents(chunk)))
    await Promise.all(promises)
  }
}

Injector.register(InteractionsService, [S3CSVUserRepository, AWSMovieRepository, AWSPinpointClient])