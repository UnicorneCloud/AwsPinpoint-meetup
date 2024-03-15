import { faker } from "@faker-js/faker"
import PD from 'probability-distributions'

import { Genders } from "./User"

const normal = PD.rnorm(10000, 0.5, 0.125)

export enum MovieCategories {
  Action = 'Action',
  Adventure = 'Adventure',
  Animation = 'Animation',
  Biography = 'Biography',
  Comedy = 'Comedy',
  Crime = 'Crime',
  Documentary = 'Documentary',
  Drama = 'Drama',
  Family = 'Family',
  Fantasy = 'Fantasy',
  History = 'History',
  Horror = 'Horror',
  Music = 'Music',
  Mystery = 'Mystery',
  Romance = 'Romance',
  ScienceFiction = 'Science Fiction',
  TVMovie = 'TV Movie',
  Thriller = 'Thriller',
  War = 'War',
  Western = 'Western',
  Foreign = 'Foreign',
  Independent = 'Independent',
  Classic = 'Classic',
  Cult = 'Cult',
  Mythology = 'Mythology',
}

export const PossibleMovieCategories = Object.values(MovieCategories)

export interface Movie {
  Id: string
  Name: string
  Description: string
  Category: MovieCategories
  ReleaseDate: Date
}

export type MovieCategoryRecord = {
  [key: string]: Movie[];
}

export const generateMovieEmptyBins = (): MovieCategoryRecord => {
  return Object.values(MovieCategories).reduce((acc, category) => {
    return {
      ...acc,
      [category]: []
    }
  }, {})
}

export interface MinMaxOfDistribution {
  min: number
  max: number
}

export const maleMovieDistribution: Record<MovieCategories, MinMaxOfDistribution> = {
  [MovieCategories.Romance]: { min: 0.00, max: 0.04},
  [MovieCategories.Classic]: { min: 0.04, max: 0.08},
  [MovieCategories.Animation]: { min: 0.08, max: 0.12},
  [MovieCategories.Biography]: { min: 0.12, max: 0.16},
  [MovieCategories.Documentary]: { min: 0.16, max: 0.20},
  [MovieCategories.Drama]: { min: 0.20, max: 0.24},
  [MovieCategories.Adventure]: { min: 0.24, max: 0.28},
  [MovieCategories.Cult]: { min: 0.28, max: 0.32},
  [MovieCategories.Horror]: { min: 0.32, max: 0.36},
  [MovieCategories.Thriller]: { min: 0.36, max: 0.40},
  [MovieCategories.Crime]: { min: 0.40, max: 0.46},
  [MovieCategories.War]: { min: 0.46, max: 0.50},
  [MovieCategories.Action]: { min: 0.50, max: 0.54},
  [MovieCategories.ScienceFiction]: { min: 0.54, max: 0.58},
  [MovieCategories.Comedy]: { min: 0.58, max: 0.62},
  [MovieCategories.Fantasy]: { min: 0.62, max: 0.66},
  [MovieCategories.Western]: { min: 0.66, max: 0.70},
  [MovieCategories.TVMovie]: { min: 0.70, max: 0.74},
  [MovieCategories.History]: { min: 0.74, max: 0.78},
  [MovieCategories.Mystery]: { min: 0.78, max: 0.82},
  [MovieCategories.Mythology]: { min: 0.82, max: 0.86},
  [MovieCategories.Family]: { min: 0.86, max: 0.90},
  [MovieCategories.Music]: { min: 0.90, max: 0.94},
  [MovieCategories.Foreign]: { min: 0.94, max: 0.98},
  [MovieCategories.Independent]: { min: 0.98, max: 1},
}

export const femaleMovieDistribution: Record<MovieCategories, MinMaxOfDistribution> = {
  [MovieCategories.Horror]: { min: 0.00, max: 0.04},
  [MovieCategories.War]: { min: 0.04, max: 0.08},
  [MovieCategories.Western]: { min: 0.08, max: 0.12},
  [MovieCategories.Thriller]: { min: 0.12, max: 0.16},
  [MovieCategories.Action]: { min: 0.16, max: 0.20},
  [MovieCategories.Adventure]: { min: 0.20, max: 0.24},
  [MovieCategories.Cult]: { min: 0.24, max: 0.28},
  [MovieCategories.Classic]: { min: 0.28, max: 0.32},
  [MovieCategories.History]: { min: 0.32, max: 0.36},
  [MovieCategories.Biography]: { min: 0.36, max: 0.40},
  [MovieCategories.Drama]: { min: 0.40, max: 0.46},
  [MovieCategories.Animation]: { min: 0.46, max: 0.50},
  [MovieCategories.Romance]: { min: 0.50, max: 0.54},
  [MovieCategories.Comedy]: { min: 0.54, max: 0.58},
  [MovieCategories.Independent]: { min: 0.58, max: 0.62},
  [MovieCategories.Fantasy]: { min: 0.62, max: 0.66},
  [MovieCategories.Family]: { min: 0.66, max: 0.70},
  [MovieCategories.TVMovie]: { min: 0.70, max: 0.74},
  [MovieCategories.Music]: { min: 0.74, max: 0.78},
  [MovieCategories.Mystery]: { min: 0.78, max: 0.82},
  [MovieCategories.Mythology]: { min: 0.82, max: 0.86},
  [MovieCategories.Documentary]: { min: 0.86, max: 0.90},
  [MovieCategories.ScienceFiction]: { min: 0.90, max: 0.94},
  [MovieCategories.Foreign]: { min: 0.94, max: 0.98},
  [MovieCategories.Crime]: { min: 0.98, max: 1},
}

export const pickCategory = (distribution: Record<MovieCategories, MinMaxOfDistribution>): MovieCategories => {
  const number = faker.helpers.arrayElement(normal)
  for (let i = 0; i < PossibleMovieCategories.length; i++) {
    const category = PossibleMovieCategories[i]
    const { min, max } = distribution[category]
    if (number >= min && number < max) {
      return category
    }
  }

  throw new Error(`No category found for number: ${number}`)
}

export const pickMovie = (moviesBins: MovieCategoryRecord, gender: Genders): Movie => {
  // Normal distribution for male gender
  if (gender === Genders.Male) {
    const category = pickCategory(maleMovieDistribution)
    return faker.helpers.arrayElement(moviesBins[category])
  }

  // Normal distribution for female gender
  if (gender === Genders.Female) {
    const category = pickCategory(femaleMovieDistribution)
    return faker.helpers.arrayElement(moviesBins[category])
  }

  // Uniform distribution for other gender
  if (gender === Genders.Other) {
    const category = faker.helpers.arrayElement(PossibleMovieCategories)
    return faker.helpers.arrayElement(moviesBins[category])
  }

  throw new Error('Gender not supported')
}