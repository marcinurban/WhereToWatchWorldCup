import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Copy, Check, MessageCircle, MessageSquare, Smartphone } from 'lucide-react'

export default function ShareModal({ venue, onClose }) {
  const [copied, setCopied] = useState(false)

  const shareText = `Check out ${venue.name} — ${venue.address}, ${venue.city}, ${venue.state}`
  const shareUrl = venue.maps_link || venue.website || ''
  const fullText = shareUrl ? `${shareText}\n${shareUrl}` : shareText

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const shareOptions = [
    {
      label: copied ? 'Copied!' : 'Copy link',
      icon: copied ? Check : Copy,
      onClick: handleCopy,
      highlight: copied,
    },
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank'),
    },
    {
      label: 'Messenger',
      icon: MessageSquare,
      onClick: () => window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=966242223397117&redirect_uri=${encodeURIComponent(window.location.href)}`, '_blank'),
    },
    {
      label: 'SMS',
      icon: Smartphone,
      onClick: () => window.open(`sms:?body=${encodeURIComponent(fullText)}`),
    },
  ]

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-xs shadow-2xl font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{venue.name}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{venue.city}, {venue.state}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer bg-transparent border-0 transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Share options */}
        <div className="p-3 grid grid-cols-2 gap-2">
          {shareOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.onClick}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                opt.highlight
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 hover:border-gray-900 dark:hover:border-white'
              }`}
            >
              <opt.icon className="w-5 h-5" />
              <span className="text-[11px] font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
