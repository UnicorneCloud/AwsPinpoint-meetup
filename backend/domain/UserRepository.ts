import { User, UserDemographic } from "./User";

export interface UserRepository {
  getUsers(): Promise<User[]>
  
  getUserDemographics(userId: string): Promise<UserDemographic>
}