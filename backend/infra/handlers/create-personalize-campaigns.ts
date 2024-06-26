import { Injector } from "@sailplane/injector"

import { AWSPersonalizeRecommender } from "../AWSPersonalizeRecommender"
import { StoreKeys } from "../SSMStore"

const recommender = Injector.get(AWSPersonalizeRecommender)!

export const handler = async () => {
  await recommender.createCampaign(
    StoreKeys.PERSONALIZATION_SOLUTION_VERSION_ARN,
    StoreKeys.PERSONALIZATION_CAMPAIGN_ARN,
    'personalization-campaign',
  )
}