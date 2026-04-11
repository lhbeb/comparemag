import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const REWRITTEN_ARTICLES = [
  {
    title: 'Apple Vision Pro: One Year Later – Still the Future?',
    category: 'Electronics',
    slug: 'apple-vision-pro-one-year-later',
    meta_description: 'Has the spatial computing revolution finally arrived, or is the Vision Pro still an expensive developer kit? We review it one year later.',
    content: `<p>It has been a full year since Apple launched its ambitious Vision Pro mixed-reality headset. Has the spatial computing revolution finally arrived, or is it still an expensive developer kit?</p>
      <h2>Design and Comfort</h2>
      <p>The hardware remains breathtaking. The micro-OLED displays offer unmatched clarity, making text readable and movies immersive. However, the weight distribution is still a common complaint for prolonged sessions.</p>
      <h2>Software and Ecosystem</h2>
      <p>visionOS has seen continuous updates, adding highly requested features like better Mac Virtual Display support and new spatial games. Yet, the killer app remains elusive.</p>
      <h2>Verdict</h2>
      <p>For enthusiasts and early adopters, it's a profound glimpse into the future. But for the average consumer, the high entry price makes it hard to recommend just yet.</p>`,
  },
  {
    title: 'M3 MacBook Air vs. Dell XPS 13: Which Ultraportable to Buy in 2025',
    category: 'Laptops',
    slug: 'm3-macbook-air-vs-dell-xps-13',
    meta_description: 'The ultraportable laptop space is competitive. We compare Apple’s M3 MacBook Air and Dell’s XPS 13 to see which you should buy.',
    content: `<p>The ultraportable laptop space is more competitive than ever. Apple’s M3 MacBook Air and Dell’s newly redesigned XPS 13 are the two leading contenders. Which one should you buy?</p>
      <h2>Performance</h2>
      <p>Apple’s M3 chip continues to deliver incredible performance-per-watt, giving it legendary battery life while maintaining cool, fanless operation. The XPS 13, running Intel’s latest Core Ultra processors, brings excellent raw performance but struggles slightly with heat under heavy loads.</p>
      <h2>Design and Display</h2>
      <p>Dell has taken a bold route with the invisible trackpad and capacitive function row. It looks incredibly futuristic. Apple sticks to its tried-and-true utilitarian design. Both offer stunning OLED display options.</p>
      <h2>Final Thoughts</h2>
      <p>If you live in the Apple ecosystem, the MacBook Air is a no-brainer. But if Windows is your jam, the Dell XPS 13 remains a premium, stunning alternative.</p>`,
  },
  {
    title: 'Sony WH-1000XM6 Review: The New Noise Cancellation King',
    category: 'Audio',
    slug: 'sony-wh-1000xm6-review',
    meta_description: 'Sony aims to keep the ANC crown with the WH-1000XM6. How do they stack up against the competition?',
    content: `<p>Sony has dominated the active noise cancellation (ANC) headphone market for years. The WH-1000XM6 aims to keep the crown. Do they succeed?</p>
      <h2>Sound Quality</h2>
      <p>Bass is tight and controlled, while the mids are perfectly clear. The new dynamic drivers provide a noticeably wider soundstage compared to the XM5s.</p>
      <h2>Noise Cancellation</h2>
      <p>The dual-processor ANC blocks out low-frequency engine rumbles flawlessly and shows massive improvements in blocking higher-frequency voices in busy offices.</p>
      <h2>Comfort and Battery</h2>
      <p>Weighing just a bit less than their predecessors, the XM6s are comfortable for 8-hour workdays. The 40-hour battery life means you can easily go a week without charging.</p>`,
  },
  {
    title: 'Samsung Galaxy S24 Ultra Review: The Ultimate Android Flagship',
    category: 'Smartphones',
    slug: 'samsung-galaxy-s24-ultra-review',
    meta_description: 'The Galaxy S24 Ultra is Samsung\'s most powerful smartphone yet. Should you upgrade to this premium Android device?',
    content: `<p>The Galaxy S24 Ultra is Samsung's most powerful and feature-rich smartphone yet, betting heavily on AI and titanium construction.</p>
      <h2>Display and Build</h2>
      <p>The new flat screen is protected by Gorilla Glass Armor, significantly reducing reflections. The titanium rails make it lighter to hold without sacrificing durability.</p>
      <h2>Camera System</h2>
      <p>The versatile quad-camera array captures stunning photos in any lighting. The new 5x optical telephoto lens provides sharper zoom capabilities for everyday shots.</p>
      <h2>Verdict</h2>
      <p>With 7 years of promised updates and top-tier specifications, the Galaxy S24 Ultra firmly secures its position as the premium Android smartphone of the year.</p>`,
  },
  {
    title: 'Top 5 Smart Home Security Cameras Under $100',
    category: 'Smart Home',
    slug: 'best-budget-smart-home-cameras',
    meta_description: 'Securing your home shouldn\'t cost a fortune. See our top 5 picks for budget-friendly security cameras under $100.',
    content: `<p>Securing your home shouldn't cost a fortune. We've tested dozens of budget-friendly security cameras to find the best options that don't compromise on essential features.</p>
      <h2>Wyze Cam v4</h2>
      <p>Offering 2K resolution and color night vision at an unbeatable price, the Wyze Cam v4 is our top pick for most people.</p>
      <h2>Blink Mini 2</h2>
      <p>Compact and easy to install, the Blink Mini 2 integrates seamlessly with Alexa and provides crisp 1080p video.</p>
      <h2>TP-Link Tapo C210</h2>
      <p>If you need pan and tilt functionality, the Tapo C210 gives you a 360-degree view of any room with local storage options.</p>`,
  }
]

async function rewriteArticles() {
  const { data: existingArticles, error: fetchError } = await supabase.from('articles').select('*')
  if (fetchError) {
    console.error('Error fetching articles:', fetchError)
    return
  }

  console.log('Found ' + existingArticles.length + ' articles to rewrite.')

  for (let i = 0; i < existingArticles.length; i++) {
    const article = existingArticles[i]
    // Use modulo so we don't run out of rewritten content if there are more than 5 articles
    const rewriteData = REWRITTEN_ARTICLES[i % REWRITTEN_ARTICLES.length]

    console.log('Rewriting: "' + article.title + '" -> "' + rewriteData.title + '"')

    const { error: updateError } = await supabase
      .from('articles')
      .update({
        title: rewriteData.title,
        slug: rewriteData.slug + (i >= REWRITTEN_ARTICLES.length ? '-' + i : ''), 
        category: rewriteData.category,
        content: rewriteData.content,
      })
      .eq('id', article.id)

    if (updateError) {
      console.error('Failed to update article ' + article.id + ':', updateError)
    } else {
      console.log('Successfully updated.')
    }
  }
  
  console.log('All articles have been rewritten to fit the product reviews niche!')
}

rewriteArticles()
