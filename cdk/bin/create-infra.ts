import * as cdk from 'aws-cdk-lib'
import { MoviesStack, PersonalizeStack, S3Stack } from '../lib'
import { ProjectDefaultLambdaProps } from '../lib/compute/DefaultProps'

const app = new cdk.App()

const s3Stack = new S3Stack(app, 'uni-streaming-s3-stack')

const personalizeStack = new PersonalizeStack(app, 'UniStreamingPersonalize', { bucket: s3Stack.bucket })

const lambdaEnv = {
  DATASET_GROUP_ARN: personalizeStack.datasetGroup.attrDatasetGroupArn,
  PERSONALIZATION_SOLUTION_ARN: personalizeStack.personalizationSolution.attrSolutionArn,
  PERSONALIZATION_RECIPE_ARN: personalizeStack.personalizationSolution.recipeArn || '',
}

new MoviesStack(app, 'uni-streaming-movies-stack', {
  bucket: s3Stack.bucket,
  lambdaProps: {
    ...ProjectDefaultLambdaProps,
    environment: lambdaEnv
  }
})