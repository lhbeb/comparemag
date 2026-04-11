import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const UPDATES = [
  {
    slug: 'charlie-osborne',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop'
  },
  {
    slug: 'alison-denisco-rayome',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop'
  },
  {
    slug: 'jason-howell',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop'
  }
]

async function updateAvatars() {
  console.log('Updating editor avatars...')
  let updated = 0
  
  for (const update of UPDATES) {
    const { error } = await supabase
      .from('writers')
      .update({ avatar_url: update.avatar_url })
      .eq('slug', update.slug)

    if (error) {
      console.error(`Failed to update avatar for "${update.slug}":`, error.message)
    } else {
      console.log(`Updated avatar for "${update.slug}"`)
      updated++
    }
  }
  
  console.log(`Done! Updated: ${updated}`)
}

updateAvatars().catch(console.error)
