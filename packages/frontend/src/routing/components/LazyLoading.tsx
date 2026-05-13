import { LazyExoticComponent, Suspense } from 'react';

interface LazyLoadingProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: LazyExoticComponent<any>;
}

export const LazyLoading = ({ Component }: LazyLoadingProps) => {
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
};
