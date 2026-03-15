import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { CATEGORY_EMOJI } from '../lib/seedData'

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

function createVenueIcon(venue, isActive) {
  const emoji = CATEGORY_EMOJI[venue.category] || '📍'
  return L.divIcon({
    className: 'venue-marker-wrapper',
    html: `<div class="venue-marker ${isActive ? 'active' : ''}"><span class="venue-marker-emoji">${emoji}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

function createUserLocationIcon() {
  return L.divIcon({
    className: 'user-location-wrapper',
    html: '<div class="user-location-marker"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_SHORT = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' }

function createPopupContent(venue, isDark, isFavorited) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const todayKey = days[new Date().getDay()]
  const hours = venue.opening_times?.[todayKey]
  const isClosed = !hours || hours.closed

  const textColor = isDark ? '#e5e7eb' : '#111827'
  const subTextColor = isDark ? '#9ca3af' : '#6b7280'
  const mutedColor = isDark ? '#6b7280' : '#9ca3af'
  const logoBg = isDark ? '#1f2937' : '#f3f4f6'

  const logoHtml = venue.logo_url
    ? `<img src="${venue.logo_url}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`
    : `<span style="font-size:14px;font-weight:600;color:${textColor};">${venue.name.charAt(0)}</span>`

  let hoursHtml = ''
  if (venue.opening_times) {
    const rows = DAYS_ORDER.map((day) => {
      const h = venue.opening_times[day]
      const isToday = day === todayKey
      const weight = isToday ? `font-weight:600;color:${textColor};` : `color:${mutedColor};`
      const time = (!h || h.closed)
        ? '<span style="color:#ef4444;">Closed</span>'
        : `${h.open} - ${h.close}`
      return `<div style="display:flex;gap:8px;${weight}"><span style="width:28px;">${DAY_SHORT[day]}</span><span>${time}</span></div>`
    }).join('')

    const todayLabel = isClosed
      ? '<span style="color:#ef4444;">Closed today</span>'
      : `Today: ${hours.open} - ${hours.close}`

    hoursHtml = `
      <details class="popup-hours" style="margin-bottom:10px;">
        <summary>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${todayLabel}
          <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </summary>
        <div style="margin-top:6px;padding-left:16px;font-size:11px;line-height:1.6;">
          ${rows}
        </div>
      </details>
    `
  } else {
    hoursHtml = isClosed
      ? '<div style="font-size:11px;color:#ef4444;margin-bottom:10px;">Closed today</div>'
      : `<div style="font-size:11px;color:${subTextColor};margin-bottom:10px;">Today: ${hours.open} - ${hours.close}</div>`
  }

  const heartFill = isFavorited ? 'fill="#ef4444" stroke="#ef4444"' : `fill="none" stroke="${mutedColor}"`
  const shareText = encodeURIComponent(`Check out ${venue.name} — ${venue.address}, ${venue.city}, ${venue.state}\n${venue.maps_link || venue.website || ''}`)

  return `
    <div style="padding: 14px; min-width: 220px; font-family: ui-sans-serif, system-ui, sans-serif;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <div style="width: 36px; height: 36px; border-radius: 8px; background: ${logoBg}; display: flex; align-items: center; justify-content: center; color: ${textColor}; flex-shrink: 0; overflow: hidden;">
          ${logoHtml}
        </div>
        <div style="min-width: 0; flex: 1;">
          <div style="font-weight: 600; font-size: 13px; color: ${textColor};">${venue.name}</div>
          <div style="font-size: 11px; color: ${mutedColor}; margin-top: 1px;">${venue.category}</div>
        </div>
      </div>
      <div style="font-size: 11px; color: ${subTextColor}; margin-bottom: 3px;">
        ${venue.address}, ${venue.city}
      </div>
      ${hoursHtml}
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        ${venue.website ? `<a href="${venue.website}" target="_blank" rel="noopener" class="popup-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>Website</a>` : ''}
        ${venue.maps_link ? `<a href="${venue.maps_link}" target="_blank" rel="noopener" class="popup-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>Directions</a>` : ''}
        <button data-share-text="${shareText}" class="popup-btn popup-share-btn" style="font-family:inherit;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share</button>
        <button data-fav-id="${venue.id}" class="popup-btn popup-fav-btn" style="font-family:inherit;${isFavorited ? 'color:#ef4444;' : ''}"><svg width="12" height="12" viewBox="0 0 24 24" ${heartFill} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>${isFavorited ? 'Saved' : 'Save'}</button>
      </div>
    </div>
  `
}

const VenueMap = forwardRef(function VenueMap({ venues, activeVenueId, onVenueSelect, isDark, userLocation, favoriteIds, onToggleFavorite }, ref) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const tileLayerRef = useRef(null)
  const clusterGroupRef = useRef(null)
  const markersRef = useRef({})
  const userMarkerRef = useRef(null)
  const onVenueSelectRef = useRef(onVenueSelect)
  const onToggleFavoriteRef = useRef(onToggleFavorite)
  const isClickingMarkerRef = useRef(false)
  onVenueSelectRef.current = onVenueSelect
  onToggleFavoriteRef.current = onToggleFavorite

  useImperativeHandle(ref, () => ({
    fitToVenues(venueList) {
      const map = mapInstanceRef.current
      if (!map || !venueList.length) return
      const bounds = L.latLngBounds(venueList.map((v) => [v.lat, v.lng]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: true })
    },
    resetView() {
      mapInstanceRef.current?.setView([39.8283, -98.5795], 4, { animate: true })
    },
    invalidateSize() {
      mapInstanceRef.current?.invalidateSize()
    },
    panToUser(loc) {
      if (!loc) return
      mapInstanceRef.current?.setView([loc.lat, loc.lng], 12, { animate: true })
    },
  }))

  // Global click handler for popup buttons (favorite + share)
  useEffect(() => {
    const handler = (e) => {
      const favBtn = e.target.closest('[data-fav-id]')
      if (favBtn) {
        const id = Number(favBtn.dataset.favId)
        onToggleFavoriteRef.current?.(id)
        return
      }
      const shareBtn = e.target.closest('[data-share-text]')
      if (shareBtn) {
        const text = decodeURIComponent(shareBtn.dataset.shareText)
        if (navigator.share) {
          navigator.share({ text }).catch(() => {})
        } else {
          navigator.clipboard.writeText(text).then(() => {
            shareBtn.textContent = 'Copied!'
            setTimeout(() => { shareBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share' }, 1500)
          }).catch(() => {})
        }
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [39.8283, -98.5795],
      zoom: 4,
      scrollWheelZoom: true,
      zoomControl: true,
    })

    const tileUrl = isDark ? TILE_DARK : TILE_LIGHT
    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map)

    map.zoomControl.setPosition('bottomright')

    map.on('click', () => {
      setTimeout(() => {
        if (!isClickingMarkerRef.current) {
          onVenueSelectRef.current(null)
        }
        isClickingMarkerRef.current = false
      }, 50)
    })

    // Deselect on map drag
    map.on('dragstart', () => {
      onVenueSelectRef.current(null)
    })

    // Deselect on popup close
    map.on('popupclose', () => {
      onVenueSelectRef.current(null)
    })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Swap tile layer when dark mode changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !tileLayerRef.current) return
    tileLayerRef.current.setUrl(isDark ? TILE_DARK : TILE_LIGHT)
  }, [isDark])

  // User location marker
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current)
      userMarkerRef.current = null
    }

    if (userLocation) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserLocationIcon(),
        zIndexOffset: 1000,
      }).addTo(map)
    }
  }, [userLocation])

  // Update markers when venues change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current)
    }

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        let size = 38
        if (count >= 10) size = 46
        if (count >= 25) size = 54

        return L.divIcon({
          html: `<div class="venue-cluster" style="width:${size}px;height:${size}px;">${count}</div>`,
          className: 'venue-cluster-wrapper',
          iconSize: [size, size],
        })
      },
    })

    const newMarkers = {}

    venues.forEach((venue) => {
      if (!venue.lat || !venue.lng) return

      const isFav = favoriteIds?.has(venue.id) || false
      const marker = L.marker([venue.lat, venue.lng], {
        icon: createVenueIcon(venue, venue.id === activeVenueId),
      })

      marker.bindPopup(createPopupContent(venue, isDark, isFav), {
        closeButton: true,
        className: 'venue-popup',
      })

      marker.on('click', () => {
        isClickingMarkerRef.current = true
        onVenueSelectRef.current(venue.id)
      })

      clusterGroup.addLayer(marker)
      newMarkers[venue.id] = marker
    })

    map.addLayer(clusterGroup)
    clusterGroupRef.current = clusterGroup
    markersRef.current = newMarkers
  }, [venues, isDark, favoriteIds])

  // Update active marker without rebuilding
  useEffect(() => {
    const markers = markersRef.current

    venues.forEach((venue) => {
      const marker = markers[venue.id]
      if (marker) {
        marker.setIcon(createVenueIcon(venue, venue.id === activeVenueId))
      }
    })

    if (activeVenueId) {
      const activeVenue = venues.find((v) => v.id === activeVenueId)
      if (activeVenue) {
        const marker = markers[activeVenue.id]
        if (marker) {
          mapInstanceRef.current?.setView([activeVenue.lat, activeVenue.lng], 13, { animate: true })
          marker.openPopup()
        }
      }
    }
  }, [activeVenueId, venues])

  return (
    <div
      ref={mapRef}
      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex-shrink-0 relative z-0"
      style={{ height: 420 }}
    />
  )
})

export default VenueMap
