import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ShiftOptimizerApp from './ShiftOptimizerApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ShiftOptimizerApp />
  </StrictMode>,
)
