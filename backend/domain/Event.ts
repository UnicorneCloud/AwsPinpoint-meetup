import { InteractionTypes } from "./Interaction"

export interface Demographic {
  AppVersion: string,
  Make: string,
  Model: string,
  ModelVersion: string,
  Platform: string,
  PlatformVersion: string,
  Locale: string,
}

export interface Location {
  City: string,
  Country: string,
  PostalCode: string,
  Latitude: number,
  Longitude: number,
}

export interface Event<T extends Record<string, string>> {
  Id: string
  Attributes: T
  Type: InteractionTypes
  Timestamp: Date
  Demographic: Demographic
  Location: Location
}