import { aws_lambda_nodejs as lambdaNodeJs, aws_lambda as lambda, Duration } from 'aws-cdk-lib'

type DefaultLambdaProps = Partial<lambdaNodeJs.NodejsFunctionProps>

export const ProjectDefaultLambdaProps: DefaultLambdaProps = {
  runtime: lambda.Runtime.NODEJS_20_X,
  architecture: lambda.Architecture.ARM_64,
  memorySize: 512,
  timeout: Duration.seconds(10),
  bundling: {
    minify: true,
    keepNames: true, // Otherwise, will break exception names returned by the api.
    sourceMap: true,
  },
}
