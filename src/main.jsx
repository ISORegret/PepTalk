import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App.jsx'
import { SupabaseAuthProvider } from './context/SupabaseAuthContext.jsx'
import './index.css'
import './readability-overrides.css'
import './structural-redesign.css'
import './insights-build5.css'
import './v3-foundation.css'
import './qol-enhancements.js'
import './structural-redesign.js'
import './insights-build5.js'

/**
 * GitHub Pages and other static hosts often build without VITE_* secrets.
 * If `public/supabase-config.json` exists, load URL + anon key before React mounts
 * (Supabase anon key is intended for browsers; protect data with RLS).
 */
async function applySupabaseRuntimeConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (envUrl && envKey) return

  const pathBase = import.meta.env.BASE_URL || '/'
  const normalized = pathBase.endsWith('/') ? pathBase : `${pathBase}/`
  try {
    const res = await fetch(`${normalized}supabase-config.json`, { cache: 'no-store' })
    if (!res.ok) return
    const j = await res.json()
    if (j?.url && j?.anonKey) {
      window.__PEPTALK_SUPABASE__ = {
        url: String(j.url).trim(),
        anonKey: String(j.anonKey).trim(),
      }
    }
  } catch {
    /* stay local-only */
  }
}

// Android/iOS: CSS is in assets/*.css so relative url must be from there to app root
const platform = Capacitor.getPlatform()
const base = import.meta.env.BASE_URL
const bgUrl = platform === 'android' || platform === 'ios'
  ? "url('../bg-hex.jpg')"
  : `url('${base}bg-hex.jpg')`
document.documentElement.style.setProperty('--bg-image', bgUrl)

applySupabaseRuntimeConfig().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <SupabaseAuthProvider>
        <App />
      </SupabaseAuthProvider>
    </React.StrictMode>,
  )
})
