import * as cdk from 'aws-cdk-lib'
import { MoviesStack, PersonalizeStack, S3Stack } from '../lib'

const app = new cdk.App()

const s3Stack = new S3Stack(app, 'UniStreamingS3')

// new PersonalizeStack(app, 'UniStreamingPersonalize')

new MoviesStack(app, 'UniStreamingMoviesStack', { bucket: s3Stack.bucket })