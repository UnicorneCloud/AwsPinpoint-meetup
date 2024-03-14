import { Injector } from "@sailplane/injector";
import { PersonalizeRuntimeClient, GetRecommendationsCommand } from "@aws-sdk/client-personalize-runtime"
import { CreateCampaignCommand, CreateSolutionVersionCommand, PersonalizeClient } from '@aws-sdk/client-personalize'
import { EnvKeys, getEnvVariable } from "../env";
import { Logger } from "@sailplane/logger";

const logger = new Logger('AWSPersonalizeMovieRecommender')

export class AWSPersonalizeMovieRecommender {
  constructor(private personalizeClient: PersonalizeClient, private personalizeRuntimeClient: PersonalizeRuntimeClient) {}

  async createMoviesRecommendations() {
    const solutionVersionRequest = new CreateSolutionVersionCommand({
      trainingMode: 'FULL',
      solutionArn: getEnvVariable(EnvKeys.PERSONALIZATION_SOLUTION_ARN),
    })
    logger.info('Creating personalize solution version...')
    const { solutionVersionArn } = await this.personalizeClient.send(solutionVersionRequest)
    logger.info('Personalize solution version created.')

    if (solutionVersionArn == null) {
      throw new Error('Personalize solution version arn is null, please retry')
    }

    const campaignRequest = new CreateCampaignCommand({
      name: 'personalization-campaign',
      solutionVersionArn: solutionVersionArn,
    })
    logger.info('Creating personalize campaign version...')
    const { campaignArn } = await this.personalizeClient.send(campaignRequest)
    logger.info('Personalize campaign created.')
    // Save ARN the easiest way to retrieve it
  }

  async getMoviesIdsRecommendations(userId: string, numberOfResults: number): Promise<string[]> {
    const request = new GetRecommendationsCommand({
      // campaignArn: getEnvVariable(EnvKeys.PERSONALIZATION_CAMPAIGN_ARN),
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
  return new AWSPersonalizeMovieRecommender(client, runTimeClient)
}

Injector.register(AWSPersonalizeMovieRecommender, create)