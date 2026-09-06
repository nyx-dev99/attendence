import type { Announcement } from '../types'

const CATEGORY_COLORS: Record<string, string> = {
  Academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  Event: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
  Exam: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  Holiday: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  Urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
}

export function isAnnouncementLive(a: Announcement): boolean {
  if (!a.isActive) return false
  if (a.expiresAt && a.expiresAt < Date.now()) return false
  return true
}

export function AnnouncementCard({
  a,
  actions,
}: {
  a: Announcement
  actions?: React.ReactNode
}) {
  return (
    <div className={`card border-l-4 ${a.isUrgent ? 'border-red-500' : 'border-transparent'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{a.title}</h3>
            <span className={`badge ${CATEGORY_COLORS[a.category]}`}>{a.category}</span>
            {a.isUrgent && <span className="badge bg-red-500 text-white">URGENT</span>}
          </div>
          <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">{a.message}</p>
          <p className="text-xs mt-2 text-slate-400">
            {a.authorName} · {new Date(a.createdAt).toLocaleDateString()}
            {a.expiresAt ? ` · expires ${new Date(a.expiresAt).toLocaleDateString()}` : ''}
          </p>
        </div>
        {actions}
      </div>
    </div>
  )
}

export function AnnouncementList({
  items,
  actionsFor,
}: {
  items: Announcement[]
  actionsFor?: (a: Announcement) => React.ReactNode
}) {
  if (items.length === 0) return <p className="text-sm text-slate-500">No announcements yet.</p>
  return (
    <div className="space-y-3">
      {items.map((a) => (
        <AnnouncementCard key={a.id} a={a} actions={actionsFor?.(a)} />
      ))}
    </div>
  )
}
