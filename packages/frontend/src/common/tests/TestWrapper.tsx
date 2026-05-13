/* eslint-disable react-refresh/only-export-components */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderOptions as RTLRenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { PropsWithChildren, ReactElement } from 'react';

import { initI18nTest } from '@/common/tests/i18nTest';
import { QueryClientConfig } from '@/common/utils/QueryClientConfig';

const i18next = initI18nTest();

type Component = (props: PropsWithChildren) => ReactElement;

const QueryClientWrapper =
  (queryClient: QueryClient): Component =>
  ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

const composeWrappers = (wrappers: Component[]) => {
  return wrappers.reduce((Acc, Current) => {
    return ({ children }) => (
      <Acc>
        <Current>{children}</Current>
      </Acc>
    );
  });
};

type RenderOptions = RTLRenderOptions;

const customRender = (
  ui: ReactElement,
  options: Partial<RenderOptions> = {},
) => {
  const queryClient = new QueryClient(QueryClientConfig);

  const rendered = render(ui, {
    wrapper: composeWrappers([QueryClientWrapper(queryClient)]),
    ...options,
  });

  return {
    ...rendered,
    queryClient,
  };
};

export * from '@testing-library/react';
export * from '@testing-library/user-event';

const translate = i18next.t;

export { customRender as render, translate as t };
