import { Injector } from "@sailplane/injector"
import { MovieService } from "~/backend/service"

const service = Injector.get(MovieService)!

export const handler = async (event: any) => {
  const { userId, numberOfRecommendations } = event
  const movies = await service.getMoviesRecommendations(userId, numberOfRecommendations)
  return {
    statusCode: 200,
    body: JSON.stringify({ movies }),
  }
}