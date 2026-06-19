import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import store from './redux/store';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#1e1b4b',
            color: '#f8fafc',
            border: '1px solid #312e81',
          }
        }} />
      </BrowserRouter>
    </Provider>
);
