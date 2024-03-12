import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';

export class S3Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, 'UniStreamingBucket', {
      bucketName: 'UniStreamingBucket',
      removalPolicy: RemovalPolicy.DESTROY,
    })
  }
}