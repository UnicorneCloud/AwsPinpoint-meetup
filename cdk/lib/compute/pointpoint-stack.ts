import { App, Stack, StackProps, aws_s3 as s3 } from 'aws-cdk-lib';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import * as pinpoint from 'aws-cdk-lib/aws-pinpoint';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ProjectStackProps } from '~/cdk/common';

export interface PinpointStackProps extends ProjectStackProps {
  kinesis: kinesis.IStream
}

export class PinpointStack extends Stack {
  public appId: string
  public senderId: string
  public appArn: string

  constructor(scope: App, id: string, props: PinpointStackProps) {
    super(scope, id, props);
    const { kinesis, ses: { identity } } = props

    // create a Pinpoint application
    const pinpointApp = new pinpoint.CfnApp(this, 'uni-streaming-pinpoint', {
      name: 'uni-streaming-pinpoint',
    })

    const smsChannel = new pinpoint.CfnSMSChannel(this, 'uni-streaming-pinpoint-sms-channel', {
      applicationId: pinpointApp.ref,
      senderId: 'UniStreaming',
    })

    new pinpoint.CfnEmailChannel(this, '-uni-streaming-pinpoint-email-channel', {
      applicationId: pinpointApp.ref,
      fromAddress: 'uni-streaming@unicorne.cloud',
      enabled: true,
      identity: identity,
    })

    if (!smsChannel.senderId) {
      throw new Error('No sender ID id was defined for the channel')
    }

    // create an IAM role for Pinpoint to access S3
    const pinpointKinesisAccessRole = new iam.Role(this, 'uni-streaming-pinpoint-kinesis-access-role', {
      assumedBy: new iam.ServicePrincipal('pinpoint.amazonaws.com'),
    });

    // add a policy to allow Pinpoint to access the S3 bucket
    const pinpointKinesisPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "kinesis:PutRecords",
        "kinesis:DescribeStream",
      ],
      resources: [kinesis.streamArn],
    });
    pinpointKinesisAccessRole.addToPolicy(pinpointKinesisPolicy)

    this.appArn = pinpointApp.attrArn
    this.senderId = smsChannel.senderId
    this.appId = pinpointApp.ref

    // create an event stream to connect Pinpoint to the S3 bucket
    new pinpoint.CfnEventStream(this, 'uni-streaming-pinpoint-event-stream', {
      applicationId: pinpointApp.ref,
      destinationStreamArn: kinesis.streamArn,
      roleArn: pinpointKinesisAccessRole.roleArn,
    })
  }
}
