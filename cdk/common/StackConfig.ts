export interface StackConfig {
  region: string,
  ses: {
    identity: string,
    email: string,
  },
}

export const MainStackConfig: StackConfig = {
  region: 'ca-central-1',
  ses: {
    identity: "arn:aws:ses:ca-central-1:392199159898:identity/unicornpowered.io",
    email: 'uni-streaming@unicornpowered.io',
  },
}