import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Heart, MapPin, X } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'
import { sampleVenues } from '../lib/seedData'

const WC_START = new Date('2026-06-11T00:00:00')

function HeaderCountdown() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = WC_START - now
  if (diff <= 0) return null

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return (
    <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums">
      <span className="text-[10px] text-gray-400 dark:text-gray-500 mr-0.5">Kickoff in</span>
      <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-1.5 py-0.5 rounded text-[11px] font-semibold">{days}d</span>
      <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[11px]">{String(hours).padStart(2, '0')}h</span>
      <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[11px]">{String(minutes).padStart(2, '0')}m</span>
      <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[11px]">{String(seconds).padStart(2, '0')}s</span>
    </div>
  )
}

function SavedDropdown({ onClose }) {
  const { favoriteIds, toggleFavorite } = useFavorites()
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const savedVenues = sampleVenues.filter((v) => favoriteIds.has(v.id))

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-900/10 dark:shadow-black/30 z-50 font-sans overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Saved Venues</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{savedVenues.length}</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer bg-transparent border-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable list */}
      <div className="max-h-72 overflow-y-auto">
        {savedVenues.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Heart className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400 dark:text-gray-500">No saved venues yet</p>
            <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">Tap the heart on any venue to save it</p>
          </div>
        ) : (
          savedVenues.map((venue) => (
            <div
              key={venue.id}
              onClick={() => { navigate(`/?venue=${venue.id}`); onClose() }}
              className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-b-0 cursor-pointer"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {venue.logo_url ? (
                  <img src={venue.logo_url} alt={venue.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-gray-900 text-xs font-semibold">
                    {venue.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{venue.name}</p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{venue.city}, {venue.state}</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(venue.id) }}
                className="p-1 border-0 bg-transparent cursor-pointer flex-shrink-0"
              >
                <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 hover:scale-110 transition-transform" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function Header() {
  const { favoriteIds } = useFavorites()
  const [showSaved, setShowSaved] = useState(false)
  const count = favoriteIds.size

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/60 dark:border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100 tracking-tight font-sans">
              <span className="mr-1.5">⚽</span>WhereToWatch<span className="text-gray-400 dark:text-gray-500 font-normal">.cup</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <HeaderCountdown />
            <div className="relative">
              <button
                onClick={() => setShowSaved(!showSaved)}
                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer border ${
                  showSaved
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                    : 'bg-transparent text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${count > 0 || showSaved ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="hidden sm:inline text-xs">Saved</span>
                {count > 0 && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                    showSaved
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
              {showSaved && <SavedDropdown onClose={() => setShowSaved(false)} />}
            </div>
            <Link
              to="/list-venue"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white no-underline bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List your restaurant</span>
              <span className="sm:hidden">List venue</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
