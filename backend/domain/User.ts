export enum Genders {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export const PossibleGenders = Object.values(Genders)

export interface User {
  Id: string
  Email: string
  FullName: string
  Age: number
  Gender: Genders
}