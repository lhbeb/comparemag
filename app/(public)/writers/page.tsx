import Link from "next/link"
import { Logo } from "@/components/logo"
import { Github, Linkedin, Mail, Rss, Twitter, User, Award } from "lucide-react"
import { getAllWriters } from "@/lib/supabase/writers"

async function getEditors() {
  try {
    return await getAllWriters()
  } catch (error) {
    console.error('Error fetching editors:', error)
    return []
  }
}

export default async function EditorsPage() {
  const editors = await getEditors()

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">


      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 text-center">Meet Our Experts</h1>
          <p className="text-lg text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            Our team of dedicated reviewers deeply tests the latest tech to bring you honest, unbiased recommendations.
          </p>

          {editors.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200">
              No experts listed yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {editors.map((editor) => (
                <Link key={editor.id} href={`/writers/${editor.slug}`} className="group block">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center h-full flex flex-col">
                    {editor.avatar_url ? (
                      <img
                        src={editor.avatar_url}
                        alt={editor.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-4 ring-blue-50 group-hover:ring-blue-100 transition-colors"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                        <User className="h-10 w-10 text-blue-600" />
                      </div>
                    )}
                    <h2 className="font-bold text-slate-900 text-xl mb-1 group-hover:text-blue-600 transition-colors">
                      {editor.name}
                    </h2>
                    {((editor as any).specialty) && (
                      <div className="mb-4">
                         <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                           <Award className="h-3 w-3" />
                           {(editor as any).specialty}
                         </span>
                      </div>
                    )}
                    <p className="text-slate-500 text-sm flex-grow line-clamp-3">
                      {editor.bio || "Tech reviewer at CompareMag."}
                    </p>
                    <div className="mt-6 pt-4 border-t border-slate-100 text-sm font-semibold text-blue-600">
                      View Profile &rarr;
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      
    </div>
  )
}
