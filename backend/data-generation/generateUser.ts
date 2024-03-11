import { faker } from '@faker-js/faker'
import { User, PossibleGenders } from '~/backend/domain'

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

export const generateUsers = (count: number): User[] => {
  const users: User[] = []
  for (let i = 0; i < count; i++) {
    users.push(generateUser(i.toString()))
  }
  return users
}