import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function fetchArticles() {
  const { data, error } = await supabase.from('articles').select('*')
  if (error) {
    console.error('Error:', error)
    return
  }
  console.log(JSON.stringify(data, null, 2))
}

fetchArticles()
