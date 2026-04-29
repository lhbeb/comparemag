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
    }
  | {
      status: 'error'
      title: string
      message: string
      detail?: string | null
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setIsImporting(true)
    setFeedback(null)

    try {
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

      const successTitle = payload?.action === 'updated' ? 'Article updated' : 'Article imported'
      const successMessage = payload?.title
        ? `"${payload.title}" is now available in the admin.`
        : 'The article import completed successfully.'

      setFeedback({
        status: 'success',
        title: successTitle,
        message: successMessage,
        detail: payload?.reason || null,
      })

      toast({
        title: successTitle,
        description: payload?.reason || successMessage,
      })

      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to import article right now.'

      setFeedback({
        status: 'error',
        title: 'Import failed',
        message: errorMessage,
      })

      toast({
        title: 'Import failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
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
        {isImporting ? 'Importing...' : 'Import Article'}
      </Button>

      {showInlineFeedback && feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${
            feedback.status === 'success'
              ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
              : 'border-red-200 bg-red-50/80 text-red-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              {feedback.status === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
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
            <span>Reading the file and checking whether this article already exists...</span>
          </div>
        </div>
      )}
    </div>
  )
}
