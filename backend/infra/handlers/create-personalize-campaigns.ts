import { Injector } from "@sailplane/injector"
import { AWSPersonalizeMovieRecommender } from "../AWSPersonalizeMovieRecommender"

const recommender = Injector.get(AWSPersonalizeMovieRecommender)!

export const handler = async () => {
  await recommender.createCampaignForMoviesRecommendations()
}