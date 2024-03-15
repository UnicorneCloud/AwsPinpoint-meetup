import { Injector } from "@sailplane/injector"
import { AWSPersonalizeRecommender } from "../AWSPersonalizeRecommender"
import { EnvKeys, getEnvVariable } from "~/backend/env"
import { StoreKeys } from "../SSMStore"

const recommender = Injector.get(AWSPersonalizeRecommender)!

export const handler = async () => {
  await recommender.createSolutionVersion(
    getEnvVariable(EnvKeys.PERSONALIZATION_SOLUTION_ARN),
    StoreKeys.PERSONALIZATION_SOLUTION_VERSION_ARN
  )
}