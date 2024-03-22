# AWS Pinpoint and Personalize - AWS meetup Quebec april 2024

## Description

Code repository for the AWS meetup Quebec april 2024. In this repository, we explore AWS Pinpoint (Segments, Campaigns and Journeys) in order to achieve user engagement in our fake platform UniStreaming. We also use AWS Personalize to create custom user engagement through AI models.

### Use cases explored

#### AWS Personalize

- Creation of AI models:
  - Custom user recommendations (user-personalization)
  - Trending now movies (trending-now)

#### AWS Pinpoint

- Creating user segments in AWS Pinpoint
- Creating email campaigns in AWS Pinpoint
  - Campaign to promote new movie on platform based on user that watched the first movie
  - Weekly campaign to promote custom user recommendations based on AWS Personalize AI models and recommendations
- Creating journeys in AWS Pinpoint
  - Create a journey where "dormant users" receive an email of trending movies on the platform based on AWS Personalize AI models and recommendations

#### Here is the miro board of all the use cases explored: https://miro.com/app/board/uXjVMFtpOqU=/

## Development

### Data generation for AI models

We need to create the base data for our models. AWS personalize needs 3 types of dataset:

- Items
- Users
- ItemInteractions

In order to create those datasets you can run these commands which will create csv files that you will need to put in the s3 bucket created by the CDK code:

`cd backend/data-generation`

#### To install dependencies:

`yarn`

#### Generate data in csv files

`npx tsx generateData.ts`

`npx tsx generateUserDemographics.ts`

### CDK

To deploy the infra, You can run. You might want to modify the package.json in order to specify the right profile for your account:

`cd cdk`

#### To install dependencies:

`yarn`

#### Check Cloudformation diff

`yarn diff`

#### Deployment

`yarn deploy --require-approval never`
