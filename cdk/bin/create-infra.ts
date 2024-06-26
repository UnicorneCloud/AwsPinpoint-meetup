import * as cdk from 'aws-cdk-lib'
import { KinesisStack, LambdasStack, PersonalizeStack, PinpointStack, S3Stack } from '../lib'
import { ProjectDefaultLambdaProps } from '../lib/compute/DefaultProps'
import { MainStackConfig } from '../common'

const app = new cdk.App()

const commonConfig = MainStackConfig

const s3Stack = new S3Stack(app, 'uni-streaming-s3-stack', { ...commonConfig })

const kinesisStack = new KinesisStack(app, 'uni-streaming-kinesis-stack', { ...commonConfig, bucket: s3Stack.bucket })

const pinpointStack = new PinpointStack(app, 'uni-streaming-pinpoint-stack', { ...commonConfig, kinesis: kinesisStack.stream, fireHose: kinesisStack.fireHose })

const personalizeStack = new PersonalizeStack(app, 'UniStreamingPersonalize', { ...commonConfig, bucket: s3Stack.bucket })

const lambdaEnv = {
  REGION: commonConfig.region,
  DATASET_GROUP_ARN: personalizeStack.datasetGroup.attrDatasetGroupArn,
  PERSONALIZATION_SOLUTION_ARN: personalizeStack.personalizationSolution.attrSolutionArn,
  PERSONALIZATION_RECIPE_ARN: personalizeStack.personalizationSolution.recipeArn || '',
  TRENDING_NOW_SOLUTION_ARN: personalizeStack.trendingItemsSolution.attrSolutionArn,
  TRENDING_NOW_RECIPE_ARN: personalizeStack.trendingItemsSolution.recipeArn || '',
  PINPOINT_APP_ID: pinpointStack.appId,
  BUCKET_NAME: s3Stack.bucket.bucketName,
  RECOMMENDER_ROLE_ARN: pinpointStack.recommenderRole.roleArn,
  WEBAPP_SEGMENT_ID: pinpointStack.webAppSegment.attrSegmentId,
}

new LambdasStack(app, 'uni-streaming-movies-stack', {
  bucket: s3Stack.bucket,
  lambdaProps: {
    ...ProjectDefaultLambdaProps,
    environment: lambdaEnv
  }
})