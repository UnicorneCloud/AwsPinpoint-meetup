import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';

export class S3Stack extends Stack {
  bucket: s3.IBucket
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, 'uni-streaming-bucket', {
      bucketName: 'uni-streaming-bucket',
      removalPolicy: RemovalPolicy.DESTROY,
    })
  }
}