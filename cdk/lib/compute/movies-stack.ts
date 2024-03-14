import { Duration, Stack, StackProps, aws_lambda_nodejs as lambdaNodeJs,} from 'aws-cdk-lib';
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

    const lambdaRole = new iam.Role(this, 'uni-streaming-lambda-roles', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    })

    lambdaRole.attachInlinePolicy(new iam.Policy(this, 'uni-streaming-lambda-roles-inline-policy', {
      statements: [
        new iam.PolicyStatement({
          actions: ['personalize:*'],
          resources: ['arn:aws:personalize:ca-central-1:392199159898:*']
        }),
        new iam.PolicyStatement({
          actions: [
            'ssm:GetParameter',
            'ssm:PutParameter',
          ],
          resources: ['*']
        }),
      ]
    }))

    const getMoviesRecommendationsHandler = new lambdaNodeJs.NodejsFunction(this, 'get-movies-recommendations-handler', {
      ...lambdaProps,
      entry: '../backend/infra/handlers/get-movies-recommendations.ts',
      role: lambdaRole,
    })
    bucket.grantRead(getMoviesRecommendationsHandler)

    const createPersonalizationSolutionVersion = new lambdaNodeJs.NodejsFunction(this, 'create-personalization-solution-version-handler', {
      ...lambdaProps,
      timeout: Duration.minutes(15),
      entry: '../backend/infra/handlers/create-personalize-solution-version.ts',
      role: lambdaRole,
    })
    bucket.grantRead(createPersonalizationSolutionVersion)

    const createPersonalizationCampaign = new lambdaNodeJs.NodejsFunction(this, 'create-personalization-campaign-handler', {
      ...lambdaProps,
      timeout: Duration.minutes(15),
      entry: '../backend/infra/handlers/create-personalize-campaigns.ts',
      role: lambdaRole,
    })
    bucket.grantRead(createPersonalizationCampaign)
  }
}