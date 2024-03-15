import { v4 as uuidv4 } from 'uuid'
import { EventsBatch, PinpointClient, PutEventsCommand } from '@aws-sdk/client-pinpoint'
import { Injector } from '@sailplane/injector'
import { Logger } from '@sailplane/logger'

import { Event, User } from '../domain'
import { EnvKeys, getEnvVariable } from '../env'

const MAX_LENGTH = 200

export enum CHANNEL_TYPES {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  VOICE = 'VOICE',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum OPT_OUT_TYPES {
  NONE = "NONE",
  ALL = "ALL"
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
  constructor(private client: PinpointClient, private appId: string) {}

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

  public async sendEvents<T extends Record<string, string>>(params: EventParam<T>[]): Promise<void> {
    const batch: Record<string, EventsBatch> = params.reduce((acc, param) => {
      const { user, event } = param
      const eventId = uuidv4()
      acc[eventId] = {
        Endpoint: {
          Address: user.Email,
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
          [eventId]: {
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
  return new AWSPinpointClient(client, appId)
}

Injector.register(AWSPinpointClient, createClient)