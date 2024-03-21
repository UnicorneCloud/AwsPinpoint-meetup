import { App, Stack } from 'aws-cdk-lib';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import * as pinpoint from 'aws-cdk-lib/aws-pinpoint';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ProjectStackProps } from '~/cdk/common';
import { CfnDeliveryStream } from 'aws-cdk-lib/aws-kinesisfirehose';

export interface PinpointStackProps extends ProjectStackProps {
  kinesis: kinesis.IStream
  fireHose: CfnDeliveryStream
}

export class PinpointStack extends Stack {
  public appId: string
  public senderId: string
  public appArn: string
  public recommenderRole: iam.Role
  public webAppSegment: pinpoint.CfnSegment

  constructor(scope: App, id: string, props: PinpointStackProps) {
    super(scope, id, props);
    const { kinesis, fireHose, ses: { identity, email } } = props

    // create a Pinpoint application
    const pinpointApp = new pinpoint.CfnApp(this, 'uni-streaming-pinpoint', {
      name: 'uni-streaming-pinpoint',
    })

    const smsChannel = new pinpoint.CfnSMSChannel(this, 'uni-streaming-pinpoint-sms-channel', {
      applicationId: pinpointApp.ref,
      senderId: 'UniStreaming',
    })

    new pinpoint.CfnEmailChannel(this, 'uni-streaming-pinpoint-email-channel', {
      applicationId: pinpointApp.ref,
      fromAddress: email,
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

    // add a policy to allow Pinpoint to access the firehose
    // const pinpointKinesisPolicy = new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   actions: [
    //     'kinesis:*',
    //   ],
    //   resources: [kinesis.streamArn],
    // })
    // const pinpointFirehosePolicy = new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   actions: [
    //     'firehose:*',
    //   ],
    //   resources: [fireHose.attrArn],
    // })
    // pinpointKinesisAccessRole.addToPolicy(pinpointKinesisPolicy)
    // pinpointKinesisAccessRole.addToPolicy(pinpointFirehosePolicy)

    this.appArn = pinpointApp.attrArn
    this.senderId = smsChannel.senderId
    this.appId = pinpointApp.ref

    // create an event stream to connect Pinpoint to the firehose
    // new pinpoint.CfnEventStream(this, 'uni-streaming-pinpoint-event-stream', {
    //   applicationId: pinpointApp.ref,
    //   destinationStreamArn: fireHose.attrArn,
    //   roleArn: pinpointKinesisAccessRole.roleArn,
    // })

    const duneSegment = new pinpoint.CfnSegment(this, 'dune-watchers-segment', {
      applicationId: pinpointApp.ref,
      name: 'dune-watchers-segment',
      segmentGroups: {
        groups: [
          {
            dimensions: [
              {
                attributes: {
                  Name: {
                    AttributeType: 'INCLUSIVE',
                    Values: ['Dune']
                  }
                }
              }
            ]
          }
        ],
        include: 'ANY',
      },
    })

    const notWatchedDuneSegment = new pinpoint.CfnSegment(this, 'dune-have-not-watched-segment', {
      applicationId: pinpointApp.ref,
      name: 'dune-have-not-watched-segment',
      segmentGroups: {
        groups: [
          {
            dimensions: [
              {
                attributes: {
                  Name: {
                    AttributeType: 'EXCLUSIVE',
                    Values: ['Dune']
                  }
                }
              }
            ]
          }
        ],
        include: 'ANY',
      },
    })

    this.webAppSegment = new pinpoint.CfnSegment(this, 'webapp-users-segment', {
      applicationId: pinpointApp.ref,
      name: 'webapp-users-segment',
      segmentGroups: {
        groups: [
          {
            dimensions: [
              {
                demographic: {
                  appVersion: {
                    dimensionType: 'INCLUSIVE',
                    values: ['Webapp']
                  }
                }
              }
            ]
          }
        ],
        include: 'ANY',
      },
    })

    const dormantUsersSegment = new pinpoint.CfnSegment(this, 'dormant-users-segment', {
      applicationId: pinpointApp.ref,
      name: 'dormant-users-segment',
      segmentGroups: {
        groups: [
          {
            dimensions: [
              {
                behavior: {
                  recency: {
                    duration: 'DAY_14',
                    recencyType: 'INACTIVE',
                  }
                }
              }
            ]
          }
        ],
        include: 'ANY',
      }
    })

    const dunePromoteTemplate = new pinpoint.CfnEmailTemplate(this, 'dune-promote-template', {
      templateName: 'dune-promote',
      subject: 'Watch Dune!',
      textPart: 'Dune 2 was released on our platform, you might want to watch Dune part 1 first!'
    })

    const dune2PromoteTemplate = new pinpoint.CfnEmailTemplate(this, 'dune-2-promote-template', {
      templateName: 'dune-2-promote',
      subject: 'Dune 2 was released on our platform!',
      textPart: 'Dune 2 was recently released on our platform. Go enjoy this amazing movie!'
    })

    const campaignDate = new Date(2024, 3, 15, 17, 0, 0).toISOString()

    new pinpoint.CfnCampaign(this, 'dune-promote-campaign', {
      applicationId: pinpointApp.ref,
      name: 'dune-promote-campaign',
      segmentId: notWatchedDuneSegment.attrSegmentId,
      schedule: {
        startTime: campaignDate,
        frequency: 'ONCE',
        timeZone: 'UTC-04',
      },
      messageConfiguration: {
        emailMessage: {
          fromAddress: email,
        }
      },
      templateConfiguration: {
        emailTemplate: {
          name: dunePromoteTemplate.templateName,
        }
      }
    })

    new pinpoint.CfnCampaign(this, 'dune-2-promote-campaign', {
      applicationId: pinpointApp.ref,
      name: 'dune-2-promote-campaign',
      segmentId: duneSegment.attrSegmentId,
      schedule: {
        startTime: campaignDate,
        frequency: 'ONCE',
        timeZone: 'UTC-04',
      },
      messageConfiguration: {
        emailMessage: {
          fromAddress: email,
        }
      },
      templateConfiguration: {
        emailTemplate: {
          name: dune2PromoteTemplate.templateName,
        }
      }
    })

    this.recommenderRole = new iam.Role(this, 'uni-streaming-recommender-role', {
      roleName: 'uni-streaming-recommender-role',
      assumedBy: new iam.ServicePrincipal('pinpoint.amazonaws.com'),
    })
    this.recommenderRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'personalize:GetRecommendations',
        'personalize:DescribeCampaign',
        'personalize:DescribeSolution',
      ],
      resources: [
        `arn:aws:personalize:${this.region}:${this.account}:campaign/*`,
        `arn:aws:personalize:${this.region}:${this.account}:solution/*`
      ]
    }))
  }
}
