/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Application entry point. Initialises React root with Redux provider,
 *              ToastProvider for notifications, and strict mode.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import store from './redux/store';
import { ToastProvider } from './components/Toast';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Provider>
  </React.StrictMode>
);
