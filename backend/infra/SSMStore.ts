import { GetParameterCommand, PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { Injector } from "@sailplane/injector";
import { EnvKeys, getEnvVariable } from "../env";

export enum StoreKeys {
  PERSONALIZATION_SOLUTION_VERSION_ARN = 'PERSONALIZATION_SOLUTION_VERSION_ARN',
  PERSONALIZATION_CAMPAIGN_ARN = 'PERSONALIZATION_CAMPAIGN_ARN',
  TRENDING_NOW_SOLUTION_VERSION_ARN = 'TRENDING_NOW_SOLUTION_VERSION_ARN',
  TRENDING_NOW_CAMPAIGN_ARN = 'TRENDING_NOW_CAMPAIGN_ARN',
  EVENT_TRACKER_TRACKING_ID = 'EVENT_TRACKER_TRACKING_ID',
  EVENT_TRACKER_ARN = 'EVENT_TRACKER_ARN',
  RECOMMENDER_ID = 'RECOMMENDER_ID',
  RECOMMENDATIONS_TEMPLATE_NAME = 'RECOMMENDATIONS_TEMPLATE_NAME',
}

export class SSMStore {
  private cache: Record<StoreKeys, string>

  constructor(private client: SSMClient) {
    this.cache = {} as Record<StoreKeys, string>
  }

  async put(key: StoreKeys, value: string) {
    await this.client.send(new PutParameterCommand({
      Name: key,
      Value: value,
      Type: 'String',
      Overwrite: true,
    }))
  }

  async get(key: StoreKeys) {
    if (this.cache[key] != null) {
      return this.cache[key]
    }

    const { Parameter } = await this.client.send(new GetParameterCommand({
      Name: key,
    }))

    if (Parameter?.Value && Parameter?.Value !== '') {
      return Parameter.Value
    }

    throw new Error(`Parameter with key (${key}) not found`)
  }
}

const create = () => new SSMStore(new SSMClient({ region: getEnvVariable(EnvKeys.REGION) }))

Injector.register(SSMStore, create)