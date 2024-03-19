import { Injector } from "@sailplane/injector";
import { v4 as uuidv4 } from 'uuid'
import { PersonalizeRuntimeClient, GetRecommendationsCommand, PredictedItem } from "@aws-sdk/client-personalize-runtime"
import { PersonalizeEventsClient, PutEventsCommand } from '@aws-sdk/client-personalize-events'
import { CreateCampaignCommand, CreateEventTrackerCommand, CreateSolutionVersionCommand, PersonalizeClient } from '@aws-sdk/client-personalize'

import { EnvKeys, getEnvVariable } from "../env";
import { Logger } from "@sailplane/logger";
import { SSMStore, StoreKeys } from "./SSMStore";
import { Event, User } from "../domain";
import { exponentialBackoff } from "./exponentialBackoff";

const logger = new Logger('AWSPersonalizeRecommender')

export type EventParam<T extends Record<string, string>> = {
  event: Event<T>
  user: User
}

export class AWSPersonalizeRecommender {
  constructor(private personalizeClient: PersonalizeClient, private personalizeRuntimeClient: PersonalizeRuntimeClient, private personalizeEventsClient: PersonalizeEventsClient, private ssmStore: SSMStore) {}

  async createEventTracker(datasetGroupArn: string, name: string): Promise<void> {
    const request = new CreateEventTrackerCommand({
      name: name,
      datasetGroupArn: datasetGroupArn,
    })
    logger.info('Creating event tracker...')
    const { eventTrackerArn, trackingId } = await this.personalizeClient.send(request)

    if (eventTrackerArn == null || trackingId == null) {
      throw new Error('Tracker arn or tracking id not available')
    }

    await this.ssmStore.put(StoreKeys.EVENT_TRACKER_TRACKING_ID, trackingId)
    await this.ssmStore.put(StoreKeys.EVENT_TRACKER_ARN, eventTrackerArn)
  }

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

  private filterListItems(items?: PredictedItem[]): string[] {
    if (items) {
      return items
        .filter(item => item.itemId != null)
        .map(item => item.itemId) as string[]
    }

    return []
  }

  async getMoviesIdsRecommendations(userId: string, numberOfResults: number): Promise<string[]> {
    const campaignArn = await this.ssmStore.get(StoreKeys.PERSONALIZATION_CAMPAIGN_ARN)
    const request = new GetRecommendationsCommand({
      campaignArn: campaignArn,
      userId: userId,
      numResults: numberOfResults,
    })
    const { itemList } = await this.personalizeRuntimeClient.send(request)

    return this.filterListItems(itemList)
  }

  async getTrendingMovieIds(numberOfResults: number): Promise<string[]> {
    const campaignArn = await this.ssmStore.get(StoreKeys.TRENDING_NOW_CAMPAIGN_ARN)
    const request = new GetRecommendationsCommand({
      campaignArn: campaignArn,
      numResults: numberOfResults,
    })
    const { itemList } = await this.personalizeRuntimeClient.send(request)

    return this.filterListItems(itemList)
  }

  async putEvent<T extends Record<string, string>>(params: EventParam<T>): Promise<void> {
    const sessionId = uuidv4()
    const { event, user } = params
    const trackingId = await this.ssmStore.get(StoreKeys.EVENT_TRACKER_TRACKING_ID)
    const request = new PutEventsCommand({
      trackingId: trackingId,
      userId: user.Id,
      sessionId: sessionId,
      eventList: [
        {
          properties: JSON.stringify(event.Attributes),
          eventId: event.Id,
          eventType: event.Type,
          itemId: event.Attributes.Id,
          sentAt: event.Timestamp,
          metricAttribution: {
            eventAttributionSource: event.Demographic.AppVersion,
          }
        }
      ]
    })
    logger.info('Sending events to personalize')
    const { $metadata } = await exponentialBackoff(
      () => this.personalizeEventsClient.send(request),
      (error) => error.name === 'ThrottlingException',
      5,
    )
    logger.info('Metadata response from sending events in personalize', $metadata)
  }
}

const create = () => {
  const region = getEnvVariable(EnvKeys.REGION)
  const client = new PersonalizeClient({ region: region })
  const runTimeClient = new PersonalizeRuntimeClient({ region: region })
  const eventsClient = new PersonalizeEventsClient({ region: region })
  const ssmStore = Injector.get(SSMStore)!
  return new AWSPersonalizeRecommender(client, runTimeClient, eventsClient, ssmStore)
}

Injector.register(AWSPersonalizeRecommender, create)