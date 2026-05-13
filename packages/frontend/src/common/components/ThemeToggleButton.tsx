import { useState } from 'react';

import { Button } from '@/common/components/button/Button';

export const ThemeToggleButton = () => {
  const [theme, setTheme] = useState(
    document.body.className.includes('dark') ? 'dark' : 'light',
  );

  return (
    <Button
      onClick={() => {
        document.body.classList.toggle('dark');
        setTheme(theme === 'dark' ? 'light' : 'dark');
      }}
    >
      Theme: {theme}
    </Button>
  );
};
