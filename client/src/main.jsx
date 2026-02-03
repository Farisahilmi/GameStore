import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Set API URL based on environment
const apiUrl = import.meta.env.VITE_API_URL || ''; 
axios.defaults.baseURL = apiUrl;
axios.defaults.headers.common['x-api-key'] = '30035be176e0448bb45ce782377409ce';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
