import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App.jsx'
import './index.css'

// Android/iOS: CSS is in assets/*.css so relative url must be from there to app root
const platform = Capacitor.getPlatform()
const base = import.meta.env.BASE_URL
const bgUrl = platform === 'android' || platform === 'ios'
  ? "url('../bg-hex.jpg')"
  : `url('${base}bg-hex.jpg')`
document.documentElement.style.setProperty('--bg-image', bgUrl)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
