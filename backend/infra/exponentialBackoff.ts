import { Logger } from "@sailplane/logger";

const logger = new Logger('exponentialBackoff')

export async function exponentialBackoff<T>(func: () => Promise<T>, checkRetry: (error: any) => boolean, maxRetries = 3) {
  let attempts = 0;
  while (attempts < maxRetries) {
      try {
          const response = await func()
          return response
      } catch (error: any) {
          if (checkRetry(error)) {
              attempts++
              logger.info(`ThrottlingException occurred. Retrying attempt ${attempts}...`)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000))
          } else {
              throw error
          }
      }
  }
  throw new Error(`Max retries (${maxRetries}) exceeded.`)
}