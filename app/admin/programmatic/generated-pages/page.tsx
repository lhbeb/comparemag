"use client"

import { FileText, CheckCircle, Clock, Search, Edit } from "lucide-react"

export default function GeneratedPagesDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Generated Pages</h1>
          <p className="text-slate-500 mt-2">Review, edit, and publish programmatically generated articles.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search pages..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white">
              <option>All Statuses</option>
              <option>Draft</option>
              <option>Generated</option>
              <option>Reviewed</option>
              <option>Published</option>
            </select>
          </div>
        </div>

        {/* Table Mockup */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Page Target</th>
                <th className="px-6 py-4 font-medium">Template</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { title: "Best Budget Smartphones Under $500", template: "best-category-under-price", status: "published" },
                { title: "iPhone 15 vs Samsung Galaxy S24", template: "brand-vs-brand", status: "reviewed" },
                { title: "Best Gaming Laptops for Students", template: "best-category-usecase", status: "generated" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.title}</td>
                  <td className="px-6 py-4 text-slate-500"><code className="bg-slate-100 px-2 py-1 rounded text-xs">{row.template}</code></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                      ${row.status === 'published' ? 'bg-green-100 text-green-700' : 
                        row.status === 'reviewed' ? 'bg-blue-100 text-blue-700' : 
                        row.status === 'generated' ? 'bg-amber-100 text-amber-700' : 
                        'bg-slate-100 text-slate-700'}`}
                    >
                      {row.status === 'published' && <CheckCircle className="h-3 w-3" />}
                      {row.status === 'reviewed' && <FileText className="h-3 w-3" />}
                      {row.status === 'generated' && <Clock className="h-3 w-3" />}
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-end gap-1 ml-auto">
                      <Edit className="h-4 w-4" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
