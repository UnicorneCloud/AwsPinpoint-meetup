import { Injector } from "@sailplane/injector"
import { Logger } from "@sailplane/logger"
import { MovieService } from "~/backend/service"

const service = Injector.get(MovieService)!

const logger = new Logger('enhanced-personalize-recommendations')

export const handler = async (event: any) => {
  const endpoints: any[] = Object.values(event.Endpoints)

  await Promise.all(endpoints.map(async (endpoint) => {
    const movies = await service.getMoviesByIds(endpoint.RecommendationItems)
    endpoint.Recommendations = {
      Name: movies.map((movie) => movie.Name),
      Category: movies.map((movie) => movie.Category),
    }
  }))

  logger.info('Enhanced event', event.Endpoints)

  return event.Endpoints
}