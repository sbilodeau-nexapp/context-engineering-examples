import { byText } from 'testing-library-selector';
import { vi } from 'vitest';

import { render } from '@/common/tests/TestWrapper';
import { HelloWorldClient } from '@/helloWorld/api/HelloWorldClient';
import { HelloWorld } from '@/helloWorld/HelloWorld';

describe('HelloWorld', () => {
  it('can load the hello world successfully', async () => {
    HelloWorldClient.helloWorld = vi.fn().mockResolvedValue('Hello World');
    render(<HelloWorld />);

    expect(await byText(/Hello World/).find()).toBeInTheDocument();
    expect(HelloWorldClient.helloWorld).toBeCalled();
  });
});
