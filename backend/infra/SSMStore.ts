import { GetParameterCommand, PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { Injector } from "@sailplane/injector";

export enum StoreKeys {
  PERSONALIZATION_SOLUTION_VERSION_ARN = 'PERSONALIZATION_SOLUTION_VERSION_ARN',
  PERSONALIZATION_CAMPAIGN_ARN = 'PERSONALIZATION_CAMPAIGN_ARN',
}

export class SSMStore {
  constructor(private client: SSMClient) {}

  async put(key: StoreKeys, value: string) {
    await this.client.send(new PutParameterCommand({
      Name: key,
      Value: value,
      Type: 'String',
      Overwrite: true,
    }))
  }

  async get(key: StoreKeys) {
    const { Parameter } = await this.client.send(new GetParameterCommand({
      Name: key,
    }))

    if (Parameter?.Value && Parameter?.Value !== '') {
      return Parameter.Value
    }

    throw new Error(`Parameter with key (${key}) not found`)
  }
}

const create = () => new SSMStore(new SSMClient({ region: 'ca-central-1' }))

Injector.register(SSMStore, create)