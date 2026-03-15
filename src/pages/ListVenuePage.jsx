import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { CATEGORIES } from '../lib/seedData'
import confetti from 'canvas-confetti'
import { CheckCircle, TrendingUp, Users, Tv, DollarSign, ArrowLeft, Zap, BarChart3, ChevronDown, Clock, Shield, Star, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_SHORT = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' }

// Generate time options in 30-min increments
const TIME_OPTIONS = (() => {
  const opts = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const displayH = h % 12 || 12
      const ampm = h < 12 ? 'AM' : 'PM'
      const label = `${displayH}:${String(m).padStart(2, '0')} ${ampm}`
      opts.push({ value: val, label })
    }
  }
  return opts
})()

const defaultTimes = DAYS.reduce((acc, day) => {
  acc[day] = { open: '11:00', close: '23:00', closed: false }
  return acc
}, {})

// World Cup starts June 11, 2026
const WC_START = new Date('2026-06-11T00:00:00')

function Countdown() {
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
    <div className="bg-gray-900 dark:bg-white rounded-2xl p-5 text-white dark:text-gray-900 text-center">
      <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Kickoff in</div>
      <div className="flex items-center justify-center gap-2.5">
        {[
          { value: days, label: 'Days' },
          { value: hours, label: 'Hrs' },
          { value: minutes, label: 'Min' },
          { value: seconds, label: 'Sec' },
        ].map((unit) => (
          <div key={unit.label} className="flex flex-col items-center">
            <span className="text-2xl font-bold tabular-nums leading-none">{String(unit.value).padStart(2, '0')}</span>
            <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">{unit.label}</span>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-gray-500 mt-2">June 11, 2026 — Opening Match</div>
    </div>
  )
}

function TimeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const listRef = useRef(null)

  const currentLabel = TIME_OPTIONS.find((o) => o.value === value)?.label || value

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Scroll to selected item when opened
  useEffect(() => {
    if (open && listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]')
      if (selected) selected.scrollIntoView({ block: 'center' })
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer min-w-[110px] text-left"
      >
        <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        <span className="flex-1 text-gray-700 dark:text-gray-300">{currentLabel}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          ref={listRef}
          className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50"
        >
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                opt.value === value
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function fireConfetti() {
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100000 }
  confetti({ ...defaults, particleCount: 50, origin: { x: 0.3, y: 0.6 } })
  confetti({ ...defaults, particleCount: 50, origin: { x: 0.7, y: 0.6 } })
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 30, origin: { x: 0.5, y: 0.4 } })
  }, 200)
}

const TESTIMONIALS = [
  {
    quote: "During the 2022 World Cup we were packed every game. This time we're listing early to make sure fans can find us from day one.",
    name: 'Mike R.',
    role: 'Sports bar owner, Brooklyn',
    initial: 'M',
  },
  {
    quote: "We saw a 400% increase in foot traffic during the last tournament. Being listed here meant fans knew exactly where to go.",
    name: 'Sarah L.',
    role: 'Restaurant manager, Chicago',
    initial: 'S',
  },
  {
    quote: "Best $10 we ever spent. We had lines out the door for every knockout round game. Fans kept coming back the whole tournament.",
    name: 'James T.',
    role: 'Pub owner, Austin',
    initial: 'J',
  },
  {
    quote: "Our regulars loved it, and we picked up dozens of new customers who found us through the map. Already listed for 2026!",
    name: 'Carlos M.',
    role: 'Bar & grill owner, Miami',
    initial: 'C',
  },
  {
    quote: "The atmosphere was electric. Fans came specifically because they saw we had big screens and drink specials listed.",
    name: 'Priya K.',
    role: 'Sports lounge owner, LA',
    initial: 'P',
  },
]

function TestimonialSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const t = TESTIMONIALS[current]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
      <MessageCircle className="w-4 h-4 text-gray-300 dark:text-gray-600 mb-2" />
      <p className="text-[11px] text-gray-600 dark:text-gray-400 italic leading-relaxed min-h-[48px]">
        "{t.quote}"
      </p>
      <div className="mt-2 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-gray-900 text-[9px] font-semibold">{t.initial}</div>
        <div>
          <p className="text-[10px] font-medium text-gray-900 dark:text-gray-100">{t.name}</p>
          <p className="text-[9px] text-gray-400 dark:text-gray-500">{t.role}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-1">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer border-0 p-0 ${
                i === current ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrent((current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer border-0 p-0"
          >
            <ChevronLeft className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setCurrent((current + 1) % TESTIMONIALS.length)}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer border-0 p-0"
          >
            <ChevronRight className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

const FAQ_ITEMS = [
  {
    q: 'How quickly will my venue appear on the map?',
    a: 'Most venues are reviewed and added within 24 hours. Early listers get priority review and featured placement during the tournament.',
  },
  {
    q: 'Can I update my listing later?',
    a: 'Absolutely. Once listed, you can update your hours, photos, and details anytime by contacting us.',
  },
  {
    q: 'What happens after I submit?',
    a: 'We\'ll verify your venue details and add you to the map. You\'ll receive a confirmation email with your live listing link.',
  },
  {
    q: 'Is there a contract or subscription?',
    a: 'No. It\'s a one-time $10 fee that covers your listing for the entire tournament and beyond. No hidden costs, no renewals.',
  },
]

function FAQItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left bg-transparent border-0 cursor-pointer"
      >
        <span className="text-xs font-medium text-gray-900 dark:text-gray-100 pr-4">{item.q}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400 pb-3 leading-relaxed">{item.a}</p>
      )}
    </div>
  )
}

export default function ListVenuePage() {
  const [form, setForm] = useState({
    name: '',
    category: '',
    custom_category: '',
    address: '',
    city: '',
    state: '',
    website: '',
    maps_link: '',
    opening_times: { ...defaultTimes },
    logo: null,
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const updateTime = (day, field, value) => {
    setForm((prev) => ({
      ...prev,
      opening_times: {
        ...prev.opening_times,
        [day]: { ...prev.opening_times[day], [field]: value },
      },
    }))
  }

  const toggleClosed = (day) => {
    setForm((prev) => ({
      ...prev,
      opening_times: {
        ...prev.opening_times,
        [day]: { ...prev.opening_times[day], closed: !prev.opening_times[day].closed },
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (isSupabaseConfigured()) {
      let logoUrl = null
      if (form.logo) {
        const fileExt = form.logo.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { data: uploadData } = await supabase.storage
          .from('venue-logos')
          .upload(fileName, form.logo)
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('venue-logos').getPublicUrl(fileName)
          logoUrl = urlData.publicUrl
        }
      }

      await supabase.from('venues').insert({
        name: form.name,
        category: form.category,
        custom_category: form.custom_category || null,
        address: form.address,
        city: form.city,
        state: form.state,
        website: form.website || null,
        maps_link: form.maps_link || null,
        opening_times: form.opening_times,
        logo_url: logoUrl,
        lat: null,
        lng: null,
      })
    }

    setLoading(false)
    setSubmitted(true)
    fireConfetti()
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center font-sans">
        <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">You're on the list!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          We'll review your submission and add your venue to the map.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to map
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 mb-5 no-underline">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to map
      </Link>

      {/* Hero banner with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white mb-6">
        {/* Football logo watermark */}
        <svg className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 opacity-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8L15.8043 10.7639M12 8L8.1958 10.7639M12 8V5M15.8043 10.7639L14.3512 15.2361M15.8043 10.7639L18.5 9.5M14.3512 15.2361H9.64889M14.3512 15.2361L16 17.5M9.64889 15.2361L8.1958 10.7639M9.64889 15.2361L8 17.5M8.1958 10.7639L5.5 9.5M5.5 9.5L2.04938 13M5.5 9.5L4.5 5.38544M18.5 9.5L21.9506 13M18.5 9.5L19.5 5.38544M12 5L8.62434 2.58409M12 5L15.3757 2.58409M8 17.5L3.33782 17M8 17.5L10.5 21.8883M16 17.5L20.6622 17M16 17.5L13.5 21.8883M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-100 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full mb-3 uppercase tracking-wider">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8L15.8043 10.7639M12 8L8.1958 10.7639M12 8V5M15.8043 10.7639L14.3512 15.2361M15.8043 10.7639L18.5 9.5M14.3512 15.2361H9.64889M14.3512 15.2361L16 17.5M9.64889 15.2361L8.1958 10.7639M9.64889 15.2361L8 17.5M8.1958 10.7639L5.5 9.5M5.5 9.5L2.04938 13M5.5 9.5L4.5 5.38544M18.5 9.5L21.9506 13M18.5 9.5L19.5 5.38544M12 5L8.62434 2.58409M12 5L15.3757 2.58409M8 17.5L3.33782 17M8 17.5L10.5 21.8883M16 17.5L20.6622 17M16 17.5L13.5 21.8883M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            FIFA World Cup 2026
          </div>
          <h1 className="text-xl sm:text-2xl font-bold leading-tight max-w-lg">
            Get your venue in front of millions of fans
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1.5 max-w-md">
            5B+ viewers. 104 matches. 39 days. Will fans find your venue?
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm font-medium bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              300% more traffic on game days
            </div>
            <div className="flex items-center gap-2 text-sm font-medium bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              $10 one-time listing
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — form (primary CTA) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">List your venue</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Takes less than 2 minutes</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                <Shield className="w-3 h-3" />
                Verified listing
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Venue name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="The Goal Line Sports Bar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {form.category === 'Other' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Custom category</label>
                  <input
                    type="text"
                    value={form.custom_category}
                    onChange={(e) => updateField('custom_category', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="BBQ Joint"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">State/Province *</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="https://yoursite.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Google Maps link</label>
                  <input
                    type="url"
                    value={form.maps_link}
                    onChange={(e) => updateField('maps_link', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 focus:border-gray-300 dark:focus:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Logo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updateField('logo', e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-gray-800 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-700 file:cursor-pointer"
                />
              </div>

              {/* Opening times */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Opening hours</label>
                <div className="space-y-2">
                  {DAYS.map((day) => {
                    const isOpen = !form.opening_times[day].closed
                    return (
                      <div key={day} className="flex items-center gap-3 py-1">
                        <span className="w-10 text-xs font-medium text-gray-500 dark:text-gray-400">{DAY_SHORT[day]}</span>
                        <button
                          type="button"
                          onClick={() => toggleClosed(day)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                            isOpen ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 shadow-sm transition-transform ${
                              isOpen ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        {isOpen ? (
                          <div className="flex items-center gap-2">
                            <TimeDropdown
                              value={form.opening_times[day].open}
                              onChange={(val) => updateTime(day, 'open', val)}
                            />
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">to</span>
                            <TimeDropdown
                              value={form.opening_times[day].close}
                              onChange={(val) => updateTime(day, 'close', val)}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">Closed</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Submitting...' : 'List my venue for $10'}
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure checkout</span>
                <span>No subscription</span>
                <span>Live in 24hrs</span>
              </div>
            </form>
          </div>

          {/* FAQ */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Frequently asked questions</h3>
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} item={item} />
            ))}
          </div>
        </div>

        {/* Right column — trust signals (sticky) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-[80px] space-y-4">
            <Countdown />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3.5 text-center">
                <Users className="w-4 h-4 text-emerald-500 mx-auto mb-1.5" />
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">5B+</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">TV viewers in 2022</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3.5 text-center">
                <Tv className="w-4 h-4 text-emerald-500 mx-auto mb-1.5" />
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">1.5B</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">Watched the 2022 final</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3.5 text-center">
                <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1.5" />
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">300%</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">Bar traffic on game days</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3.5 text-center">
                <DollarSign className="w-4 h-4 text-emerald-500 mx-auto mb-1.5" />
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">$48B</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">Economic impact est.</div>
              </div>
            </div>

            {/* Social proof */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-2">
                  {['A', 'B', 'C', 'D'].map((letter, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-gray-900 text-[10px] font-semibold border-2 border-white dark:border-gray-900">
                      {letter}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">+247 venues</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                Join hundreds of bars, restaurants, and pubs already listed for the biggest sporting event in history.
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
              <div className="flex items-start gap-2.5">
                <Zap className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Instant map visibility</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Fans find you when searching nearby</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">39 days of repeat traffic</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Fans return to their spot every game</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Star className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Featured placement</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Early listers get priority during tournament</p>
                </div>
              </div>
            </div>

            {/* Testimonial slider */}
            <TestimonialSlider />
          </div>
        </div>
      </div>
    </div>
  )
}
