import { Injector } from "@sailplane/injector"
import { AWSPersonalizeRecommender } from "../AWSPersonalizeRecommender"
import { EnvKeys, getEnvVariable } from "~/backend/env"
import { StoreKeys } from "../SSMStore"

const recommender = Injector.get(AWSPersonalizeRecommender)!

export const handler = async () => {
  await recommender.createSolutionVersion(
    getEnvVariable(EnvKeys.TRENDING_NOW_SOLUTION_ARN),
    StoreKeys.TRENDING_NOW_SOLUTION_VERSION_ARN
  )
}