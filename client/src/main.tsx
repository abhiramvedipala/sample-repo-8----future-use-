import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BrowserRouter is what actually watches the browser's URL (via the
        History API) and re-renders <Routes> when it changes — App.tsx's
        route table does nothing without something wrapping it to drive it. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
