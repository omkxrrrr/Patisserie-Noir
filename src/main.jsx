import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#3A1B14',
            color: '#FBF5EF',
            borderRadius: '0.75rem',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '14px'
          },
          success: { iconTheme: { primary: '#C9952B', secondary: '#FBF5EF' } }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
