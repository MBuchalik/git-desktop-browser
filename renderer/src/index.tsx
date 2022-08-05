import React from 'react';
import { render } from 'react-dom';

import App from './app';
import './theme/theme.scss';

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement,
);
