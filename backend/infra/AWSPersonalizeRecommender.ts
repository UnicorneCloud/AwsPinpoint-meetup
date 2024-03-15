import { Injector } from "@sailplane/injector";
import { PersonalizeRuntimeClient, GetRecommendationsCommand } from "@aws-sdk/client-personalize-runtime"
import { CreateCampaignCommand, CreateSolutionVersionCommand, PersonalizeClient } from '@aws-sdk/client-personalize'
import { EnvKeys, getEnvVariable } from "../env";
import { Logger } from "@sailplane/logger";
import { SSMStore, StoreKeys } from "./SSMStore";

const logger = new Logger('AWSPersonalizeRecommender')

export class AWSPersonalizeRecommender {
  constructor(private personalizeClient: PersonalizeClient, private personalizeRuntimeClient: PersonalizeRuntimeClient, private ssmStore: SSMStore) {}

  async createSolutionVersion(solutionArn: string, solutionStoreKey: StoreKeys) {
    const solutionVersionRequest = new CreateSolutionVersionCommand({
      trainingMode: 'FULL',
      solutionArn: solutionArn,
    })
    logger.info('Creating personalize solution version...')
    const { solutionVersionArn } = await this.personalizeClient.send(solutionVersionRequest)
    if (solutionVersionArn == null) {
      throw new Error('Personalize solution version arn is null, please retry')
    }
    logger.info('Personalize solution version created.')
    await this.ssmStore.put(solutionStoreKey, solutionVersionArn)
  }

  async createCampaign(solutionStoreKey: StoreKeys, campaignStoreKey: StoreKeys, campaignName: string) {
    const solutionVersionArn = await this.ssmStore.get(solutionStoreKey)
    const campaignRequest = new CreateCampaignCommand({
      name: campaignName,
      solutionVersionArn: solutionVersionArn,
    })
    logger.info('Creating personalize campaign version...')
    const { campaignArn } = await this.personalizeClient.send(campaignRequest)
    if (campaignArn == null) {
      throw new Error('Personalize campaign arn is null, please retry')
    }
    logger.info('Personalize campaign created.')

    await this.ssmStore.put(campaignStoreKey, campaignArn)
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
  const region = getEnvVariable(EnvKeys.REGION)
  const client = new PersonalizeClient({ region: region })
  const runTimeClient = new PersonalizeRuntimeClient({ region: region })
  const ssmStore = Injector.get(SSMStore)!
  return new AWSPersonalizeRecommender(client, runTimeClient, ssmStore)
}

Injector.register(AWSPersonalizeRecommender, create)