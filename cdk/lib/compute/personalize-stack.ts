import { Construct } from 'constructs';
import * as personalize from 'aws-cdk-lib/aws-personalize';
import { Stack } from 'aws-cdk-lib';

export class PersonalizeStack extends Stack {

  constructor(scope: Construct, id: string) {
    super(scope, id)

    const datasetGroup = new personalize.CfnDatasetGroup(this, 'UniStreamingDatasetGroup', {
      name: 'UniStreamingDatasetGroup',
      domain: 'VIDEO_ON_DEMAND',
    })

    new personalize.CfnSolution(this, 'UniStreamingPersonalize', {
      name: 'UniStreamingPersonalize',
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
    })
  }
}