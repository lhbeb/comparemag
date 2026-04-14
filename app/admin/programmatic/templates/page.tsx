"use client"

import Link from "next/link"
import { Wand2, LayoutTemplate, Plus } from "lucide-react"

const templates = [
  { id: 1, name: "Best [Category] Under [Price]", slug: "best-category-under-price", usage: 12 },
  { id: 2, name: "[Brand] vs [Brand] Smartphones", slug: "brand-vs-brand", usage: 7 },
  { id: 3, name: "Best [Category] for [Use Case]", slug: "best-category-usecase", usage: 24 }
]

export default function ProgrammaticTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Routing Templates</h1>
          <p className="text-slate-500 mt-2">Manage the scaffolding for generated programmatic pages.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
          <Plus className="h-4 w-4" /> New Template
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{t.name}</h3>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-4 mt-2">
              <span>{t.slug}</span>
              <span className="font-semibold text-slate-700">{t.usage} generated</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
