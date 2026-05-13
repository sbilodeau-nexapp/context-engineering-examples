import './common/styles/theming.css';
import './common/i18n/i18n';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { MonitoringService } from '@/common/services/MonitoringService';
import { QueryClientConfig } from '@/common/utils/QueryClientConfig';
import { Router } from '@/routing/Router';

const client = new QueryClient(QueryClientConfig);

MonitoringService.init();

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={client}>
        <Router />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
