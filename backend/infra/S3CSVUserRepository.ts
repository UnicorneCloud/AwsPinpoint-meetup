import { User, UserDemographic } from "../domain";
import { UserRepository } from "../domain/UserRepository";
import { Injector } from "@sailplane/injector";
import { S3CSVReader } from "./S3CSVReader";

type RawUser = User & {
  Age: string
}

type RawUserDemographic = UserDemographic & {
  Latitude: string,
  Longitude: string,
}

export class S3CSVUserRepository implements UserRepository {
  private users: Record<string, User>
  private userDemographics: Record<string, UserDemographic>

  constructor(
    private reader: S3CSVReader
  ) {}

  private mapRawUser(raw: RawUser): User {
    return {
      ...raw,
      Age: parseFloat(raw.Age),
    }
  }

  private mapRawDemographic(raw: RawUserDemographic): UserDemographic {
    return {
      ...raw,
      Latitude: parseFloat(raw.Latitude),
      Longitude: parseFloat(raw.Longitude),
    }
  }

  private async syncUsers(): Promise<void> {
    if (this.users) {
      return
    }
    const rawUsers = await this.reader.sync<RawUser>('users_raw.csv')
    const users = rawUsers.map(raw => this.mapRawUser(raw))
    this.users = {}
    users.forEach(user => this.users[user.Id] = user)
  }

  private async syncUserDemographics(): Promise<void> {
    if (this.userDemographics) {
      return
    }
    const rawUsersDemographics = await this.reader.sync<RawUserDemographic>('users_demographics_raw.csv')
    const userDemographics = rawUsersDemographics.map(raw => this.mapRawDemographic(raw))
    this.userDemographics = {}
    userDemographics.forEach(demographic => this.userDemographics[demographic.UserId] = demographic)
  }

  async getUsers(): Promise<User[]> {
    await this.syncUsers()
    return Object.values(this.users)
  }

  async getUserDemographics(userId: string): Promise<UserDemographic> {
    await this.syncUserDemographics()
    if (this.userDemographics && this.userDemographics[userId]) {
      return Promise.resolve(this.userDemographics[userId])
    }

    throw new Error(`User demographics not found for user with id ${userId}`)
  }

}

Injector.register(S3CSVUserRepository, [S3CSVReader])