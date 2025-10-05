import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import process from 'process'
import { registerServiceWorker } from './utils/performance';

if (import.meta.env.MODE === 'production') {
  registerServiceWorker();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
