import React from 'react'
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'

const storageMap = new Map<string, string>()
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (key: string) => storageMap.get(key) ?? null,
    setItem: (key: string, value: string) => storageMap.set(key, value),
    removeItem: (key: string) => storageMap.delete(key),
    clear: () => storageMap.clear(),
    key: (i: number) => Array.from(storageMap.keys())[i] ?? null,
    length: 0,
  } as any
}

describe('App routing and initial render', () => {
  it('renders AuthPage at root route without throwing or rendering blank', () => {
    const html = renderToString(
      <StaticRouter location="/">
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </StaticRouter>
    )

    expect(html).toContain('Smart Attendance Tracker')
    expect(html).toContain('Log in')
    expect(html).toContain('Sign up')
    expect(html).toContain('Campus Announcements')
  })
})
