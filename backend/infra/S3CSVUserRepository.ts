import { User, UserDemographic } from "../domain";
import { UserRepository } from "../domain/UserRepository";
import { Injector } from "@sailplane/injector";
import { S3CSVReader } from "./S3CSVReader";

export class S3CSVUserRepository implements UserRepository {
  private users: Record<string, User>
  private userDemographics: Record<string, UserDemographic>

  constructor(
    private reader: S3CSVReader
  ) {}

  private async syncUsers(): Promise<void> {
    if (this.users) {
      return
    }
    const users = await this.reader.sync<User>('users_raw.csv')
    this.users = {}
    users.forEach(user => this.users[user.Id] = user)
  }

  private async syncUserDemographics(): Promise<void> {
    if (this.userDemographics) {
      return
    }
    const users = await this.reader.sync<UserDemographic>('users_demographics_raw.csv')
    this.userDemographics = {}
    users.forEach(demographic => this.userDemographics[demographic.UserId] = demographic)
  }

  async getUsers(): Promise<User[]> {
    await this.syncUsers()
    return Object.values(this.users)
  }

  async getUserDemographics(userId: string): Promise<UserDemographic> {
    if (this.userDemographics && this.userDemographics[userId]) {
      return Promise.resolve(this.userDemographics[userId])
    }

    throw new Error(`User demographics not found for user with id ${userId}`)
  }

}

Injector.register(S3CSVUserRepository, [S3CSVReader])