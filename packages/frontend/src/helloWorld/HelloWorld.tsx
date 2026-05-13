import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { HelloWorldClient } from '@/helloWorld/api/HelloWorldClient';

export const HelloWorld = () => {
  const { t } = useTranslation();
  const {
    data: world,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['hello'],
    queryFn: HelloWorldClient.helloWorld,
  });

  if (isLoading) {
    return <span>{t('loading')}</span>;
  }

  if (isError) {
    return <span>{t('failToLoadHelloWorld')}</span>;
  }

  return <div>{world}</div>;
};
