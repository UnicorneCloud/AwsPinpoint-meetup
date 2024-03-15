import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injector } from "@sailplane/injector";
import { CsvStream } from "../data-generation/csv";
import { EnvKeys, getEnvVariable } from "../env";

export class S3CSVReader {
  constructor(
    private S3Client: S3Client,
    private csvStream: CsvStream,
  ) {}

  async sync<T extends object>(fileName: string): Promise<T[]> {
    const request = new GetObjectCommand({
      Bucket: getEnvVariable(EnvKeys.BUCKET_NAME),
      Key: fileName
    })
    const { Body } = await this.S3Client.send(request)
    if (Body) {
      const content = await Body.transformToString('utf-8')
      const data = this.csvStream.read<T>(content)
      // CSV files contains an empty line at the end
      data.pop()
      return data
    }

    throw new Error('Not content found')
  }
}

const create = () => {
  const client = new S3Client({ region: getEnvVariable(EnvKeys.REGION) })
  return new S3CSVReader(client, Injector.get(CsvStream)!)
}

Injector.register(S3CSVReader, create)