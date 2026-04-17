'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface WriterActionsProps {
  slug: string
  isDeleted: boolean
}

export function WriterActions({ slug, isDeleted }: WriterActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'delete' | 'restore') => {
    if (action === 'delete' && !confirm('Are you sure you want to deactivate this editor? They will no longer be visible on the public site.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/writers/${slug}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: action === 'restore' ? JSON.stringify({ action: 'restore' }) : undefined,
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} writer`)
      }

      toast({
        title: action === 'delete' ? 'Editor Deactivated' : 'Editor Restored',
        description: action === 'delete' 
          ? 'The editor has been soft-deleted and hidden from the public site.' 
          : 'The editor has been reactivated.',
      })
      
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (isDeleted) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleAction('restore')}
        disabled={loading}
        className="h-8 w-8 p-0 rounded-full hover:bg-green-50 hover:text-green-600"
        title="Restore Editor"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => handleAction('delete')}
      disabled={loading}
      className="h-8 w-8 p-0 rounded-full hover:bg-red-50 hover:text-red-600"
      title="Deactivate Editor"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
