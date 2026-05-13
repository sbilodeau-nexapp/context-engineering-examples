import { QueryClientConfig as Config } from '@tanstack/react-query';

export const QueryClientConfig: Config = {
  defaultOptions: {
    queries: { retry: 0 },
    mutations: { retry: 0 },
  },
};
