import { useState } from 'react'
import { MapPin, Clock, Globe, Navigation, ChevronDown, ChevronUp, ExternalLink, Heart, Share2 } from 'lucide-react'
import ShareModal from './ShareModal'

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_SHORT = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' }

function getTodayKey() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date().getDay()]
}

function getTodayHours(openingTimes) {
  if (!openingTimes) return null
  const hours = openingTimes[getTodayKey()]
  if (!hours || hours.closed) return 'Closed'
  return hours
}

export default function VenueCard({ venue, isActive, onClick, isFavorited, onToggleFavorite }) {
  const [showHours, setShowHours] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const todayHours = getTodayHours(venue.opening_times)
  const todayKey = getTodayKey()

  return (
    <>
      <div
        onClick={onClick}
        className={`bg-white dark:bg-gray-900 rounded-xl border p-3.5 cursor-pointer transition-colors font-sans ${
          isActive
            ? 'border-gray-900 dark:border-gray-300 shadow-[0_0_0_1px_rgba(17,24,39,0.15)] dark:shadow-[0_0_0_1px_rgba(209,213,219,0.15)]'
            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
        }`}
      >
        <div className="flex gap-3">
          {/* Logo */}
          <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {venue.logo_url ? (
              <img src={venue.logo_url} alt={venue.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-gray-900 text-sm font-semibold">
                {venue.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{venue.name}</h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {venue.category}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(venue.id) }}
                  className="p-0 border-0 bg-transparent cursor-pointer transition-transform active:scale-90"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavorited
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{venue.address}, {venue.city}, {venue.state}</span>
            </div>

            {/* Today hours + expand toggle */}
            {todayHours && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowHours(!showHours) }}
                className="flex items-center gap-1 mt-0.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent border-0 p-0 cursor-pointer transition-colors"
              >
                <Clock className="w-3 h-3 flex-shrink-0" />
                {typeof todayHours === 'string' ? (
                  <span className="text-red-400">{todayHours} today</span>
                ) : (
                  <span>Today: {todayHours.open} - {todayHours.close}</span>
                )}
                {showHours ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            {/* Expanded hours */}
            {showHours && venue.opening_times && (
              <div className="mt-1.5 pl-4 space-y-0.5" onClick={(e) => e.stopPropagation()}>
                {DAYS_ORDER.map((day) => {
                  const h = venue.opening_times[day]
                  const isToday = day === todayKey
                  return (
                    <div key={day} className={`flex items-center gap-2 text-[11px] ${isToday ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                      <span className="w-7">{DAY_SHORT[day]}</span>
                      {!h || h.closed ? (
                        <span className="text-red-400">Closed</span>
                      ) : (
                        <span>{h.open} - {h.close}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 mt-2">
              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 hover:border-gray-900 dark:hover:border-white transition-all duration-150 no-underline"
                >
                  <Globe className="w-3 h-3" />
                  Website
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              )}
              {venue.maps_link && (
                <a
                  href={venue.maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 hover:border-gray-900 dark:hover:border-white transition-all duration-150 no-underline"
                >
                  <Navigation className="w-3 h-3" />
                  Directions
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setShowShare(true) }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 hover:border-gray-900 dark:hover:border-white transition-all duration-150 cursor-pointer bg-transparent"
              >
                <Share2 className="w-3 h-3" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {showShare && <ShareModal venue={venue} onClose={() => setShowShare(false)} />}
    </>
  )
}
