import { BaseStyles, ThemeProvider } from '@primer/react';
import React from 'react';

import { MainView } from './components/main-view';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BaseStyles style={{ height: '100%' }}>
        <MainView />
      </BaseStyles>
    </ThemeProvider>
  );
};

export default App;
