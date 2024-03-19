import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from 'uuid'
import { Event, InteractionTypes, Movie, MovieRepository, UserDemographic, UserRepository, pickMovie } from "../domain";
import { Injector } from "@sailplane/injector";
import pLimit from 'p-limit'
import { AWSMovieRepository, S3CSVUserRepository } from "../infra";
import { AWSPinpointClient, EventParam } from "../infra/AWSPinpointClient";
import { Logger } from "@sailplane/logger";
import { AWSPersonalizeRecommender } from "../infra/AWSPersonalizeRecommender";

const logger = new Logger('InteractionsService')

export class InteractionsService {
  constructor(
    private userRepository: UserRepository,
    private movieRepository: MovieRepository,
    private pinpointClient: AWSPinpointClient,
    private personalizeRecommender: AWSPersonalizeRecommender,
  ) {}

  private createWatchEvent(movie: Movie, demographic: UserDemographic): Event<Record<string, string>> {
    const eventId = uuidv4()
    return {
      Id: eventId,
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

  private async sendToPinpoint(data: EventParam<Record<string, string>>[]) {
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

  private async sendToPersonalize(data: EventParam<Record<string, string>>[]) {
    const limit = pLimit(5)
    const promises = data.map((datum) => limit(async () => {
        await new Promise(resolve => setTimeout(resolve, 250))
        await this.personalizeRecommender.putEvent({
          user: datum.user,
          event: datum.event,
        })
      }
    ))
    await Promise.all(promises)
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
    logger.info('Sample', data[0])

    await this.sendToPinpoint(data)
    await this.sendToPersonalize(data)
  }
}

Injector.register(InteractionsService, [S3CSVUserRepository, AWSMovieRepository, AWSPinpointClient, AWSPersonalizeRecommender])