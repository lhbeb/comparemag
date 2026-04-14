"use client"

import React, { useState } from 'react'
import { DownloadCloud, CheckCircle, Database } from 'lucide-react'

export default function ExportDataPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    // Placeholder: Fetch from Supabase, convert to CSV, trigger download
    setTimeout(() => {
      setIsExporting(false)
      setExportComplete(true)
    }, 1500)
  }

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
          
          {exportComplete ? (
            <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg border border-green-100">
               <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
               <p className="text-green-800 font-semibold mb-4">Export downloaded successfully!</p>
               <button 
                 onClick={() => setExportComplete(false)}
                 className="text-sm text-green-700 hover:text-green-900 font-medium"
               >
                 Export again
               </button>
            </div>
          ) : (
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className={`w-full flex justify-center items-center gap-2 py-3 rounded-lg font-semibold text-white transition-all ${
                isExporting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-sm'
              }`}
            >
              {isExporting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Generating CSV...
                </span>
              ) : (
                <>
                  <DownloadCloud className="h-5 w-5" /> Download Product Catalog (.csv)
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
