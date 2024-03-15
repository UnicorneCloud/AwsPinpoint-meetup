import { Injector } from "@sailplane/injector"

import { InteractionsService } from "~/backend/service/InteractionsService"

const service = Injector.get(InteractionsService)!

export const handler = async () => {
  await service.createUsersInteraction()
}