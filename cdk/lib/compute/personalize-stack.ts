import { Construct } from 'constructs';
import * as personalize from 'aws-cdk-lib/aws-personalize';
import { Stack } from 'aws-cdk-lib';

export class PersonalizeStack extends Stack {

  constructor(scope: Construct, id: string) {
    super(scope, id)

    const datasetGroup = new personalize.CfnDatasetGroup(this, 'UniStreamingDatasetGroup', {
      name: 'UniStreamingDatasetGroup',
    })

    new personalize.CfnSolution(this, 'UniStreamingHRRN', {
      name: 'UniStreamingPersonalize',
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
      recipeArn: 'arn:aws:personalize:::recipe/aws-hrnn',
    })

    new personalize.CfnSolution(this, 'UniStreamingHRRNColdstart', {
      name: 'UniStreamingPersonalize',
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
      recipeArn: 'arn:aws:personalize:::recipe/aws-hrnn-coldstart',
    })

    new personalize.CfnSolution(this, 'UniStreamingHRRNMeta', {
      name: 'UniStreamingPersonalize',
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
      recipeArn: 'arn:aws:personalize:::recipe/aws-hrnn-metadata',
    })

    new personalize.CfnSolution(this, 'UniStreamingPersonalizedRanking', {
      name: 'UniStreamingPersonalize',
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
      recipeArn: 'arn:aws:personalize:::recipe/aws-personalized-ranking',
    })

    new personalize.CfnSolution(this, 'UniStreamingPopularityCount', {
      name: 'UniStreamingPersonalize',
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
      recipeArn: 'arn:aws:personalize:::recipe/aws-popularity-count',
    })

    new personalize.CfnSolution(this, 'UniStreamingSims', {
      name: 'UniStreamingPersonalize',
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
      recipeArn: 'arn:aws:personalize:::recipe/aws-sims',
    })
  }
}