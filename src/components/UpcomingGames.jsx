import { useState } from 'react'
import { createPortal } from 'react-dom'
import { tournamentSchedule, TIMEZONES } from '../lib/seedData'
import { Calendar, X, ChevronRight } from 'lucide-react'

// Adjust time string by offset hours
function adjustTime(timeStr, offset) {
  if (offset === 0) return timeStr
  const [h, m] = timeStr.split(':').map(Number)
  let newH = (h + offset + 24) % 24
  return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function TimezoneSelector({ timezone, setTimezone }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-gray-400 dark:text-gray-500">TZ:</span>
      {TIMEZONES.map((t) => (
        <button
          key={t.label}
          onClick={() => setTimezone(t.label)}
          className={`px-1.5 py-0.5 text-[10px] font-medium rounded cursor-pointer border transition-colors ${
            timezone === t.label
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
              : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function GameRow({ game, tzOffset, tzLabel }) {
  const displayTime = adjustTime(game.time, tzOffset)
  return (
    <div className="px-3 py-1.5 flex items-center gap-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex-shrink-0 text-center w-14">
        <div className="text-[10px] text-gray-400 dark:text-gray-500">{game.date}</div>
        <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{displayTime} {tzLabel}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-gray-100">
          <span>{game.flagA}</span>
          <span className="font-medium text-xs">{game.teamA}</span>
          <span className="text-gray-300 dark:text-gray-600 text-[10px] mx-0.5">vs</span>
          <span className="font-medium text-xs">{game.teamB}</span>
          <span>{game.flagB}</span>
        </div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{game.venue}</div>
      </div>
      <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
        {game.group}
      </span>
    </div>
  )
}

function ScheduleModal({ onClose, tz, timezone, setTimezone }) {
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-xl max-h-[85vh] flex flex-col font-sans shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Full Tournament Schedule</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">FIFA World Cup 2026 &middot; Times in {tz.full}</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer bg-transparent border-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <TimezoneSelector timezone={timezone} setTimezone={setTimezone} />
        </div>

        {/* Schedule grouped by round */}
        <div className="overflow-y-auto flex-1">
          {tournamentSchedule.map((round, idx) => (
            <div key={round.round}>
              {idx > 0 && <hr className="border-gray-200 dark:border-gray-800 mx-4" />}
              <div className="px-4 py-2 sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <span className="text-[11px] font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">{round.round}</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {round.games.map((game) => (
                  <GameRow key={game.id} game={game} tzOffset={tz.offset} tzLabel={tz.label} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function UpcomingGames({ timezone, setTimezone }) {
  const [showModal, setShowModal] = useState(false)
  const tz = TIMEZONES.find((t) => t.label === timezone) || TIMEZONES[0]

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden font-sans flex flex-col h-full">
        {/* Header with timezone */}
        <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">Upcoming Games</h3>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer bg-transparent border-0 p-0"
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <TimezoneSelector timezone={timezone} setTimezone={setTimezone} />
        </div>

        {/* Scrollable schedule with group divisions */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {tournamentSchedule.map((round, idx) => (
            <div key={round.round}>
              {idx > 0 && <hr className="border-gray-200 dark:border-gray-800 mx-3 my-0" />}
              <div className="px-3 py-1.5 sticky top-0 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700">
                <span className="text-[10px] font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">{round.round}</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {round.games.map((game) => (
                  <GameRow key={game.id} game={game} tzOffset={tz.offset} tzLabel={tz.label} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full schedule modal — rendered via portal */}
      {showModal && <ScheduleModal onClose={() => setShowModal(false)} tz={tz} timezone={timezone} setTimezone={setTimezone} />}
    </>
  )
}
