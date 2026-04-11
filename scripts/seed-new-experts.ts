import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const EXPERTS = [
  {
    slug: 'charlie-osborne',
    name: 'Charlie Osborne',
    specialty: 'Senior Contributing Writer',
    bio: 'Charlie is a senior contributing writer focusing on innovation and tech.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie-osborne&backgroundColor=b6e3f4',
    email: 'charlie@comparemag.com',
  },
  {
    slug: 'alison-denisco-rayome',
    name: 'Alison DeNisco Rayome',
    specialty: 'Managing Editor, Advice & Commerce',
    bio: 'Alison leads the advice and commerce editorial team, ensuring that every product review is rigorously tested and independently verified so you can make confident purchasing decisions.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alison-denisco-rayome&backgroundColor=c0aede',
    email: 'alison@comparemag.com',
  },
  {
    slug: 'jason-howell',
    name: 'Jason Howell',
    specialty: 'Contributing Writer',
    bio: 'Jason Howell owns Yellowgold Studios, where he produces and hosts independent podcasts and creates tech content for YouTube. He brings two decades of technology industry experience to his work, including podcast production roles at CNET and the TWiT podcast network.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jason-howell&backgroundColor=ffd5dc',
    email: 'jason@comparemag.com',
  }
]

async function seedNewExperts() {
  console.log('Clearing existing placeholder experts...')
  
  // delete all writers first
  const { error: deleteError } = await supabase
    .from('writers')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // delete all trick

  if (deleteError) {
    console.error('Failed to clear existing writers:', deleteError.message)
  } else {
    console.log('Cleared existing writers.')
  }

  console.log('Seeding new experts...')
  let inserted = 0
  for (const expert of EXPERTS) {
    const { error } = await supabase.from('writers').insert(expert)
    if (error) {
      console.error(`Failed to insert "${expert.name}":`, error.message)
    } else {
      console.log(`Inserted "${expert.name}"`)
      inserted++
    }
  }
  
  console.log(`Done! Inserted: ${inserted}`)
}

seedNewExperts().catch(console.error)
