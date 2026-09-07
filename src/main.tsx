import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

// Consistent base path matching Vite config: '/attendencetracker-/'
const base = import.meta.env.BASE_URL || '/attendencetracker-/'

// If developer or user visits root without the subpath, redirect to the base path
if (typeof window !== 'undefined') {
  const currentPath = window.location.pathname
  if (currentPath === '/' || currentPath === '') {
    window.history.replaceState(null, '', base)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={base}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)