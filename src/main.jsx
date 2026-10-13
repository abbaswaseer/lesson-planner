import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { db } from './db/db.js';
import './index.css';

// Open the database at start-up so problems (e.g. private browsing blocking
// storage) show up straight away rather than on the first save.
db.open().catch((error) => {
  console.error('Could not open the lessonPlanner database.', error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
