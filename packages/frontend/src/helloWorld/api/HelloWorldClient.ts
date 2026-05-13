import { Client } from '@/common/services/Client';
import { HelloWorldResponse } from '@/helloWorld/api/types/HelloWorldTypes';

export const HelloWorldClient = {
  helloWorld: async (): Promise<string> => {
    const { data } = await Client.get<HelloWorldResponse>({
      endpoint: '/',
    });

    return data.hello;
  },
};
