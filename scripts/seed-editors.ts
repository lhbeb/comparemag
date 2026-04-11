/**
 * seed-editors.ts
 * Run with: npx ts-node --project tsconfig.json -e "require('ts-node/register'); require('./scripts/seed-editors.ts')"
 * Or: npx tsx scripts/seed-editors.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const PLACEHOLDER_EDITORS = [
  {
    slug: 'sarah-mitchell',
    name: 'Sarah Mitchell',
    specialty: 'Smartphones & Mobile',
    bio: 'Sarah has spent over 8 years testing and reviewing the latest smartphones. She has hands-on experience with every major flagship release and is known for her sharp, no-nonsense takes on camera quality and battery life.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-mitchell&backgroundColor=b6e3f4',
    email: 'sarah@comparemag.com',
    twitter_handle: '@sarahmreviews',
    linkedin_url: 'https://linkedin.com/in/sarah-mitchell-reviews',
  },
  {
    slug: 'james-okafor',
    name: 'James Okafor',
    specialty: 'Laptops & PCs',
    bio: 'James is a certified hardware engineer turned tech journalist. He benchmarks CPUs, GPUs, and SSDs so you don\'t have to. His laptop buying guides have helped over 500,000 readers make confident purchases.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james-okafor&backgroundColor=c0aede',
    email: 'james@comparemag.com',
    twitter_handle: '@jamesotech',
  },
  {
    slug: 'priya-sharma',
    name: 'Priya Sharma',
    specialty: 'Audio & Headphones',
    bio: 'Priya holds a degree in acoustical engineering and has reviewed over 300 pairs of headphones, earbuds, and speakers. She brings both scientific rigour and genuine musical passion to every audio review.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya-sharma&backgroundColor=ffd5dc',
    email: 'priya@comparemag.com',
    linkedin_url: 'https://linkedin.com/in/priya-sharma-audio',
  },
  {
    slug: 'marcus-chen',
    name: 'Marcus Chen',
    specialty: 'Smart Home & IoT',
    bio: 'Marcus has turned his home into a living lab of smart devices. From robot vacuums to AI security cameras, he tests how well products actually work together — not just in isolation.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus-chen&backgroundColor=d1f4d1',
    email: 'marcus@comparemag.com',
    twitter_handle: '@marcussmarthome',
  },
  {
    slug: 'elena-vasquez',
    name: 'Elena Vasquez',
    specialty: 'Gaming & Peripherals',
    bio: 'Elena is a competitive gamer and hardware enthusiast. She reviews gaming monitors, mice, keyboards, and headsets with a focus on what actually improves gameplay — not just what looks good on a spec sheet.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena-vasquez&backgroundColor=ffe4c4',
    email: 'elena@comparemag.com',
    twitter_handle: '@elenagamingtech',
  },
  {
    slug: 'tom-hartley',
    name: 'Tom Hartley',
    specialty: 'Deals & Value Picks',
    bio: 'Tom is the team\'s deal hunter. He tracks price history across dozens of retailers, spots flash sales before anyone else, and writes the buying guides that save readers real money every day.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom-hartley&backgroundColor=e8d5c4',
    email: 'tom@comparemag.com',
    linkedin_url: 'https://linkedin.com/in/tom-hartley-deals',
  },
]

async function seedEditors() {
  console.log('🌱 Seeding placeholder editors into the database...\n')

  let inserted = 0
  let skipped = 0
  let failed = 0

  for (const editor of PLACEHOLDER_EDITORS) {
    // Check if editor already exists
    const { data: existing } = await supabase
      .from('writers')
      .select('slug')
      .eq('slug', editor.slug)
      .maybeSingle()

    if (existing) {
      console.log(`⏭️  Skipping "${editor.name}" — already exists (slug: ${editor.slug})`)
      skipped++
      continue
    }

    const { error } = await supabase.from('writers').insert(editor)

    if (error) {
      console.error(`❌ Failed to insert "${editor.name}":`, error.message)
      failed++
    } else {
      console.log(`✅ Inserted "${editor.name}" (${editor.specialty})`)
      inserted++
    }
  }

  console.log(`\n📊 Done! Inserted: ${inserted}, Skipped: ${skipped}, Failed: ${failed}`)

  if (inserted > 0) {
    console.log('\n🎉 Editors are now live in the database. Refresh your homepage to see the "Meet the Experts" section!')
  }
}

seedEditors().catch(console.error)
