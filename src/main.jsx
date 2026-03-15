import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { FavoritesProvider } from './context/FavoritesContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FavoritesProvider>
    </ThemeProvider>
  </StrictMode>,
)

// Fade out the loading splash after 3 seconds
const splash = document.getElementById('splash')
if (splash) {
  setTimeout(() => {
    splash.style.opacity = '0'
    splash.style.visibility = 'hidden'
    setTimeout(() => splash.remove(), 400)
  }, 3000)
}
