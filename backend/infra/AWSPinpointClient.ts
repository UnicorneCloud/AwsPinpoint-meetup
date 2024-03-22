import { CreateCampaignCommand, CreateEmailTemplateCommand, CreateRecommenderConfigurationCommand, CreateSegmentCommand, EventsBatch, PinpointClient, PutEventsCommand } from '@aws-sdk/client-pinpoint'
import { Injector } from '@sailplane/injector'
import { Logger } from '@sailplane/logger'

import { Event, Movie, User } from '../domain'
import { EnvKeys, getEnvVariable } from '../env'
import { SSMStore, StoreKeys } from './SSMStore'
import { recommendationTemplate } from './emails'

const MAX_LENGTH = 200

export enum CHANNEL_TYPES {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  VOICE = 'VOICE',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum OPT_OUT_TYPES {
  NONE = 'NONE',
  ALL = 'ALL'
}

export enum ENDPOINT_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export type EventParam<T extends Record<string, string>> = {
  event: Event<T>
  user: User
}

const logger = new Logger('AWSPinpointClient')

export class AWSPinpointClient {
  constructor(private client: PinpointClient, private appId: string, private ssmStore: SSMStore) {}

  private toEndpointAttributes(data: Record<string, string>): Record<string, string[]> {
    const keys = Object.keys(data)
    const attributes: Record<string, string[]> = {}
    keys.forEach((key) => {
      if (data[key] != null && data[key].length < MAX_LENGTH) {
        attributes[key] = [data[key]]
      }
    })
    return attributes
  }

  private stripLongAttributes(data: Record<string, string>): Record<string, string> {
    const keys = Object.keys(data)
    const attributes: Record<string, string> = {}
    keys.forEach((key) => {
      if (data[key] != null && data[key].length < MAX_LENGTH) {
        attributes[key] = data[key]
      }
    })
    return attributes
  }

  async createDidNotWatchSegment(movie: Movie, segmentName: string): Promise<string> {
    const request = new CreateSegmentCommand({
      ApplicationId: getEnvVariable(EnvKeys.PINPOINT_APP_ID),
      WriteSegmentRequest: {
        Name: segmentName,
        SegmentGroups: {
          Groups: [
            {
              Dimensions: [
                {
                  Attributes: {
                    Name: {
                      AttributeType: 'EXCLUSIVE',
                      Values: [movie.Name],
                    },
                  }
                }
              ]
            }
          ],
          Include: 'ANY',
        }
      }
    })

    const { SegmentResponse } = await this.client.send(request)
    logger.info('Creating segment response', SegmentResponse)

    if (SegmentResponse && SegmentResponse.Id && SegmentResponse.Id !== '') {
      return SegmentResponse.Id
    }

    throw new Error('Segment could not be created')
  }

  async createCampaignForTrendingMovie(movie: Movie, campaignName: string, segmentId: string): Promise<string> {
    const request = new CreateCampaignCommand({
      ApplicationId: getEnvVariable(EnvKeys.PINPOINT_APP_ID),
      WriteCampaignRequest: {
        Name: campaignName,
        SegmentId: segmentId,
        Schedule: {
          Frequency: 'ONCE',
          IsLocalTime: true,
          StartTime: 'IMMEDIATE',
          Timezone: 'UTC-04'
        },
        HoldoutPercent: 99,
        MessageConfiguration: {
          EmailMessage: {
            FromAddress: 'uni-streaming@unicornpowered.io',
            Title: `${movie.Name} is trending now!`,
            Body: `You might want to watch this trending movie: ${movie.Name} - ${movie.Category} - ${movie.Description}`,
          }
        }
      }
    })

    const { CampaignResponse } = await this.client.send(request)
    logger.info('Creating campaign response', CampaignResponse)

    if (CampaignResponse && CampaignResponse.Id && CampaignResponse.Id !== '') {
      return CampaignResponse.Id
    }

    throw new Error('CampaignResponse could not be created')
  }

  async createRecommenderModel(modelName: string): Promise<void> {
    const recommenderArn = await this.ssmStore.get(StoreKeys.PERSONALIZATION_CAMPAIGN_ARN)
    const request = new CreateRecommenderConfigurationCommand({
      CreateRecommenderConfiguration: {
        Name: modelName,
        RecommendationProviderRoleArn: getEnvVariable(EnvKeys.RECOMMENDER_ROLE_ARN),
        RecommendationsPerMessage: 5,
        RecommendationProviderUri: recommenderArn,
        RecommendationTransformerUri: getEnvVariable(EnvKeys.ENHANCED_RECOMMENDATIONS_ARN),
        RecommendationProviderIdType: 'PINPOINT_ENDPOINT_ID',
        Attributes: {
          'Recommendations.Name': 'Name',
          'Recommendations.Category': 'Category',
          'Recommendations.Description': 'Description',
        }
      }
    })
    const { RecommenderConfigurationResponse } = await this.client.send(request)
    logger.info('Response', RecommenderConfigurationResponse)

    if (RecommenderConfigurationResponse && RecommenderConfigurationResponse.Id) {
      await this.ssmStore.put(StoreKeys.RECOMMENDER_ID, RecommenderConfigurationResponse.Id)
    } else {
      throw new Error('Recommender model could not be created')
    }
  }

  async createRecommendationsTemplate(templateName: string): Promise<void> {
    const recommenderId = await this.ssmStore.get(StoreKeys.RECOMMENDER_ID)
    const request = new CreateEmailTemplateCommand({
      TemplateName: templateName,
      EmailTemplateRequest: {
        Subject: 'See your weekly recommendations!',
        HtmlPart: recommendationTemplate,
        RecommenderId: recommenderId,
      }
    })

    const { CreateTemplateMessageBody } = await this.client.send(request)

    if (CreateTemplateMessageBody) {
      await this.ssmStore.put(StoreKeys.RECOMMENDATIONS_TEMPLATE_NAME, templateName)
    } else {
      throw new Error('Template could not be created')
    }
  }

  async createWeeklyRecommendationsCampaign(campaignName: string): Promise<void> {
    const templateName = await this.ssmStore.get(StoreKeys.RECOMMENDATIONS_TEMPLATE_NAME)
    const now = new Date()
    now.setHours(10)
    now.setMinutes(30)
    const request = new CreateCampaignCommand({
      ApplicationId: getEnvVariable(EnvKeys.PINPOINT_APP_ID),
      WriteCampaignRequest: {
        Name: campaignName,
        SegmentId: getEnvVariable(EnvKeys.WEBAPP_SEGMENT_ID),
        HoldoutPercent: 99,
        Schedule: {
          // Set up this date to what you want
          StartTime: now.toISOString(),
          Frequency: 'WEEKLY',
          Timezone: 'UTC-04',
          // Set up this date to what you want
          EndTime: new Date(2024, 3, 20, 14, 30, 0).toISOString()
        },
        MessageConfiguration: {
          EmailMessage: {
            FromAddress: 'uni-streaming@unicornpowered.io',
          }
        },
        TemplateConfiguration: {
          EmailTemplate: {
            Name: templateName,
          }
        }
      }
    })

    const { CampaignResponse } = await this.client.send(request)
    logger.info('Response from campaign creation', CampaignResponse)
  }

  async sendEvents<T extends Record<string, string>>(params: EventParam<T>[]): Promise<void> {
    const batch: Record<string, EventsBatch> = params.reduce((acc, param) => {
      const { user, event } = param
      const prefix = user.Email.split('@')[0]
      acc[user.Id] = {
        Endpoint: {
          Address: `philippe.trepanier+${prefix}@unicorne.cloud`,
          Attributes: {
            ...this.toEndpointAttributes(event.Attributes),
            Type: [event.Type],
          },
          Demographic: event.Demographic,
          Location: event.Location,
          ChannelType: CHANNEL_TYPES.EMAIL,
          EndpointStatus: ENDPOINT_STATUS.ACTIVE,
          User: {
            UserId: user.Id,
            UserAttributes: {
              Email: [user.Email],
              Id: [user.Id]
            }
          },
          OptOut: OPT_OUT_TYPES.NONE,
        },
        Events: {
          [event.Id]: {
            Attributes: this.stripLongAttributes(event.Attributes),
            EventType: event.Type.toString(),
            Timestamp: event.Timestamp.toISOString(),
          }
        }
      }
      return acc
    }, {} as Record<string, EventsBatch>)

    const command = new PutEventsCommand({
      ApplicationId: this.appId,
      EventsRequest: {
        BatchItem: batch
      }
    })
    const { EventsResponse } = await this.client.send(command)
    logger.info('Results from put events', EventsResponse?.Results)
  }
}

const createClient = (): AWSPinpointClient => {
  const client = new PinpointClient({ region: getEnvVariable(EnvKeys.REGION) })
  const appId = getEnvVariable(EnvKeys.PINPOINT_APP_ID)
  return new AWSPinpointClient(client, appId, Injector.get(SSMStore)!)
}

Injector.register(AWSPinpointClient, createClient)