import { getWriterBySlug, getAllWriters } from '@/lib/supabase/writers'
import { getAllArticles } from '@/lib/supabase/articles'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SupabaseImage } from '@/components/supabase-image'
import { format } from 'date-fns'
import { User, Mail, Globe, Twitter, Linkedin, Github, Clock, Rss } from 'lucide-react'
import { Logo } from '@/components/logo'
import type { Writer, Article } from '@/lib/supabase/types'

export async function generateStaticParams() {
  try {
    const writers = await getAllWriters()
    return writers.map((writer) => ({
      slug: writer.slug,
    }))
  } catch {
    return []
  }
}

export default async function WriterPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  let writer: Writer
  let articles: Article[]

  try {
    // We pass includeDeleted: true here so we can explicitly handle it if we want, 
    // but the task says "not accessible to client side". 
    // The current getWriterBySlug(slug) will throw if it's deleted.
    writer = await getWriterBySlug(resolvedParams.slug)
    
    // Safety check just in case
    if (writer.deleted_at) {
      notFound()
    }

    // Get all articles and filter by author name 
    const allArticles = await getAllArticles(true)
    articles = allArticles.filter((article) => article.author === writer.name)
  } catch (error) {
    console.error('Error fetching writer:', error)
    notFound()
  }

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: writer.name,
    url: `https://comparemag.blog/writers/${writer.slug}`,
    image: writer.avatar_url,
    jobTitle: writer.specialty || 'Tech Reviewer',
    description: writer.bio,
    sameAs: [
      writer.twitter_handle ? `https://twitter.com/${writer.twitter_handle.replace('@', '')}` : null,
      writer.linkedin_url,
      writer.github_url,
      writer.website
    ].filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />


      <main className="container mx-auto px-4 py-12">
        {/* Writer Profile */}
        <div className="max-w-4xl mx-auto mb-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {writer.avatar_url ? (
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                <Image
                  src={writer.avatar_url}
                  alt={writer.name}
                  fill
                  className="rounded-full object-cover border-4 border-blue-50 shadow-md"
                />
              </div>
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 border-4 border-white shadow-md">
                <User className="h-16 w-16 md:h-20 md:w-20 text-blue-600" />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4 text-slate-900">{writer.name}</h1>
              
              {writer.bio && (
                <div className="prose prose-slate max-w-none mb-6">
                  {writer.bio_html ? (
                    <div dangerouslySetInnerHTML={{ __html: writer.bio_html }} />
                  ) : (
                    <p className="text-slate-600 text-lg leading-relaxed">{writer.bio}</p>
                  )}
                </div>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap gap-4 mt-6">
                {writer.email && (
                  <a
                    href={`mailto:${writer.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-full transition-colors text-sm font-medium border border-slate-200 hover:border-blue-200"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </a>
                )}
                {writer.website && (
                  <a
                    href={writer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-full transition-colors text-sm font-medium border border-slate-200 hover:border-blue-200"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Website</span>
                  </a>
                )}
                {writer.twitter_handle && (
                  <a
                    href={`https://twitter.com/${writer.twitter_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-full transition-colors text-sm font-medium border border-slate-200 hover:border-blue-200"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>{writer.twitter_handle}</span>
                  </a>
                )}
                {writer.linkedin_url && (
                  <a
                    href={writer.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-full transition-colors text-sm font-medium border border-slate-200 hover:border-blue-200"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {writer.github_url && (
                  <a
                    href={writer.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-full transition-colors text-sm font-medium border border-slate-200 hover:border-blue-200"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Articles by Writer */}
        <div className="max-w-4xl mx-auto border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-bold mb-8 text-slate-900">
            Reviews by {writer.name}
          </h2>

          {articles.length === 0 ? (
            <div className="text-center py-12 border border-slate-200 rounded-xl bg-slate-50 text-slate-500">
              No reviews published yet by this expert.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {articles.map((article) => {
                const description = article.content
                  .replace(/<[^>]*>/g, '')
                  .substring(0, 150)
                  .trim() + '...'

                return (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}/`}
                    className="group bg-white rounded-xl overflow-hidden border border-slate-200 transition-all duration-200 hover:shadow-md hover:border-blue-300 flex flex-col h-full"
                  >
                    {article.image_url && (
                      <div className="relative h-48 w-full flex-shrink-0">
                        <SupabaseImage
                          src={article.image_url}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">
                        <span>{article.category}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">{description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-4 border-t border-slate-100">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(article.created_at), 'MMMM d, yyyy')}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      
    </div>
  )
}
