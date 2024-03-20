import { Stack } from 'aws-cdk-lib';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import { Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { IStream } from 'aws-cdk-lib/aws-kinesis';
import { CfnDeliveryStream } from 'aws-cdk-lib/aws-kinesisfirehose';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { ProjectStackProps } from '~/cdk/common';

export interface KinesisStackProps extends ProjectStackProps {
  bucket: IBucket
}

export class KinesisStack extends Stack {
  public stream: IStream
  public fireHose: CfnDeliveryStream

  constructor(scope: Construct, id: string, props: KinesisStackProps) {
    super(scope, id, props);
    const { bucket } = props

    this.stream = new kinesis.Stream(this, 'uni-streaming-pinpoint-kinesis-stream', {
      streamName: 'uni-streaming-pinpoint-kinesis-stream',
      shardCount: 1,
    });

    const firehoseRole = new Role(this, 'uni-streaming-firehose-role', {
      assumedBy: new ServicePrincipal('firehose.amazonaws.com')
    });

    const firehosePolicy = new Policy(this, 'uni-streaming-firehose-policy', {
      policyName: 'uni-streaming-firehose-policy',
      statements: [
        new PolicyStatement({
          actions: [
            's3:AbortMultipartUpload',
            's3:GetBucketLocation',
            's3:GetObject',
            's3:ListBucket',
            's3:ListBucketMultipartUploads',
            's3:PutObject'
          ],
          resources: [
            bucket.bucketArn,
            `${bucket.bucketArn}/*`
          ]
        }),
        new PolicyStatement({
          actions: [
            'kinesis:DescribeStream',
            'kinesis:GetShardIterator',
            'kinesis:GetRecords'
          ],
          resources: [
            `arn:aws:kinesis:*:*:stream/${this.stream.streamName}`
          ]
        })
      ]
    })

    firehoseRole.attachInlinePolicy(firehosePolicy)

    this.fireHose =  new CfnDeliveryStream(this, 'uni-streaming-firehose-pinpoint-stream', {
      deliveryStreamType: 'DirectPut',
      kinesisStreamSourceConfiguration: {
        kinesisStreamArn: this.stream.streamArn,
        roleArn: firehoseRole.roleArn,
      },
      s3DestinationConfiguration: {
        bucketArn: bucket.bucketArn,
        roleArn: firehoseRole.roleArn,
      },
    })
  }
}
