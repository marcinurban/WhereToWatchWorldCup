import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Map, List, Locate, Heart } from 'lucide-react'
import SearchFilterBar from '../components/SearchFilterBar'
import VenueCard from '../components/VenueCard'
import VenueMap from '../components/VenueMap'
import UpcomingGames from '../components/UpcomingGames'
import { sampleVenues } from '../lib/seedData'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import { useFavorites } from '../context/FavoritesContext'

export default function HomePage() {
  const [venues, setVenues] = useState(sampleVenues)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategories, setActiveCategories] = useState([])
  const [activeVenueId, setActiveVenueId] = useState(null)
  const [timezone, setTimezone] = useState('ET')
  const [mobileView, setMobileView] = useState('cards') // 'cards' | 'map'
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const { isDark } = useTheme()
  const { favoriteIds, toggleFavorite } = useFavorites()
  const mapRef = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()

  // Handle venue query param (from saved dropdown navigation)
  useEffect(() => {
    const venueId = searchParams.get('venue')
    if (venueId) {
      setActiveVenueId(Number(venueId))
      setMobileView('map')
      // Clean up the URL
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    async function fetchVenues() {
      const { data, error } = await supabase.from('venues').select('*')
      if (!error && data?.length) setVenues(data)
    }
    fetchVenues()
  }, [])

  // Filter venues by name, city, category, and favorites
  const filteredVenues = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return venues.filter((v) => {
      const textMatch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q) ||
        v.state.toLowerCase().includes(q)
      const catMatch = activeCategories.length === 0 || activeCategories.includes(v.category)
      const favMatch = !showFavoritesOnly || favoriteIds.has(v.id)
      return textMatch && catMatch && favMatch
    })
  }, [venues, searchQuery, activeCategories, showFavoritesOnly, favoriteIds])

  // When search changes and there are matching results, pan map to fit them
  useEffect(() => {
    if (!mapRef.current) return
    if (filteredVenues.length > 0 && filteredVenues.length < venues.length) {
      mapRef.current.fitToVenues(filteredVenues)
    } else if (filteredVenues.length === venues.length) {
      mapRef.current.resetView()
    }
  }, [filteredVenues, venues.length])

  // When switching views on mobile, recalculate map + scroll to top
  useEffect(() => {
    if (mobileView === 'map' && mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 50)
    }
    window.scrollTo({ top: 0 })
  }, [mobileView])

  const handleNearMe = () => {
    if (userLocation) {
      // Already have location — just pan to it
      mapRef.current?.panToUser(userLocation)
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        setLocating(false)
        setTimeout(() => mapRef.current?.panToUser(loc), 100)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <main className="font-sans">
      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategories={activeCategories}
        setActiveCategories={setActiveCategories}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-20 lg:pb-0">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {filteredVenues.length} {showFavoritesOnly ? 'favorite' : 'venue'}{filteredVenues.length !== 1 ? 's' : ''} found
          </p>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border transition-all cursor-pointer ${
              showFavoritesOnly
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                : 'bg-transparent text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Heart className={`w-2.5 h-2.5 ${showFavoritesOnly ? 'fill-red-500 text-red-500' : ''}`} />
            {showFavoritesOnly ? 'Showing favorites' : 'Favorites only'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-160px)]">
          {/* Left: Scrollable venue list */}
          <div className={`w-full lg:w-[440px] flex-shrink-0 lg:h-full lg:overflow-hidden ${mobileView === 'map' ? 'hidden lg:block' : ''}`}>
            <div className="venue-list space-y-2.5 h-full overflow-y-auto p-0.5 -m-0.5">
              {filteredVenues.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                  <p className="text-sm font-medium">No venues found</p>
                  <p className="text-xs mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                filteredVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    isActive={venue.id === activeVenueId}
                    onClick={() => setActiveVenueId(venue.id === activeVenueId ? null : venue.id)}
                    isFavorited={favoriteIds.has(venue.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right: Map + games */}
          <div className={`flex-1 min-w-0 lg:h-full lg:overflow-hidden ${mobileView === 'cards' ? 'hidden lg:block' : ''}`} style={{ height: mobileView === 'map' ? 'calc(100vh - 200px)' : undefined }}>
            <div className="flex flex-col gap-3 h-full overflow-hidden">
              <div className="flex-shrink-0">
                <VenueMap
                  ref={mapRef}
                  venues={filteredVenues}
                  activeVenueId={activeVenueId}
                  onVenueSelect={(id) => setActiveVenueId(id)}
                  isDark={isDark}
                  userLocation={userLocation}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={toggleFavorite}
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    onClick={handleNearMe}
                    disabled={locating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 hover:border-gray-900 dark:hover:border-white transition-all duration-150 cursor-pointer disabled:opacity-50"
                  >
                    <Locate className={`w-3.5 h-3.5 ${locating ? 'animate-pulse' : ''}`} />
                    {locating ? 'Locating...' : userLocation ? 'Show my location' : 'Near me'}
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <UpcomingGames timezone={timezone} setTimezone={setTimezone} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view toggle */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <button
          onClick={() => setMobileView(mobileView === 'cards' ? 'map' : 'cards')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-full shadow-lg shadow-gray-900/25 dark:shadow-black/25 border-0 cursor-pointer transition-transform active:scale-95"
        >
          {mobileView === 'cards' ? (
            <>
              <Map className="w-4 h-4" />
              Map
            </>
          ) : (
            <>
              <List className="w-4 h-4" />
              Cards
            </>
          )}
        </button>
      </div>
    </main>
  )
}
