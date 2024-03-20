import { Duration, Stack, StackProps, aws_lambda_nodejs as lambdaNodeJs,} from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

export interface LambdasStackProps extends StackProps {
  bucket: s3.IBucket
  lambdaProps: lambdaNodeJs.NodejsFunctionProps,
}

export class LambdasStack extends Stack {

  constructor(scope: Construct, id: string, props: LambdasStackProps) {
    super(scope, id, props)

    const { bucket, lambdaProps } = props

    const lambdaRole = new iam.Role(this, 'uni-streaming-lambda-roles', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    })

    lambdaRole.attachInlinePolicy(new iam.Policy(this, 'uni-streaming-lambda-roles-inline-policy', {
      statements: [
        new iam.PolicyStatement({
          actions: [
            'logs:*'
          ],
          resources: ['*']
        }),
        // https://docs.aws.amazon.com/personalize/latest/dg/security_iam_id-based-policy-examples.html
        new iam.PolicyStatement({
          actions: ['personalize:*'],
          resources: [`*`]
        }),
        new iam.PolicyStatement({
          actions: [
            'ssm:GetParameter',
            'ssm:PutParameter',
          ],
          resources: ['*']
        }),
        new iam.PolicyStatement({
          actions: ['mobiletargeting:*'],
          resources: [`arn:aws:mobiletargeting:${this.region}:${this.account}:*`],
        }),
        new iam.PolicyStatement({
          actions: [
            'ses:Get*',
            'kinesis:ListStreams',
            'firehose:ListDeliveryStreams',
            'iam:ListRoles',
            'ses:List*',
            'sns:ListTopics',
            'ses:Describe*',
            's3:List*'
          ],
          resources: ["*"],
          conditions: {
            StringEquals: {
              'aws:SourceAccount': this.account
            }
          }
        })
      ]
    }))

    const enhancedRecommendationsHandler = new lambdaNodeJs.NodejsFunction(this, 'enhanced-movies-recommendations-handler', {
      ...lambdaProps,
      entry: '../backend/infra/handlers/enhanced-personalize-recommendations.ts',
      role: lambdaRole,
    })
    enhancedRecommendationsHandler.addPermission('enhanced-recommendations-handler-pinpoint-permission',
      // https://docs.aws.amazon.com/pinpoint/latest/developerguide/ml-models-rm-lambda.html
      {
        action: 'lambda:InvokeFunction',
        principal: new iam.ServicePrincipal('pinpoint.amazonaws.com'),
        sourceArn: `arn:aws:mobiletargeting:${this.region}:${this.account}:recommenders/*`,
      },
    )
    bucket.grantRead(enhancedRecommendationsHandler)

    const getMoviesRecommendationsHandler = new lambdaNodeJs.NodejsFunction(this, 'get-movies-recommendations-handler', {
      ...lambdaProps,
      entry: '../backend/infra/handlers/get-movies-recommendations.ts',
      role: lambdaRole,
    })
    bucket.grantRead(getMoviesRecommendationsHandler)

    const getTrendingMoviesHandler = new lambdaNodeJs.NodejsFunction(this, 'get-trending-movies-handler', {
      ...lambdaProps,
      entry: '../backend/infra/handlers/get-trending-movies.ts',
      role: lambdaRole,
    })
    bucket.grantRead(getTrendingMoviesHandler)

    const createTrendingMovieCampaignHandler = new lambdaNodeJs.NodejsFunction(this, 'create-trending-movie-campaign-handler', {
      ...lambdaProps,
      entry: '../backend/infra/handlers/create-trending-movie-campaign.ts',
      role: lambdaRole,
    })
    bucket.grantRead(createTrendingMovieCampaignHandler)

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

    const createTrendingNowItemsSolutionVersion = new lambdaNodeJs.NodejsFunction(this, 'create-trending-now-items-solution-version-handler', {
      ...lambdaProps,
      timeout: Duration.minutes(15),
      entry: '../backend/infra/handlers/create-trending-now-items-solution-version.ts',
      role: lambdaRole,
    })
    bucket.grantRead(createTrendingNowItemsSolutionVersion)

    const createTrendingNowItemsCampaign = new lambdaNodeJs.NodejsFunction(this, 'create-trending-now-items-campaign-handler', {
      ...lambdaProps,
      timeout: Duration.minutes(15),
      entry: '../backend/infra/handlers/create-trending-now-items-campaigns.ts',
      role: lambdaRole,
    })
    bucket.grantRead(createTrendingNowItemsCampaign)

    const createDatasetEventsTracker = new lambdaNodeJs.NodejsFunction(this, 'create-dataset-events-tracker', {
      ...lambdaProps,
      timeout: Duration.minutes(15),
      entry: '../backend/infra/handlers/create-personalize-event-tracker.ts',
      role: lambdaRole,
    })
    bucket.grantRead(createDatasetEventsTracker)

    const createUsersInteractions = new lambdaNodeJs.NodejsFunction(this, 'create-users-interactions-handler', {
      ...lambdaProps,
      timeout: Duration.minutes(10),
      entry: '../backend/infra/handlers/create-users-interactions.ts',
      role: lambdaRole,
    })
    bucket.grantRead(createUsersInteractions)

    const createUserInteractionsRule = new events.Rule(this, 'uni-streaming-create-interactions-daily', {
      schedule: events.Schedule.cron({ minute: '0', hour: '0' }),
    })
    createUserInteractionsRule.addTarget(new targets.LambdaFunction(createUsersInteractions))
  }
}