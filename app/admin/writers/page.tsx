import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAllWriters } from '@/lib/supabase/writers'
import { Plus, Edit, User, Award, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

async function getEditors() {
  try {
    return await getAllWriters()
  } catch (error) {
    console.error('Error fetching editors:', error)
    return []
  }
}

export default async function EditorsPage() {
  const editors = await getEditors()

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans" style={{ letterSpacing: '-0.025em' }}>
            Editors & Experts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your editorial team and their public profiles.
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 !text-white">
          <Link href="/admin/writers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Editor
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Total Editors', value: editors.length, color: 'var(--admin-primary)', bg: 'var(--admin-primary-light)' },
          { label: 'Active Contributors', value: editors.length, color: 'var(--admin-success)', bg: 'var(--admin-success-bg)' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl px-5 py-4 flex items-center gap-4 bg-white border border-slate-200 shadow-sm"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
              style={{ background: stat.bg, color: stat.color }}
            >
              {stat.value}
            </div>
            <span className="text-sm font-semibold text-slate-600">{stat.label}</span>
          </div>
        ))}
      </div>

      {editors.length === 0 ? (
        <div className="text-center py-20 rounded-2xl flex flex-col items-center gap-4 bg-white border border-dashed border-slate-200">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50">
            <User className="h-7 w-7 text-slate-400" />
          </div>
          <div>
            <p className="font-semibold mb-1 text-slate-900">No editors yet</p>
            <p className="text-sm text-slate-500">Add your first contributor to start assigning articles.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {editors.map((editor) => (
            <div
              key={editor.id}
              className="admin-card bg-white p-6 flex flex-col transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {editor.avatar_url ? (
                    <img
                      src={editor.avatar_url}
                      alt={editor.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-50 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-100 border-2 border-white shadow-sm">
                      <User className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 truncate leading-tight">{editor.name}</h3>
                    {editor.specialty && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                        {editor.specialty}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {editor.bio && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-6 flex-1 italic">
                  "{editor.bio}"
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[10px] font-mono text-slate-400">{editor.slug}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:text-blue-600">
                    <Link href={`/admin/writers/edit/${editor.slug}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-full hover:bg-slate-50">
                    <Link href={`/writers/${editor.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
