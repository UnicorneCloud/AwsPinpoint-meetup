import { Injector } from "@sailplane/injector";
import { PersonalizeRuntimeClient, GetRecommendationsCommand } from "@aws-sdk/client-personalize-runtime"

const CAMPAIGN_ARN = 'arn:aws:personalize:ca-central-1:392199159898:campaign/test-campaigns'

export class AWSPersonalizeMovieRecommender {
  constructor(private personalizeClient: PersonalizeRuntimeClient) {}

  async getMoviesIdsRecommendations(userId: string, numberOfResults: number): Promise<string[]> {
    const request: GetRecommendationsCommand = new GetRecommendationsCommand({
      campaignArn: CAMPAIGN_ARN,
      userId: userId,
      numResults: numberOfResults,
    })
    const { itemList } = await this.personalizeClient.send(request)

    if (itemList) {
      return itemList
        .filter(item => item.itemId != null)
        .map(item => item.itemId) as string[]
    }

    return []
  }
}

const create = () => {
  const client = new PersonalizeRuntimeClient({ region: 'ca-central-1' })
  return new AWSPersonalizeMovieRecommender(client)
}

Injector.register(AWSPersonalizeMovieRecommender, create)