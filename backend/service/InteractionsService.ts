import { de, faker } from "@faker-js/faker";
import { Event, InteractionTypes, Movie, UserRepository } from "../domain";

export class InteractionsService {
  constructor(private userRepository: UserRepository) {}

  async createUsersInteraction(): Promise<void> {
    const users = await this.userRepository.getUsers()
    users.forEach(async (user) => {
      const demographic = await this.userRepository.getUserDemographics(user.Id)
      const event: Event<Movie> = {
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
        // TODO: get random movie from distribution?
        Attributes: {},
      }
    })
  }
}