import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { create, getWhere, remove, update } from '../services/store'
import type { Announcement, AnnouncementCategory } from '../types'
import { AnnouncementList } from '../components/Announcements'
import { useToast } from '../components/Shared'

const CATEGORIES: AnnouncementCategory[] = ['Academic', 'Event', 'Exam', 'Holiday', 'Urgent']

const empty = { title: '', message: '', category: 'Academic' as AnnouncementCategory, isUrgent: false, expiresAt: '' }

export default function CRDashboard() {
  const { user } = useAuth()
  const { push } = useToast()
  const [items, setItems] = useState<Announcement[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)

  async function refresh() {
    if (!user) return
    const mine = await getWhere<Announcement>('announcements', 'authorId', user.uid)
    setItems(mine.sort((a, b) => b.createdAt - a.createdAt))
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function draft(): Announcement {
    return {
      id: editingId ?? '',
      title: form.title,
      message: form.message,
      category: form.category,
      isUrgent: form.isUrgent,
      authorId: user!.uid,
      authorName: user!.name,
      createdAt: Date.now(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).getTime() : undefined,
      isActive: true,
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (editingId) {
      await update('announcements', editingId, draft())
      push('Announcement updated', 'success')
    } else {
      await create('announcements', draft())
      push('Announcement published', 'success')
    }
    setForm(empty)
    setEditingId(null)
    setPreview(false)
    refresh()
  }

  function editItem(a: Announcement) {
    setEditingId(a.id)
    setForm({
      title: a.title,
      message: a.message,
      category: a.category,
      isUrgent: a.isUrgent,
      expiresAt: a.expiresAt ? new Date(a.expiresAt).toISOString().slice(0, 10) : '',
    })
  }

  async function del(id: string) {
    await remove('announcements', id)
    push('Announcement deleted', 'success')
    refresh()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="card">
        <h2 className="font-bold text-lg mb-3">{editingId ? 'Edit announcement' : 'New announcement'}</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="input" placeholder="Title" required
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="input" placeholder="Message" required rows={4}
            value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="input" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as AnnouncementCategory })}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              className="input" type="date" value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox" checked={form.isUrgent}
              onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
            />
            Mark as urgent
          </label>
          <div className="flex gap-2">
            <button type="button" className="btn-outline" onClick={() => setPreview((p) => !p)}>
              {preview ? 'Hide preview' : 'Preview'}
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingId ? 'Save changes' : 'Publish'}
            </button>
            {editingId && (
              <button type="button" className="btn-outline" onClick={() => { setEditingId(null); setForm(empty) }}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {preview && form.title && (
          <div className="mt-4">
            <AnnouncementList items={[draft()]} />
          </div>
        )}
      </div>

      <div>
        <h2 className="font-bold text-lg mb-3">Your announcements</h2>
        <AnnouncementList
          items={items}
          actionsFor={(a) => (
            <div className="flex gap-2 shrink-0">
              <button className="btn-outline text-xs" onClick={() => editItem(a)}>Edit</button>
              <button className="btn-outline text-xs" onClick={() => del(a.id)}>Delete</button>
            </div>
          )}
        />
      </div>
    </div>
  )
}
