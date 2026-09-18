import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/token.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/component.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
