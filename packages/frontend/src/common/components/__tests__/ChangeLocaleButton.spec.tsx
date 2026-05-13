import { byText } from 'testing-library-selector';

import { ChangeLocaleButton } from '@/common/components/ChangeLocaleButton';
import { render, t } from '@/common/tests/TestWrapper';

describe('ChangeLocaleButton', () => {
  it('should display the test language', () => {
    render(<ChangeLocaleButton />);

    expect(byText(t('testLanguage')).get()).toBeInTheDocument();
  });
});
