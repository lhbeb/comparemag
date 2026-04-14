import { getWriterBySlug } from '@/lib/supabase/writers'
import { WriterEditor } from '@/components/admin/writer-editor'
import { notFound } from 'next/navigation'

export default async function EditWriterPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  let writer

  try {
    writer = await getWriterBySlug(resolvedParams.slug)
  } catch (error) {
    console.error('Error fetching writer:', error)
    notFound()
  }

  return (
    <WriterEditor
      mode="edit"
      initialData={{
        slug: writer.slug,
        name: writer.name,
        specialty: writer.specialty,
        bio: writer.bio,
        bio_html: writer.bio_html,
        avatar_url: writer.avatar_url,
        email: writer.email,
        website: writer.website,
        twitter_handle: writer.twitter_handle,
        linkedin_url: writer.linkedin_url,
        github_url: writer.github_url,
      }}
    />
  )
}
