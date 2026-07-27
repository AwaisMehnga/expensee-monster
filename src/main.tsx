import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import Approuter from './app-router'
import { initDb } from './services'

// Open + migrate the SQLite database at startup (non-blocking).
void initDb().catch((err) => console.error('[db] initialization failed', err))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Approuter />
    </BrowserRouter>
  </StrictMode>,
)
