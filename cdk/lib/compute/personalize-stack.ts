import { Construct } from 'constructs';
import * as personalize from 'aws-cdk-lib/aws-personalize';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Stack, StackProps } from 'aws-cdk-lib';
import { PersonalizeInteractionSchema, PersonalizeItemsSchema, PersonalizeUserSchema } from './schemas';

export interface PersonalizeStackProps extends StackProps {
  bucket: s3.IBucket
}

export class PersonalizeStack extends Stack {

  constructor(scope: Construct, id: string, props: PersonalizeStackProps) {
    super(scope, id, props)
    const { bucket } = props

    const personalizeRole = new iam.Role(this, 'personalize-role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    })

    personalizeRole.attachInlinePolicy(new iam.Policy(this, 'personalize-inline-policy', {
      statements: [
        new iam.PolicyStatement({
          actions: ['s3:*'],
          resources: [bucket.bucketArn, `${bucket.bucketArn}/*`]
        }),
      ]
    }))

    const datasetGroup = new personalize.CfnDatasetGroup(this, 'uni-streaming-dataset-group', {
      name: 'UniStreamingDatasetGroup',
    })

    const interactionsSchema = new personalize.CfnSchema(this, 'uni-streaming-interactions-schema', {
      name: 'uni-streaming-interactions-schema',
      schema: JSON.stringify(PersonalizeInteractionSchema),
    })

    const interactionsDataset = new personalize.CfnDataset(this, 'uni-streaming-interactions-dataset', {
      schemaArn: interactionsSchema.attrSchemaArn,
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
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

    const usersDataset = new personalize.CfnDataset(this, 'uni-streaming-users-dataset', {
      schemaArn: usersSchema.attrSchemaArn,
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
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

    const itemsDataset = new personalize.CfnDataset(this, 'uni-streaming-items-dataset', {
      schemaArn: itemsSchema.attrSchemaArn,
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
      datasetType: 'Items',
      name: 'uni-streaming-items-dataset',
      datasetImportJob: {
        dataSource: {
          DataLocation: `s3://${bucket.bucketName}/items.csv`
        },
        roleArn: personalizeRole.roleArn,
        jobName: 'uni-streaming-items-dataset-import-job'
      },
    })

    // new personalize.CfnSolution(this, 'UniStreamingHRRN', {
    //   name: 'UniStreamingPersonalize',
    //   datasetGroupArn: datasetGroup.attrDatasetGroupArn,
    //   recipeArn: 'arn:aws:personalize:::recipe/aws-hrnn',
    // })

    // new personalize.CfnSolution(this, 'UniStreamingHRRNColdstart', {
    //   name: 'UniStreamingPersonalize',
    //   datasetGroupArn: datasetGroup.attrDatasetGroupArn,
    //   recipeArn: 'arn:aws:personalize:::recipe/aws-hrnn-coldstart',
    // })

    // new personalize.CfnSolution(this, 'UniStreamingHRRNMeta', {
    //   name: 'UniStreamingPersonalize',
    //   datasetGroupArn: datasetGroup.attrDatasetGroupArn,
    //   recipeArn: 'arn:aws:personalize:::recipe/aws-hrnn-metadata',
    // })

    // new personalize.CfnSolution(this, 'UniStreamingPersonalizedRanking', {
    //   name: 'UniStreamingPersonalize',
    //   datasetGroupArn: datasetGroup.attrDatasetGroupArn,
    //   recipeArn: 'arn:aws:personalize:::recipe/aws-personalized-ranking',
    // })

    // new personalize.CfnSolution(this, 'UniStreamingPopularityCount', {
    //   name: 'UniStreamingPersonalize',
    //   datasetGroupArn: datasetGroup.attrDatasetGroupArn,
    //   recipeArn: 'arn:aws:personalize:::recipe/aws-popularity-count',
    // })

    // new personalize.CfnSolution(this, 'UniStreamingSims', {
    //   name: 'UniStreamingPersonalize',
    //   datasetGroupArn: datasetGroup.attrDatasetGroupArn,
    //   recipeArn: 'arn:aws:personalize:::recipe/aws-sims',
    // })
  }
}