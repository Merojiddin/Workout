import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './i18n'
import { registerAppUpdates } from './utils/appUpdates'
import { deleteRetiredCaches } from './utils/retiredCaches'

deleteRetiredCaches()
registerAppUpdates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
