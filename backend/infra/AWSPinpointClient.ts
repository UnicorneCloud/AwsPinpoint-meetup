import { v4 as uuidv4 } from 'uuid'
import { PinpointClient, PutEventsCommand } from '@aws-sdk/client-pinpoint'
import { Injector } from '@sailplane/injector'

import { Event, User } from '../domain'
import { EnvKeys, getEnvVariable } from '../env'

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

export class AWSPinpointClient {
  constructor(private client: PinpointClient, private appId: string) {}

  private toEndpointAttributes(data: Record<string, string>): Record<string, string[]> {
    const keys = Object.keys(data)
    const attributes: Record<string, string[]> = {}
    keys.forEach((key) => attributes[key] = [data[key]])
    return attributes
  }

  public async sendEvent<T extends Record<string, string>>(event: Event<T>, user: User): Promise<void> {
    const eventId = uuidv4()
    const command = new PutEventsCommand({
      ApplicationId: this.appId,
      EventsRequest: {
        BatchItem: {
          [eventId]: {
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
                Attributes: event.Attributes,
                EventType: event.Type.toString(),
                Timestamp: event.Timestamp.toISOString(),
              }
            }
          },
        }
      }
    })
    await this.client.send(command)
  }
}

const createClient = (): AWSPinpointClient => {
  const client = new PinpointClient({ region: getEnvVariable(EnvKeys.REGION) })
  const appId = getEnvVariable(EnvKeys.PINPOINT_APP_ID)
  return new AWSPinpointClient(client, appId)
}

Injector.register(AWSPinpointClient, createClient)