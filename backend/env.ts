export enum EnvKeys {
  REGION = 'REGION',
  PERSONALIZATION_RECIPE_ARN = 'PERSONALIZATION_RECIPE_ARN',
  PERSONALIZATION_SOLUTION_ARN = 'PERSONALIZATION_SOLUTION_ARN',
  DATASET_GROUP_ARN = 'DATASET_GROUP_ARN',
  PINPOINT_APP_ID = 'PINPOINT_APP_ID',
  BUCKET_NAME = 'BUCKET_NAME',
}

export const isEnvVarDefined = (key: EnvKeys): boolean => {
  return process.env[key] != null && process.env[key] !== ''
}

export const getEnvVariable = (key: EnvKeys): string => {
  if (isEnvVarDefined(key)) {
    return process.env[key] as string
  }

  throw new Error(`Environment variable ${key} is not defined`)
}
