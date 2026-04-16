'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload, X, Save, User, Globe, Mail, Twitter, Linkedin, Github, Info, Camera, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface WriterEditorProps {
  initialData?: {
    slug: string
    name: string
    specialty: string | null
    bio: string | null
    bio_html: string | null
    avatar_url: string | null
    email: string | null
    website: string | null
    twitter_handle: string | null
    linkedin_url: string | null
    github_url: string | null
  }
  mode: 'create' | 'edit'
}

export function WriterEditor({ initialData, mode }: WriterEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(initialData?.name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [specialty, setSpecialty] = useState(initialData?.specialty || '')
  const [bio, setBio] = useState(initialData?.bio || '')
  const [bioHtml, setBioHtml] = useState(initialData?.bio_html || '')
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [website, setWebsite] = useState(initialData?.website || '')
  const [twitterHandle, setTwitterHandle] = useState(initialData?.twitter_handle || '')
  const [linkedinUrl, setLinkedinUrl] = useState(initialData?.linkedin_url || '')
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url || '')
  
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const generateSlug = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

  const handleNameChange = (value: string) => {
    setName(value)
    if (mode === 'create' && !initialData?.slug) setSlug(generateSlug(value))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { toast({ title: 'Invalid file type', variant: 'destructive' }); return }
    setUploading(true)
    try {
      const fileName = `writer-${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('article_images').upload(`avatars/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('article_images').getPublicUrl(`avatars/${fileName}`)
      setAvatarUrl(publicUrl)
      toast({ title: 'Avatar uploaded' })
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleSave = async () => {
    if (!name || !slug) { toast({ title: 'Missing fields', description: 'Name and slug are required.', variant: 'destructive' }); return }
    setSaving(true)
    try {
      const writerData = {
        slug, name, specialty: specialty || null, bio: bio || null, bio_html: bioHtml || null,
        avatar_url: avatarUrl || null, email: email || null, website: website || null,
        twitter_handle: twitterHandle || null, linkedin_url: linkedinUrl || null, github_url: githubUrl || null,
      }
      const response = await fetch(mode === 'create' ? '/api/writers' : `/api/writers/${initialData?.slug}`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(writerData),
      })
      if (!response.ok) {
        let message = 'Failed to save writer'
        try {
          const errorBody = await response.json()
          if (typeof errorBody?.message === 'string' && errorBody.message.trim()) {
            message = errorBody.message
          }
        } catch {
          // Ignore JSON parsing failures and keep fallback message
        }
        throw new Error(message)
      }
      toast({ title: 'Editor saved!' })
      router.push('/admin/writers'); router.refresh()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally { setSaving(false) }
  }

  return (
    <div className="cms-editor-layout">
      {/* ── Main content (Left) ─────────────────────────────────── */}
      <div className="space-y-6">
        {/* Name & Slug */}
        <div className="space-y-2">
            <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Full Name..."
                className="text-3xl font-bold h-auto py-3 border-none bg-transparent hover:bg-slate-50 focus:bg-white transition-all shadow-none placeholder:text-slate-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            <div className="flex items-center gap-1.5 px-1 py-1 rounded-md bg-slate-50 border border-transparent focus-within:bg-white focus-within:border-slate-200 transition-colors">
                <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Profile URL:</span>
                <span className="text-xs font-mono text-slate-400 whitespace-nowrap ml-1">/experts/</span>
                <input 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="text-xs font-mono text-blue-600 bg-transparent border-none p-0 h-5 focus:ring-0 flex-1 outline-none min-w-0"
                />
            </div>
        </div>

        {/* Bio Section */}
        <div className="cms-sidebar-card">
          <div className="cms-sidebar-card-header">
            Biography & Professional Summary
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body space-y-6">
            <div className="space-y-2">
              <Label className="text-xs text-slate-500 font-bold uppercase">Short Introduction</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A brief greeting or catchphrase..."
                rows={3}
                className="bg-slate-50 border-slate-200 resize-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-500 font-bold uppercase">Extended Bio (HTML)</Label>
              <Textarea
                value={bioHtml}
                onChange={(e) => setBioHtml(e.target.value)}
                placeholder="Full professional background with rich formatting..."
                rows={10}
                className="font-mono bg-slate-50 border-slate-200 text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Metadata Controls (Mobile/Small screen friendly) */}
        <div className="lg:hidden">
            {/* Logic for mobile if needed */}
        </div>
      </div>

      {/* ── Sidebar (Right) ───────────────────────────────────── */}
      <aside className="space-y-6 lg:sticky lg:top-24">
        
        {/* Actions Card */}
        <div className="cms-sidebar-card">
          <div className="cms-sidebar-card-header">
            Actions
            <Settings className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body space-y-3">
             <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-bold"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button
                variant="outline"
                className="w-full border-slate-200 h-10 font-semibold"
                onClick={() => router.push('/admin/writers')}
              >
                Cancel
              </Button>
          </div>
        </div>

        {/* Avatar Card */}
        <div className="cms-sidebar-card">
          <div className="cms-sidebar-card-header">
            Editor Image
            <Camera className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body">
             <div 
                className="aspect-square w-32 mx-auto rounded-full border-4 border-slate-100 flex items-center justify-center bg-slate-50 overflow-hidden group cursor-pointer relative shadow-sm"
                onClick={() => fileInputRef.current?.click()}
             >
                {avatarUrl ? (
                  <>
                    <img src={avatarUrl} className="w-full h-full object-cover" alt={name} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <Upload className="w-5 h-5 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <User className="w-8 h-8 text-slate-300 mx-auto" />
                  </div>
                )}
             </div>
             <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
             <div className="mt-4 text-center">
                 <Button variant="ghost" size="sm" className="text-blue-600 text-[10px] font-bold uppercase" onClick={() => fileInputRef.current?.click()}>
                    {uploading ? 'Uploading...' : 'Update Avatar'}
                 </Button>
             </div>
          </div>
        </div>

        {/* Expertise Card */}
        <div className="cms-sidebar-card">
          <div className="cms-sidebar-card-header">
            Specialization
          </div>
          <div className="cms-sidebar-card-body space-y-4">
             <div className="space-y-2">
               <Label className="text-[11px] text-slate-400 uppercase">Focus Area</Label>
               <Input 
                value={specialty} 
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Mobile Tech, Audio Expert"
                className="bg-slate-50 border-slate-200"
               />
             </div>
             <div className="space-y-2">
               <Label className="text-[11px] text-slate-400 uppercase">Contact Email</Label>
               <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-300" />
                  <Input 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="editor@compare.mag"
                    className="pl-8 bg-slate-50 border-slate-200"
                  />
               </div>
             </div>
          </div>
        </div>

        {/* Social Links Card */}
        <div className="cms-sidebar-card">
           <div className="cms-sidebar-card-header">
            Network Profiles
          </div>
          <div className="cms-sidebar-card-body space-y-3">
             <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-slate-400" />
                <Input value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@username" className="bg-slate-50 border-slate-200 text-xs" />
             </div>
             <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-slate-400" />
                <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="LinkedIn URL" className="bg-slate-50 border-slate-200 text-xs" />
             </div>
             <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-slate-400" />
                <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="GitHub URL" className="bg-slate-50 border-slate-200 text-xs" />
             </div>
             <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Personal Website" className="bg-slate-50 border-slate-200 text-xs" />
             </div>
          </div>
        </div>

      </aside>
    </div>
  )
}
