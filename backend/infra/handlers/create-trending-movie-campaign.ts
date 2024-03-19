import { Injector } from "@sailplane/injector"
import { MovieService } from "~/backend/service"

const service = Injector.get(MovieService)!

export const handler = async (event: any) => {
  await service.createTrendingMovieCampaign()
}