import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Interactive Map Application
        </h1>
        <p className="text-gray-600">
          Ready to build your map application
        </p>
      </div>
    </div>
  </React.StrictMode>,
);