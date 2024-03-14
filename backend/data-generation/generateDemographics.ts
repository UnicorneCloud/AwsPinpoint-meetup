import { faker } from "@faker-js/faker"

const models = [
  {
    AppVersion: "iOS",
    Make: "Apple",
    Model: "Iphone",
    ModelVersion: "13",
    Platform: "iOS",
    PlatformVersion: "16.1",
  },
  {
    AppVersion: "Webapp",
    Make: "Microsoft",
    Model: "Chrome",
    ModelVersion: "14",
    Platform: "Windows",
    PlatformVersion: "11",
  },
  {
    AppVersion: "Android",
    Make: "Samsumg",
    Model: "g17",
    ModelVersion: "18",
    Platform: "Android",
    PlatformVersion: "Cake",
  },
]

const languages = [
  'fr_CA',
  'en_CA',
  'en_US',
]

export const createEndpointDemographic = () => {
  const model = faker.helpers.arrayElement(models)
  return {
    ...model,
    Locale: faker.helpers.arrayElement(languages)
  }
}

export const createEndpointLocation = () => {
  return {
    City: faker.location.city(),
    Country: faker.location.countryCode('alpha-3'),
    PostalCode: faker.location.zipCode('A#A #A#'),
    Latitude: faker.location.latitude(),
    Longitude: faker.location.longitude(),
  }
}