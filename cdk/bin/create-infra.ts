import * as cdk from 'aws-cdk-lib'
import { KinesisStack, MoviesStack, PersonalizeStack, PinpointStack, S3Stack } from '../lib'
import { ProjectDefaultLambdaProps } from '../lib/compute/DefaultProps'
import { MainStackConfig } from '../common'

const app = new cdk.App()

const commonConfig = MainStackConfig

const s3Stack = new S3Stack(app, 'uni-streaming-s3-stack', { ...commonConfig })

const kinesisStack = new KinesisStack(app, 'uni-streaming-kinesis-stack', { ...commonConfig, bucket: s3Stack.bucket })

const pinpointStack = new PinpointStack(app, 'uni-streaming-pinpoint-stack', { ...commonConfig, kinesis: kinesisStack.stream })

const personalizeStack = new PersonalizeStack(app, 'UniStreamingPersonalize', { ...commonConfig, bucket: s3Stack.bucket })

const lambdaEnv = {
  REGION: commonConfig.region,
  DATASET_GROUP_ARN: personalizeStack.datasetGroup.attrDatasetGroupArn,
  PERSONALIZATION_SOLUTION_ARN: personalizeStack.personalizationSolution.attrSolutionArn,
  PERSONALIZATION_RECIPE_ARN: personalizeStack.personalizationSolution.recipeArn || '',
  PINPOINT_APP_ID: pinpointStack.appId,
}

new MoviesStack(app, 'uni-streaming-movies-stack', {
  bucket: s3Stack.bucket,
  lambdaProps: {
    ...ProjectDefaultLambdaProps,
    environment: lambdaEnv
  }
})