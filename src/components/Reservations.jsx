import { IconPlus } from './Icons'

const CALENDAR_ID = 'ca65bb4a6552d5fd299d794cd3d1324bfdb89f980414d0620b51a7b1da0e1934@group.calendar.google.com'

export default function Reservations() {
  const embedUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&mode=WEEK&hl=fr&ctz=Europe/Paris&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&wkst=2`

  const newEventUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&add=${encodeURIComponent(CALENDAR_ID)}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-900">Calendrier du bureau</h2>
        <a
          href={newEventUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <IconPlus className="w-4 h-4" />
          Reserver le bureau
        </a>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full border-0"
          style={{ height: 'calc(100dvh - 180px)', minHeight: '500px' }}
          title="Calendrier Bureau"
        />
      </div>
    </div>
  )
}
