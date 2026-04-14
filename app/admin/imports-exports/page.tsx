import Link from "next/link"
import { Database, DownloadCloud, UploadCloud, FileJson, FileSpreadsheet } from "lucide-react"

export default function ImportsExportsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Imports & Exports</h1>
        <p className="text-slate-500 mt-2">Manage your programmatic data pipelines. Bulk-upload products or export existing data for spreadsheet manipulation.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        
        {/* Import Products */}
        <Link href="/admin/imports-exports/import-products" className="group">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Import Products</h2>
            </div>
            <p className="text-slate-600 text-sm">
              Upload a CSV or JSON file to bulk add or update product cards. Perfect for mass ingestion of specs, prices, and affiliate links.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-md"><FileSpreadsheet className="h-3.5 w-3.5" /> CSV</span>
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-md"><FileJson className="h-3.5 w-3.5" /> JSON</span>
            </div>
          </div>
        </Link>
        
        {/* Import Programmatic Data (Coming Soon) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm opacity-60">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-slate-100 text-slate-500 p-3 rounded-lg">
                <Database className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Import Programmatic Data</h2>
            </div>
            <p className="text-slate-600 text-sm">
              Bulk define new categories, brands, templates, and use-cases. (Coming shortly in Phase 2)
            </p>
        </div>

        {/* Export Data */}
        <Link href="/admin/imports-exports/export-data" className="group">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-green-400 hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-50 text-green-600 p-3 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                <DownloadCloud className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Export Data</h2>
            </div>
            <p className="text-slate-600 text-sm">
              Download your entire product catalog to CSV. Make bulk edits in Excel, then re-upload using the Import Products tool with Overwrite enabled.
            </p>
          </div>
        </Link>

      </div>
    </div>
  )
}
