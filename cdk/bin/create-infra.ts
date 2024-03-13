import * as cdk from 'aws-cdk-lib'
import { MoviesStack, PersonalizeStack, S3Stack } from '../lib'

const app = new cdk.App()

const s3Stack = new S3Stack(app, 'uni-streaming-s3-stack')

new PersonalizeStack(app, 'UniStreamingPersonalize', { bucket: s3Stack.bucket })

new MoviesStack(app, 'uni-streaming-movies-stack', { bucket: s3Stack.bucket })