import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { db } from './db/db.js';
import { requestPersistentStorage } from './lib/storage.js';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Open the database first, so a browser that blocks storage (e.g. some private windows)
// gets a clear message instead of failing on the first save.
db.open()
  .then(() => {
    // Ask the browser not to clear the teacher's data when the disk is nearly full.
    requestPersistentStorage();
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <ToastProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </ToastProvider>
        </BrowserRouter>
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error('Could not open the lessonPlanner database.', error);
    root.render(
      <div className="mx-auto mt-16 max-w-lg px-4 text-sm text-gray-800">
        <h1 className="text-xl font-bold text-gray-900">Lesson Planner cannot save data in this browser</h1>
        <p className="mt-3">
          The app keeps your profile and plans in this browser, but the browser is blocking storage. This often
          happens in a private or incognito window.
        </p>
        <p className="mt-3">Open the app in a normal window. If that does not help, allow site data for this site in your browser settings.</p>
      </div>
    );
  });
