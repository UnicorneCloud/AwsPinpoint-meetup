import { Construct } from 'constructs';
import * as personalize from 'aws-cdk-lib/aws-personalize';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';
import { PersonalizeInteractionSchema, PersonalizeItemsSchema, PersonalizeUserSchema } from './schemas';
import { ProjectStackProps } from '~/cdk/common';

export interface PersonalizeStackProps extends ProjectStackProps {
  bucket: s3.IBucket
}

export class PersonalizeStack extends Stack {
  datasetGroup: personalize.CfnDatasetGroup;
  personalizationSolution: personalize.CfnSolution

  constructor(scope: Construct, id: string, props: PersonalizeStackProps) {
    super(scope, id, props)
    const { bucket } = props

    const personalizeRole = new iam.Role(this, 'personalize-role', {
      assumedBy: new iam.ServicePrincipal('personalize.amazonaws.com')
    })

    personalizeRole.attachInlinePolicy(new iam.Policy(this, 'personalize-inline-policy', {
      statements: [
        new iam.PolicyStatement({
          actions: [
            "s3:GetObject",
            "s3:PutObject",
            "s3:ListBucket",
          ],
          resources: [bucket.bucketArn, `${bucket.bucketArn}/*`]
        }),
      ]
    }))

    this.datasetGroup = new personalize.CfnDatasetGroup(this, 'uni-streaming-dataset-group', {
      name: 'UniStreamingDatasetGroup',
    })

    const interactionsSchema = new personalize.CfnSchema(this, 'uni-streaming-interactions-schema', {
      name: 'uni-streaming-interactions-schema',
      schema: JSON.stringify(PersonalizeInteractionSchema),
    })

    new personalize.CfnDataset(this, 'uni-streaming-interactions-dataset', {
      schemaArn: interactionsSchema.attrSchemaArn,
      datasetGroupArn: this.datasetGroup.attrDatasetGroupArn,
      datasetType: 'Interactions',
      name: 'uni-streaming-interactions-dataset',
      datasetImportJob: {
        dataSource: {
          DataLocation: `s3://${bucket.bucketName}/interactions.csv`,
        },
        roleArn: personalizeRole.roleArn,
        jobName: 'uni-streaming-interactions-dataset-import-job'
      },
    })

    const usersSchema = new personalize.CfnSchema(this, 'uni-streaming-users-schema', {
      name: 'uni-streaming-users-schema',
      schema: JSON.stringify(PersonalizeUserSchema),
    })

    new personalize.CfnDataset(this, 'uni-streaming-users-dataset', {
      schemaArn: usersSchema.attrSchemaArn,
      datasetGroupArn: this.datasetGroup.attrDatasetGroupArn,
      datasetType: 'Users',
      name: 'uni-streaming-users-dataset',
      datasetImportJob: {
        dataSource: {
          DataLocation: `s3://${bucket.bucketName}/users.csv`
        },
        roleArn: personalizeRole.roleArn,
        jobName: 'uni-streaming-users-dataset-import-job'
      },
    })

    const itemsSchema = new personalize.CfnSchema(this, 'uni-streaming-items-schema', {
      name: 'uni-streaming-items-schema',
      schema: JSON.stringify(PersonalizeItemsSchema),
    })

    new personalize.CfnDataset(this, 'uni-streaming-items-dataset', {
      schemaArn: itemsSchema.attrSchemaArn,
      datasetGroupArn: this.datasetGroup.attrDatasetGroupArn,
      datasetType: 'Items',
      name: 'uni-streaming-items-dataset',
      datasetImportJob: {
        dataSource: {
          DataLocation: `s3://${bucket.bucketName}/movies.csv`
        },
        roleArn: personalizeRole.roleArn,
        jobName: 'uni-streaming-items-dataset-import-job'
      },
    })

    this.personalizationSolution = new personalize.CfnSolution(this, 'uni-streaming-user-personalization', {
      name: 'uni-streaming-user-personalization',
      datasetGroupArn: this.datasetGroup.attrDatasetGroupArn,
      recipeArn: 'arn:aws:personalize:::recipe/aws-user-personalization',
      // https://docs.aws.amazon.com/personalize/latest/dg/native-recipe-new-item-USER_PERSONALIZATION.html#bandit-hyperparameters
      solutionConfig: {
        algorithmHyperParameters: {
          hidden_dimension: '150',
          bptt: '32',
          recency_mask: 'true',
        },
        featureTransformationParameters: {
          min_user_history_length_percentile: '0.1',
          max_user_history_length_percentile: '0.99',
        },
      },
    })
  }
}