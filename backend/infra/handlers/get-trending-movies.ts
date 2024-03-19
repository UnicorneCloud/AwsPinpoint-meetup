import { Injector } from "@sailplane/injector"
import { MovieService } from "~/backend/service"

const service = Injector.get(MovieService)!

export const handler = async (event: any) => {
  const { numberOfMovies } = event
  const movies = await service.getTrendingMovies(numberOfMovies)
  return {
    statusCode: 200,
    body: {
      movies
    },
  }
}