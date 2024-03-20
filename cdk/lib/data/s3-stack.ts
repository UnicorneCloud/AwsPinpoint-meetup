import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { ProjectStackProps } from '~/cdk/common';

export class S3Stack extends Stack {
  bucket: s3.IBucket
  constructor(scope: Construct, id: string, props?: ProjectStackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, 'uni-streaming-bucket', {
      bucketName: 'uni-streaming-bucket',
      removalPolicy: RemovalPolicy.DESTROY,
    })

    this.bucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket",
      ],
      resources: [this.bucket.bucketArn, `${this.bucket.bucketArn}/*`],
      principals: [
        new iam.ServicePrincipal('personalize.amazonaws.com'),
        new iam.ServicePrincipal('firehose.amazonaws.com'),
      ]
    }))
  }
}