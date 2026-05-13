import { useState } from 'react';

import { Button } from '@/common/components/button/Button';

export const IncrementButton = () => {
  const [count, setCount] = useState(0);

  return (
    <main>
      <Button onClick={() => setCount((count) => count + 1)}>
        Count is {count}
      </Button>
    </main>
  );
};

export default IncrementButton;
