"use client"

import React, { useState } from 'react'
import { UploadCloud, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react'

export default function ImportProductsPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [file, setFile] = useState<File | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      // In next iteration, we will use papaparse here to preview data and jump to step 2
      setStep(2)
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Import Products</h1>
        <p className="text-slate-500 mt-2">Bulk upload new product entities, or update existing ones by mapping slug.</p>
      </div>

      {/* Progress Wizard */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-blue-100' : 'bg-slate-100'}`}>1</div>
          Upload
        </div>
        <div className="h-px w-8 bg-slate-200"></div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-blue-100' : 'bg-slate-100'}`}>2</div>
          Preview & Validate
        </div>
        <div className="h-px w-8 bg-slate-200"></div>
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${step >= 3 ? 'bg-blue-100' : 'bg-slate-100'}`}>3</div>
          Execute
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        {step === 1 && (
          <div className="text-center py-12">
            <UploadCloud className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload CSV or JSON File</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Any column prefixed with <code className="bg-slate-100 px-1 py-0.5 rounded text-red-500">spec_</code> will be automatically nested into the JSONB specs object.
            </p>
            <div className="flex justify-center">
              <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                <FileSpreadsheet className="h-4 w-4" />
                Select File
              </label>
              <input id="file-upload" type="file" accept=".csv,.json" className="hidden" onChange={handleFileUpload} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-semibold text-slate-900">Preview Data ({file?.name})</h3>
               <button onClick={() => setStep(1)} className="text-sm font-medium text-slate-500 hover:text-slate-800">Cancel</button>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-slate-500">
               CSV parsing via Papaparse will render the data table here.
               <div className="mt-6 flex justify-center gap-4">
                 <button className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors">
                   Skip Duplicates
                 </button>
                 <button onClick={() => setStep(3)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                   Continue & Import
                 </button>
               </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
               <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Import Successful</h3>
            <p className="text-slate-500 mb-6">Your products have been processed and fed into the database.</p>
            <button onClick={() => setStep(1)} className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">
              Import Another File
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
