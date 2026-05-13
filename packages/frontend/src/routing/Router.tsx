import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { ChangeLocaleButton } from '@/common/components/ChangeLocaleButton';
import { Layout } from '@/common/components/Layout';
import { HelloWorld } from '@/helloWorld/HelloWorld';
import { GlobalErrorBoundary } from '@/routing/components/GlobalErrorBoundary';
import { LazyLoading } from '@/routing/components/LazyLoading';
import { UnknownRoute } from '@/routing/components/UnknownRoute';

const IncrementButton = lazy(
  () => import('@/helloWorld/components/IncrementButton'),
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: '',
        element: <HelloWorld />,
      },
      {
        path: 'count',
        element: <LazyLoading Component={IncrementButton} />,
      },
      {
        path: 'locale',
        element: <ChangeLocaleButton />,
      },
    ],
  },
  {
    path: '*',
    element: <UnknownRoute />,
  },
]);

export const Router = () => <RouterProvider router={router} />;
