'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { AlertCircle, CheckCircle2, RefreshCw, Upload } from 'lucide-react'

interface ArticleImportButtonProps {
  className?: string
  variant?: 'default' | 'outline'
  showInlineFeedback?: boolean
}

type ImportFeedback =
  | {
      status: 'success'
      title: string
      message: string
      detail?: string | null
      fileName?: string
    }
  | {
      status: 'warning'
      title: string
      message: string
      detail?: string | null
      fileName?: string
    }
  | {
      status: 'error'
      title: string
      message: string
      detail?: string | null
      fileName?: string
    }

type ImportResult = ImportFeedback

async function importArticleFile(file: File): Promise<ImportResult> {
  const fileText = await file.text()
  let parsed: unknown

  try {
    parsed = JSON.parse(fileText)
  } catch {
    throw new Error('The selected file is not valid JSON.')
  }

  const response = await fetch('/api/articles/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parsed),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const errorMessage = payload?.reason
      ? `${payload?.message || 'Failed to import article.'} ${payload.reason}`
      : payload?.message || 'Failed to import article.'
    throw new Error(errorMessage)
  }

  const feedbackStatus = payload?.action === 'updated' ? 'warning' : 'success'
  const successTitle = payload?.action === 'updated' ? 'Article updated' : 'Article imported'
  const successMessage = payload?.title
    ? `"${payload.title}" is now available in the admin.`
    : 'The article import completed successfully.'

  return {
    status: feedbackStatus,
    title: successTitle,
    message: successMessage,
    detail: payload?.reason || null,
    fileName: file.name,
  }
}

export function ArticleImportButton({
  className,
  variant = 'outline',
  showInlineFeedback = true,
}: ArticleImportButtonProps) {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = React.useState(false)
  const [feedback, setFeedback] = React.useState<ImportFeedback | null>(null)
  const [results, setResults] = React.useState<ImportResult[]>([])
  const [progress, setProgress] = React.useState({ current: 0, total: 0 })
  const [currentFileName, setCurrentFileName] = React.useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''

    if (files.length === 0) return

    setIsImporting(true)
    setFeedback(null)
    setResults([])
    setProgress({ current: 0, total: files.length })
    setCurrentFileName(null)

    const nextResults: ImportResult[] = []

    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      setProgress({ current: index + 1, total: files.length })
      setCurrentFileName(file.name)

      try {
        const result = await importArticleFile(file)
        nextResults.push(result)
        setResults([...nextResults])
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unable to import article right now.'
        const result: ImportResult = {
          status: 'error',
          title: 'Import failed',
          message: errorMessage,
          fileName: file.name,
        }
        nextResults.push(result)
        setResults([...nextResults])
      }
    }

    const successCount = nextResults.filter((result) => result.status === 'success').length
    const updatedCount = nextResults.filter((result) => result.status === 'warning').length
    const failedCount = nextResults.filter((result) => result.status === 'error').length
    const title = failedCount > 0 ? 'Import completed with errors' : files.length === 1 ? nextResults[0].title : 'Articles imported'
    const message = `${successCount} created, ${updatedCount} updated, ${failedCount} failed.`

    setFeedback({
      status: failedCount > 0 ? 'error' : updatedCount > 0 ? 'warning' : 'success',
      title,
      message,
      detail: files.length > 1 ? 'Files were processed one by one in the order selected.' : nextResults[0]?.detail || null,
    })

    toast({
      title,
      description: message,
      variant: failedCount > 0 ? 'destructive' : 'default',
    })

    router.refresh()
    setIsImporting(false)
    setProgress({ current: 0, total: 0 })
    setCurrentFileName(null)
  }

  const importButtonLabel = (() => {
    if (!isImporting) return 'Import Articles'
    if (progress.total > 1) return `Importing ${progress.current}/${progress.total}...`
    return 'Importing...'
  })()

  const getResultIcon = (status: ImportResult['status']) => {
    if (status === 'success') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    if (status === 'warning') return <AlertCircle className="h-4 w-4 text-amber-600" />
    return <AlertCircle className="h-4 w-4 text-red-600" />
  }

  const getResultClasses = (status: ImportResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
      case 'warning':
        return 'border-amber-200 bg-amber-50/80 text-amber-900'
      case 'error':
        return 'border-red-200 bg-red-50/80 text-red-900'
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        multiple
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />
      <Button
        type="button"
        variant={variant}
        onClick={() => inputRef.current?.click()}
        disabled={isImporting}
        className={className}
      >
        <Upload className="mr-2 h-4 w-4" />
        {importButtonLabel}
      </Button>

      {showInlineFeedback && feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${
            feedback.status === 'success'
              ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
              : feedback.status === 'warning'
                ? 'border-amber-200 bg-amber-50/80 text-amber-900'
              : 'border-red-200 bg-red-50/80 text-red-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              {feedback.status === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : feedback.status === 'warning' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold">{feedback.title}</p>
              <p className="mt-1 leading-6">{feedback.message}</p>
              {feedback.detail && (
                <p className="mt-1.5 text-xs leading-5 opacity-90">{feedback.detail}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showInlineFeedback && isImporting && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>
              {progress.total > 1
                ? `Processing article file ${progress.current} of ${progress.total}...`
                : 'Reading the file and checking whether this article already exists...'}
            </span>
          </div>
          {currentFileName && (
            <p className="mt-2 truncate text-xs text-slate-500">{currentFileName}</p>
          )}
        </div>
      )}

      {showInlineFeedback && results.length > 0 && (
        <div className="space-y-2">
          {results.map((result, index) => (
            <div
              key={`${result.fileName || 'article'}-${index}`}
              className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${getResultClasses(result.status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">{getResultIcon(result.status)}</div>
                <div className="min-w-0">
                  <p className="font-semibold">
                    {result.fileName ? `${result.fileName}: ` : ''}
                    {result.title}
                  </p>
                  <p className="mt-1 leading-6">{result.message}</p>
                  {result.detail && (
                    <p className="mt-1.5 text-xs leading-5 opacity-90">{result.detail}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
