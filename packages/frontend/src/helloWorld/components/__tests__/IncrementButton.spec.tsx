import { byRole } from 'testing-library-selector';

import { render, userEvent } from '@/common/tests/TestWrapper';
import { IncrementButton } from '@/helloWorld/components/IncrementButton';

describe('IncrementButton', () => {
  it('should increment the button value when clicking on it', async () => {
    const user = renderButton();

    const button = byRole('button').get();
    expect(button).toHaveTextContent('0');

    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(button).toHaveTextContent('3');
  });

  const renderButton = () => {
    const user = userEvent.setup();
    render(<IncrementButton />);

    return user;
  };
});
