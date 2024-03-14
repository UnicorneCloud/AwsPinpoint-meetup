import { Injector } from "@sailplane/injector";
import { PersonalizeRuntimeClient, GetRecommendationsCommand } from "@aws-sdk/client-personalize-runtime"
import { CreateCampaignCommand, CreateSolutionVersionCommand, PersonalizeClient } from '@aws-sdk/client-personalize'
import { EnvKeys, getEnvVariable } from "../env";
import { Logger } from "@sailplane/logger";
import { SSMStore, StoreKeys } from "./SSMStore";

const logger = new Logger('AWSPersonalizeMovieRecommender')

export class AWSPersonalizeMovieRecommender {
  constructor(private personalizeClient: PersonalizeClient, private personalizeRuntimeClient: PersonalizeRuntimeClient, private ssmStore: SSMStore) {}

  async createSolutionVersionForMoviesRecommendation() {
    const solutionVersionRequest = new CreateSolutionVersionCommand({
      trainingMode: 'FULL',
      solutionArn: getEnvVariable(EnvKeys.PERSONALIZATION_SOLUTION_ARN),
    })
    logger.info('Creating personalize solution version...')
    const { solutionVersionArn } = await this.personalizeClient.send(solutionVersionRequest)
    if (solutionVersionArn == null) {
      throw new Error('Personalize solution version arn is null, please retry')
    }
    logger.info('Personalize solution version created.')
    await this.ssmStore.put(StoreKeys.PERSONALIZATION_SOLUTION_VERSION_ARN, solutionVersionArn)
  }

  async createCampaignForMoviesRecommendations() {
    const solutionVersionArn = await this.ssmStore.get(StoreKeys.PERSONALIZATION_SOLUTION_VERSION_ARN)
    const campaignRequest = new CreateCampaignCommand({
      name: 'personalization-campaign',
      solutionVersionArn: solutionVersionArn,
    })
    logger.info('Creating personalize campaign version...')
    const { campaignArn } = await this.personalizeClient.send(campaignRequest)
    if (campaignArn == null) {
      throw new Error('Personalize campaign arn is null, please retry')
    }
    logger.info('Personalize campaign created.')

    await this.ssmStore.put(StoreKeys.PERSONALIZATION_CAMPAIGN_ARN, campaignArn)
  }

  async getMoviesIdsRecommendations(userId: string, numberOfResults: number): Promise<string[]> {
    const campaignArn = await this.ssmStore.get(StoreKeys.PERSONALIZATION_CAMPAIGN_ARN)
    const request = new GetRecommendationsCommand({
      campaignArn: campaignArn,
      userId: userId,
      numResults: numberOfResults,
    })
    const { itemList } = await this.personalizeRuntimeClient.send(request)

    if (itemList) {
      return itemList
        .filter(item => item.itemId != null)
        .map(item => item.itemId) as string[]
    }

    return []
  }
}

const create = () => {
  const client = new PersonalizeClient({ region: 'ca-central-1' })
  const runTimeClient = new PersonalizeRuntimeClient({ region: 'ca-central-1' })
  const ssmStore = Injector.get(SSMStore)!
  return new AWSPersonalizeMovieRecommender(client, runTimeClient, ssmStore)
}

Injector.register(AWSPersonalizeMovieRecommender, create)