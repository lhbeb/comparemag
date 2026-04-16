import React from 'react'
import { DownloadCloud, AlertCircle, Database } from 'lucide-react'

export default function ExportDataPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Export Database</h1>
        <p className="text-slate-500 mt-2">Download products to a CSV for quick spreadsheet editing.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-lg text-green-600">
               <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Export All Products</h3>
              <p className="text-sm text-slate-500">Includes all JSON.specs flattened to `spec_` columns for easy editing.</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-lg border border-slate-100 text-center">
             <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
             <p className="text-slate-700 font-semibold mb-2">Feature Under Construction</p>
             <p className="text-sm text-slate-500">
               The database export pipeline is currently being finalized. Check back in Phase 2 for full CSV payload generation.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
