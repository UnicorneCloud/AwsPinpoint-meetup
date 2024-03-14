import { Stack, StackProps, aws_lambda_nodejs as lambdaNodeJs,} from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface MoviesStackProps extends StackProps {
  bucket: s3.IBucket
  lambdaProps: lambdaNodeJs.NodejsFunctionProps,
}

export class MoviesStack extends Stack {

  constructor(scope: Construct, id: string, props: MoviesStackProps) {
    super(scope, id, props)

    const { bucket, lambdaProps } = props

    const lambdaRole = new iam.Role(this, 'get-movies-recommendations-role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    })

    lambdaRole.attachInlinePolicy(new iam.Policy(this, 'get-movies-recommendations-inline-policy', {
      statements: [
        new iam.PolicyStatement({
          actions: ['personalize:GetRecommendations'],
          resources: ['arn:aws:personalize:ca-central-1:392199159898:campaign/test-campaigns', 'arn:aws:personalize:ca-central-1:392199159898:campaign/test-personalization-campaign']
        })
      ]
    }))

    // Lambda function
    const getMoviesRecommendationsHandler = new lambdaNodeJs.NodejsFunction(this, 'get-movies-recommendations-handler', {
      ...lambdaProps,
      entry: '../backend/infra/handlers/get-movies-recommendations.ts',
      role: lambdaRole,
    })

    bucket.grantRead(getMoviesRecommendationsHandler)
  }
}