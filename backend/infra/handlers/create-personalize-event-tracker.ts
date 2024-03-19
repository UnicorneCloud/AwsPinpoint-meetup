import { Injector } from "@sailplane/injector"

import { AWSPersonalizeRecommender } from "../AWSPersonalizeRecommender"
import { EnvKeys, getEnvVariable } from "~/backend/env"

const recommender = Injector.get(AWSPersonalizeRecommender)!

export const handler = async () => {
  await recommender.createEventTracker(
    getEnvVariable(EnvKeys.DATASET_GROUP_ARN),
    'personalization-event-tracker',
  )
}