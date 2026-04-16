import React from 'react'
import { UploadCloud, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ImportProductsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Import Products</h1>
        <p className="text-slate-500 mt-2">Bulk upload new product entities, or update existing ones by mapping slug.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Feature Under Construction</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            The CSV/JSON ingestion pipeline is currently being built in Phase 2 of the CMS rollout. Please use the individual Product Editor to add items for now.
          </p>
          <Link href="/admin/products/new" className="inline-flex px-5 py-2.5 bg-blue-600 font-semibold text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Product Manually
          </Link>
        </div>
      </div>
    </div>
  )
}
