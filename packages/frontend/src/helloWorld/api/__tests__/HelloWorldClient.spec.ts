import nock from 'nock';

import { TEST_BASE_URL } from '@/common/tests/TestBaseUrl';
import { HelloWorldClient } from '@/helloWorld/api/HelloWorldClient';

describe('HelloWorldClient', () => {
  it('should not throw when fetching the hello world successfully', async () => {
    nock(TEST_BASE_URL).get('/').reply(200, { hello: 'Hello World' });

    const response = await HelloWorldClient.helloWorld();

    expect(response).toEqual('Hello World');
  });
});
