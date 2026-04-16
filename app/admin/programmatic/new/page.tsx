'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Wand2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export default function ProgrammaticSEOGenerator() {
  const router = useRouter()
  
  const [template, setTemplate] = useState('best-product-category')
  const [topicKey, setTopicKey] = useState('')
  const [generationData, setGenerationData] = useState('{\n  "category": "Smartphones",\n  "year": "2026"\n}')
  
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!template || !topicKey) {
      toast({ title: 'Missing fields', description: 'Please provide a template layout and topic key.', variant: 'destructive' })
      return
    }

    let parsedData = null
    try {
      parsedData = JSON.parse(generationData)
    } catch {
      toast({ title: 'Invalid JSON', description: 'Please provide valid JSON generation data.', variant: 'destructive' })
      return
    }

    setIsGenerating(true)

    try {
      // MVP: Mocks generating an article from template and saves as a draft Programmatic Article
      const slug = `${template}-${topicKey.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      const title = `The Best ${parsedData.category} in ${parsedData.year}`
      
      const payload = {
        slug,
        title,
        content: `<h2>Top Picks for ${parsedData.category}</h2>\n<p>This is a programmatically generated article template stub. You should edit this draft or use an AI integration to dynamically fill it.</p>`,
        category: parsedData.category || 'Price Comparison',
        author: 'System Generated', // Ideally set to a real user in the DB
        read_time: '3 min read',
        published: false, // Save as draft
        article_type: 'programmatic',
        programmatic_template: template,
        programmatic_key: topicKey,
        programmatic_data: parsedData,
        generation_status: 'generated'
      }

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Generation failed.')
      }

      toast({ title: 'Success', description: 'Programmatic SEO draft generated successfully!' })
      router.push(`/admin/articles/edit/${slug}`)
      
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to generate', variant: 'destructive' })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Programmatic SEO Generator</h1>
        <p className="text-sm text-gray-500 mt-1">Generate automated draft articles by combining templates with structured data.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-3xl space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="template">Template Script Name</Label>
            <Input id="template" value={template} onChange={e => setTemplate(e.target.value)} placeholder="e.g. best-widgets-by-year" />
            <p className="text-xs text-gray-500">Identifier for the generation logic/schema.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topicKey">Topic Key</Label>
            <Input id="topicKey" value={topicKey} onChange={e => setTopicKey(e.target.value)} placeholder="e.g. android-phones-2026" />
            <p className="text-xs text-gray-500">Unique key for this specific generation run.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data">Generation Data (JSON)</Label>
          <Textarea 
            id="data" 
            value={generationData} 
            onChange={e => setGenerationData(e.target.value)} 
            className="font-mono min-h-[200px]"
          />
          <p className="text-xs text-gray-500">Variables that will be injected into the template.</p>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Wand2 className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Draft'}
          </Button>
        </div>

      </div>
    </div>
  )
}
