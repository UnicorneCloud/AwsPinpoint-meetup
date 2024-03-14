import { faker } from '@faker-js/faker'
import { User, PossibleGenders, UserDemographic } from '~/backend/domain'
import { generateDemographic, generateLocation } from './generateDemographics'

const sesPostfix = "simulator.amazonses.com"

export const generateUser = (id: string): User => {
  return {
    Id: id,
    Email: `user-${id}@${sesPostfix}`,
    FullName: faker.person.fullName(),
    Age: faker.number.int({ min: 18, max: 99 }),
    Gender: faker.helpers.arrayElement(PossibleGenders)
  }
}

export const generateUserDemographic = (userId: string): UserDemographic => {
  return {
    UserId: userId,
    ...generateDemographic(),
    ...generateLocation(),
  }
}

export const generateUsers = (count: number): User[] => {
  const users: User[] = []
  for (let i = 0; i < count; i++) {
    users.push(generateUser(i.toString()))
  }
  return users
}

export const generateUserDemographics = (users: User[]): UserDemographic[] => {
  const userDemographics: UserDemographic[] = []
  for (let i = 0; i < users.length; i++) {
    userDemographics.push(generateUserDemographic(users[i].Id))
  }
  return userDemographics
}