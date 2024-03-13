import { Stack, StackProps, aws_lambda_nodejs as lambdaNodeJs,} from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ProjectDefaultLambdaProps } from './DefaultProps';

export interface MoviesStackProps extends StackProps {
  bucket: s3.IBucket
}

export class MoviesStack extends Stack {

  constructor(scope: Construct, id: string, props: MoviesStackProps) {
    super(scope, id, props)

    const { bucket } = props

    const lambdaRole = new iam.Role(this, 'get-movies-recommendations-role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    })

    // Lambda function
    const getMoviesRecommendationsHandler = new lambdaNodeJs.NodejsFunction(this, 'get-movies-recommendations-handler', {
      ...ProjectDefaultLambdaProps,
      entry: '../backend/infra/handlers/get-movies-recommendations.ts',
      role: lambdaRole,
    })

    // Grant Lambda access to S3
    getMoviesRecommendationsHandler.role?.attachInlinePolicy(new iam.Policy(this, 'get-movies-recommendations-inline-policy', {
      statements: [
        new iam.PolicyStatement({
          actions: ['s3:GetObject'],
          resources: ['arn:aws:s3:::test-meetup-personalize', 'arn:aws:s3:::test-meetup-personalize/*']
        }),
        new iam.PolicyStatement({
          actions: ['personalize:GetRecommendations'],
          resources: ['arn:aws:personalize:ca-central-1:392199159898:campaign/test-campaigns']
        })
      ]
    }))
  }
}