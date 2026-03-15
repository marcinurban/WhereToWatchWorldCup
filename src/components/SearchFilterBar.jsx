import { Search, X } from 'lucide-react'
import { CATEGORIES, CATEGORY_EMOJI } from '../lib/seedData'

export default function SearchFilterBar({ searchQuery, setSearchQuery, activeCategories, setActiveCategories }) {
  const toggleCategory = (cat) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const clearAll = () => {
    setSearchQuery('')
    setActiveCategories([])
  }

  const hasFilters = searchQuery || activeCategories.length > 0

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200/60 dark:border-gray-800/60 sticky top-14 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-2.5">
          {/* Search input — matches chip height */}
          <div className="relative flex-shrink-0 w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venues or cities..."
              className="w-full pl-9 pr-3 py-[7px] text-xs font-sans bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/10 focus:border-gray-300 dark:focus:border-gray-600 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

          {/* Category chips with emojis */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar flex-1 min-w-0">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategories.includes(cat)
              const emoji = CATEGORY_EMOJI[cat] || ''
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-[7px] text-xs font-medium font-sans rounded-lg border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="text-sm leading-none">{emoji}</span>
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-[7px] text-xs font-medium font-sans text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
