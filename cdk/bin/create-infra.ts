import * as cdk from 'aws-cdk-lib'
import { PersonalizeStack, S3Stack } from '../lib'

const app = new cdk.App()

// new S3Stack(app, 'UniStreamingS3')

// new PersonalizeStack(app, 'UniStreamingPersonalize')