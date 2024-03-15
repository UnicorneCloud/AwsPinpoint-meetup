import { Injector } from "@sailplane/injector"

import { AWSPersonalizeRecommender } from "../AWSPersonalizeRecommender"
import { StoreKeys } from "../SSMStore"

const recommender = Injector.get(AWSPersonalizeRecommender)!

export const handler = async () => {
  await recommender.createCampaign(
    StoreKeys.TRENDING_NOW_SOLUTION_VERSION_ARN,
    StoreKeys.TRENDING_NOW_CAMPAIGN_ARN,
    'trending-now-items-campaign',
  )
}