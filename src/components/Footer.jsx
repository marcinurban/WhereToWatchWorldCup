import { Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Footer() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-900 dark:text-gray-100 no-underline">
              WhereToWatch<span className="text-gray-400 dark:text-gray-500 font-normal">.cup</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 no-underline">Browse venues</Link>
              <Link to="/list-venue" className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 no-underline">List your venue</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              FIFA World Cup 2026 &middot; USA, Canada & Mexico
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
