// @ts-nocheck
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const REVIEWS = [
  {
    slug: 'i-tested-every-android-phone-this-year-heres-the-one-i-kept',
    title: "I tested every major Android phone this year - here's the one I actually kept",
    category: 'Smartphones',
    author: 'Charlie Osborne',
    read_time: '10 min read',
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200&auto=format&fit=crop',
    published: true,
    published_at: '2026-03-28T10:00:00Z',
    content: '<p>I have spent the last three months going phone to phone: Galaxy S25 Ultra, Pixel 9 Pro, OnePlus 13, Xiaomi 15 Ultra, and a handful of others. I kept notes. I photographed the same scenes. I benchmarked the same games. And at the end of it all, I had one phone left in my pocket — and it might not be the one you expect.</p><h2>The test: real life, not a lab</h2><p>I did not run these phones through a battery of artificial benchmarks in a clean room. I used them as my only device for two weeks each. I took them to coffee shops, on commutes, to weekend markets, and to a three-day work trip where I was genuinely relying on them. That is the only test that actually matters.</p><h2>Galaxy S25 Ultra: brilliant, but exhausting</h2><p>Samsung packs more features into the S25 Ultra than I can keep track of. The S Pen is exceptional for quick notes. The 200MP camera is extraordinary in the right conditions. But after two weeks, I realised I was using maybe 30% of what the phone could do, and I was spending the rest of my time navigating Samsung\'s increasingly complex software. One UI is genuinely good — but it is a lot.</p><h2>Pixel 9 Pro: the one that made me stop overthinking it</h2><p>Here is the thing about the Pixel 9 Pro: it gets out of your way. The camera is extraordinary without requiring any thought. The battery lasts all day and usually into the next morning. Updates are instant and kept that way for seven years. And Google\'s call screening alone — which answers spam calls and summarises them in text — has saved me more headaches than I can count. After two weeks I did not want to give it back. That is the test.</p><h2>Why I did not keep the OnePlus 13</h2><p>The OnePlus 13 is faster than anything else I tested, has the best charging speed by a wide margin, and costs significantly less than the Pixel or Samsung. If you measure a phone by specs per dollar, it wins. But the camera, while improved, still falls short in night shots, and OxygenOS has started to feel cluttered in ways it never used to.</p><h2>The verdict after three months</h2><p>The Pixel 9 Pro is on my desk charging right now. Not because it is the most powerful phone I tested, or the one with the most features. It is there because two weeks in, I stopped noticing I was using a phone and started just getting things done. That is the highest compliment I can pay any device.</p>',
  },
  {
    slug: 'i-used-macbook-air-m3-for-six-months-before-writing-this',
    title: "I refused to review the MacBook Air M3 until I'd used it for 6 months. Here's what I found",
    category: 'Laptops',
    author: 'Alison DeNisco Rayome',
    read_time: '11 min read',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
    published: true,
    published_at: '2026-03-20T10:00:00Z',
    content: '<p>Most laptop reviews are written after a week of use. Some are done in three days. I made a deliberate decision not to write about the MacBook Air M3 until I had used it as my primary machine for six months — through a cross-country move, three work trips, and a month where I was editing video every single day. Here is what six months actually teaches you about a laptop that a week never could.</p><h2>Month one: the honeymoon</h2><p>Everything was great. Obviously. The M3 chip is fast — genuinely, meaningfully fast in a way that the jump from Intel to M1 was fast. It opened applications instantly. It rendered my Lightroom exports in roughly half the time of my old Intel MacBook Pro. The battery lasted so long I stopped carrying a charger to coffee shops, which felt borderline reckless at first and then just normal.</p><h2>Month two and three: where the cracks should appear</h2><p>They did not. The fan-free design — which sounded like a bold engineering decision when Apple announced it — turns out to just work. I ran week-long Final Cut Pro exports, I had forty browser tabs open, I ran virtual machines. The machine got warm but never uncomfortably so, and it never slowed down in a way I noticed during normal work. I had been sceptical. I was wrong.</p><h2>Month four: the external display revelation</h2><p>The M3 Air supports two external displays when the lid is closed — something the M2 could not do. I set up a two-monitor home office for the first time, connected via a single Thunderbolt dock, and suddenly a machine I already considered excellent became genuinely professional-grade for desktop work. I have colleagues on Windows laptops costing twice as much who are not running this clean a setup.</p><h2>Month five: the thing I actually do not like</h2><p>The webcam. In 2026, facing the kinds of video call loads most of us now carry, the 1080p webcam on the MacBook Air is fine but not great. The software Centre Stage feature that keeps you in frame during calls is helpful, but competitors have better sensors. It is a real omission on a machine at this price point.</p><h2>Six months later: do I still recommend it?</h2><p>Unreservedly, yes. For most people — writers, developers, designers, students — the MacBook Air M3 is the best laptop available at any price. The battery life alone makes it worth the premium over windows alternatives. And six months in, it feels exactly as fast and capable as it did on day one. That kind of longevity is rare in consumer electronics and it is worth paying for.</p>',
  },
  {
    slug: 'i-switched-from-airpods-pro-to-sony-xm6-and-switched-back',
    title: "I switched from AirPods Pro 2 to Sony XM6 for a month - then switched back. Here's why",
    category: 'Audio',
    author: 'Jason Howell',
    read_time: '9 min read',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop',
    published: true,
    published_at: '2026-03-15T10:00:00Z',
    content: '<p>Everyone who writes about headphones will tell you the Sony WH-1000XM6 is the best noise-cancelling headphone you can buy. And they are right. The noise cancellation is objectively superior to AirPods Pro 2. So why am I back to AirPods after a month? Let me explain, because the answer says something important about how you actually choose headphones.</p><h2>The Sony XM6 wins on paper — and mostly in practice</h2><p>I took the Sony XM6 on two flights, wore them through a full week of open-plan office work, and used them on a train journey through three countries. The noise cancellation blocked engine noise in ways that genuinely made long-haul travel less exhausting. The 40-hour battery meant I never once worried about charging for the entire month. The sound quality is rich and detailed. These are excellent headphones.</p><h2>But here is what nobody tells you about switching from earbuds to over-ears</h2><p>I wear glasses. After about three hours, the pressure of over-ear cups against my glasses frames becomes uncomfortable. This is not a problem unique to the Sony — it affects every over-ear headphone to some degree. But it is a real factor that disappeared completely when I switched back to AirPods, which sit in my ears and do not interact with my frames at all.</p><h2>The second issue: integration</h2><p>I am deep in Apple\'s ecosystem. My AirPods switch automatically between my iPhone, iPad, MacBook, and Apple Watch. They integrate with Siri in ways that are genuinely useful. They support Conversation Awareness, which drops the volume and lets in ambient sound when I start talking. The Sony app is good, but it is not this seamlessly woven into my daily device usage.</p><h2>So which should you buy?</h2><p>If you are a frequent flyer, work in genuinely loud environments, or prioritise raw noise cancellation above all else — Sony XM6. It is the better technical headphone. If you wear glasses, use multiple Apple devices, or just want something that disappears into your life without drama — AirPods Pro 2. I switched back. But I do not regret the month with the Sony. I now know exactly what I value.</p>',
  },
  {
    slug: 'i-bought-five-robot-vacuums-under-300-heres-which-one-won',
    title: "I bought 5 robot vacuums under $300 and ran them over the same dirty floor. There's a clear winner",
    category: 'Home Appliances',
    author: 'Alison DeNisco Rayome',
    read_time: '8 min read',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop',
    published: true,
    published_at: '2026-03-10T10:00:00Z',
    content: '<p>The robot vacuum market has exploded. There are now dozens of models under $300 that claim to handle pet hair, navigate obstacles, and schedule cleanings from your phone. Most of them are lying, at least partially. I spent a month testing five of the most popular options on the same floors, with the same mess, in the same apartment. Here is the honest breakdown.</p><h2>The test setup</h2><p>I scattered the same mix of fine dust, cereal, dog hair, and small debris across a tiled kitchen floor and a medium-pile carpet section in my living room. I ran each vacuum on its default settings, once on each surface. I measured what it picked up and what it left behind. I also paid attention to something reviews rarely mention: how annoying each vacuum is to live with.</p><h2>The annoying truth about cheap robot vacuums</h2><p>Most of them bump into things constantly, get stuck under furniture with millimetres to spare, and require you to empty their tiny bins after every single run. The cheapest model I tested — a no-brand option at $89 — left more debris in my carpet than it collected. That is not a robot vacuum. That is an expensive toy that makes noise.</p><h2>The winner at $240: Roborock Q5 Pro</h2><p>The Roborock Q5 Pro is not glamorous. It does not have a self-emptying dock. It does not have a camera so it can avoid your dog\'s toys with machine-learning precision. What it does is clean extraordinarily well for its price, navigate consistently without getting stuck, and have a large enough bin that you only need to empty it every three or four runs. The app is genuinely good. The mapping is accurate. It remembers your house between sessions. At $240, it is the one I would recommend to almost anyone.</p><h2>Who should spend more</h2><p>If you have pets that shed heavily and truly cannot face emptying a bin every few days, spend $450 and get a self-emptying dock model. It changes your relationship with the device from appliance-you-manage to appliance-that-just-works. But under $300, no self-emptying option performs as well overall as the Roborock.</p>',
  },
  {
    slug: 'i-owned-lg-oled-c4-for-one-year-honest-update',
    title: "I've owned the LG OLED C4 for a year. Here's my brutally honest update",
    category: 'Electronics',
    author: 'Jason Howell',
    read_time: '10 min read',
    image_url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1200&auto=format&fit=crop',
    published: true,
    published_at: '2026-03-05T10:00:00Z',
    content: '<p>A year ago I wrote that the LG OLED C4 was the best TV you could buy. I stand by that. But a year of ownership has taught me things that no review written after two weeks of use could have. Let me update the record.</p><h2>What I got right</h2><p>The picture quality is still stunning. Every time I sit down to watch a film I have seen before, I notice something I missed the first fifty times because the contrast was not this good on my old screen. Dolby Vision content, in particular, consistently takes my breath away. OLED panels render black as actual absence of light, and once you have lived with that, you cannot go back to an LCD.</p><h2>What nobody warned me about: OLED brightness in a bright room</h2><p>I have a west-facing living room. In the afternoons in summer, sunlight comes directly onto the screen. The C4\'s peak brightness of around 1,300 nits is excellent by OLED standards but genuinely struggles in direct sunlight. I have started closing the blinds for afternoon viewing in a way I never had to with my old LCD. This is an OLED limitation, not a C4 failure — but it is real.</p><h2>The gaming performance, one year later</h2><p>I play on PlayStation 5 and a gaming PC. The 1.2ms input lag in game mode is transparent — there is simply no perceivable delay between input and response. G-Sync works flawlessly. VRR at 4K120Hz is a genuinely different experience than playing at 60Hz. If you are a gamer debating whether OLED is worth it for gaming, the answer is yes, unambiguously, end of debate.</p><h2>webOS: the slow degradation</h2><p>In the first few months, webOS 24 was fast and clean. A year of software updates later, it is slightly less snappy. Apps take fractionally longer to open. This is the nature of smart TV software, but it is worth noting. My solution has been a 4K Apple TV which bypasses webOS entirely for most of my viewing. Many OLED owners end up doing the same.</p><h2>One year verdict</h2><p>The LG OLED C4 remains the best TV for most people who can afford it. But go in knowing that a separate streaming device will likely serve you better than the built-in smart system long-term, and that bright room conditions are its genuine weakness.</p>',
  },
  {
    slug: 'i-used-nintendo-switch-2-every-day-for-a-month-5-things-love-2-hate',
    title: "I used the Nintendo Switch 2 every single day for a month. 5 things I love and 2 I hate",
    category: 'Gaming',
    author: 'Jason Howell',
    read_time: '12 min read',
    image_url: 'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?q=80&w=1200&auto=format&fit=crop',
    published: true,
    published_at: '2026-02-28T10:00:00Z',
    content: '<p>I have been a Switch owner since the original launched. I put hundreds of hours into Breath of the Wild, Hollow Knight, Hades. When Nintendo announced Switch 2, I was cautiously excited. After a month of daily use, here is my honest accounting: five things I genuinely love, and two things that still drive me mad.</p><h2>Things I love</h2><h3>1. The display is transformative</h3><p>Going from the original Switch\'s 720p panel to the Switch 2\'s 1080p 8-inch display is not subtle. Text in menus is sharp. Games that looked soft in handheld mode now look as good as a small monitor. I play in handheld mode far more than I used to simply because it now looks as good as docked for most titles.</p><h3>2. The magnetic Joy-Con are the detail Nintendo should have shipped first time</h3><p>Clicking Joy-Con into rails was always awkward. The magnetic connection on Switch 2 is satisfying, secure, and — crucially — works the first time every time. It sounds minor. After a month it just feels right in a way the original never did.</p><h3>3. The new Mario Kart makes online feel like a completely different game</h3><p>24-player online races are chaotic in the best way. The new track design accounts for the increased grid size in ways that feel genuinely considered. I have been playing Mario Kart competitively for fifteen years and Switch 2 has made it exciting again.</p><h3>4. Backwards compatibility is flawless</h3><p>Every Switch game I tested works. Performance patches for older titles are rolling out steadily and the improvement is often dramatic. Hades runs at 60fps in handheld mode now. It did not on the original Switch.</p><h3>5. The battery improvement is real</h3><p>The original Switch lasted around three hours on demanding games. Switch 2 consistently gives me four and a half to five on equivalent titles. That is the difference between a game you can finish on a long flight and one you cannot.</p><h2>Things I hate</h2><h3>1. The GameChat implementation is half-baked</h3><p>The C button on Joy-Con launches GameChat, Nintendo\'s new voice and video chat system. The idea is good. The execution at launch is limited: no Discord, no cross-game chat, and the video quality is noticeably worse than FaceTime or WhatsApp. I have stopped using it and just use Discord on my phone.</p><h3>2. The software library is still sparse after launch</h3><p>I have finished every Switch 2-native game released in the first month. Nintendo needs third-party partners to fill the gaps faster than it managed in the original Switch launch window. Backwards compatibility helps, but a new console deserves new games.</p>',
  },
  {
    slug: 'i-replaced-my-nest-cameras-with-35-dollar-cameras-and-heres-what-happened',
    title: "I replaced my $200 Nest cameras with $35 alternatives. Here's what happened 3 months later",
    category: 'Smart Home',
    author: 'Charlie Osborne',
    read_time: '8 min read',
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1200&auto=format&fit=crop',
    published: true,
    published_at: '2026-02-20T10:00:00Z',
    content: '<p>I had two Google Nest Cam Outdoor cameras protecting my front door and driveway. Each cost me $200 at launch. Then I discovered TP-Link Tapo C320WS cameras at $35 each on sale. I bought two on a whim, installed them side by side with the Nest cameras for three months, and compared every significant metric. The results embarrassed me slightly, because I had been overpaying for years.</p><h2>Image quality: closer than you think</h2><p>Both cameras record in 2K resolution. Both support color night vision — the ability to capture full color in very low light conditions using a supplemental LED. In daylight, I honestly cannot tell the recordings apart when I play them back on my phone. At night, the Nest has a marginal edge in color accuracy under streetlight, but the TP-Link is genuinely usable. In terms of capturing someone\'s face at the front door at 11pm, both would do the job in a legal or insurance context.</p><h2>Where the Nest earns its premium</h2><p>The Google Nest ecosystem integration is meaningful if you already use Google Home. My Nest cameras show up in the Google Home app alongside my Nest thermostat and my smart displays. I can say "Hey Google, show me the front door" and my Nest Hub shows the live feed. The TP-Link cameras live in their own separate Tapo app, which is good but siloed.</p><h2>Where the TP-Link surprises</h2><p>Local storage. The TP-Link cameras support a microSD card slot for local recording. The Nest cameras require a Google Nest Aware subscription to access recorded clips — $8 a month per camera. Over the three months of this test, my two Nest cameras cost me $48 in subscription fees on top of their original purchase price. The TP-Link cameras cost me nothing beyond the hardware.</p><h2>Three months later: what is still in place</h2><p>I kept the TP-Link cameras. I cancelled my Nest Aware subscription. I still have one Nest camera at the front door because of the Google Home integration — but I am honest with myself that the integration is a luxury, not a necessity. If you are starting from scratch and not already embedded in Google\'s ecosystem, I cannot justify recommending the Nest at its price point today.</p>',
  },
  {
    slug: 'google-pixel-9-pro-six-weeks-camera-honest-verdict',
    title: "I shot 3,000 photos with the Pixel 9 Pro in 6 weeks. Here's my completely honest verdict on the camera",
    category: 'Smartphones',
    author: 'Charlie Osborne',
    read_time: '11 min read',
    image_url: 'https://images.unsplash.com/photo-1644710794190-3bd84e1f8cd9?q=80&w=1200&auto=format&fit=crop',
    published: true,
    published_at: '2026-02-10T10:00:00Z',
    content: '<p>I decided to go further than a standard camera review. I shot more than 3,000 photos with the Pixel 9 Pro over six weeks, across six different countries and dozens of different lighting conditions. I wanted to know not just whether the camera was good in controlled comparisons, but whether I could trust it to capture moments that actually mattered — sunsets, crowded street scenes, low-light restaurants, my friend\'s kid\'s birthday party at 9pm in a dimly lit house.</p><h2>What I discovered that reviewers miss</h2><p>The Pixel 9 Pro camera has a personality. It consistently chooses to expose scenes in a specific way: it preserves shadows, pulls back highlights, and renders colors in a film-adjacent style that is neither accurate nor inaccurate, but instead consistently pleasing. After six weeks I started to anticipate how it would render a scene. I could pre-visualise the output in a way I cannot with Samsung\'s camera, which changes its rendering dramatically based on scene-detection algorithms that sometimes get it wrong.</p><h2>The night photography is genuinely shocking</h2><p>I photographed the interior of a candlelit restaurant in Florence at what my light meter estimated as equivalent to ISO 12,800. The Pixel 9 Pro produced an image with faces I could identify, ambient color from the candles, and noise levels that looked intentional — almost film grain. My iPhone photographed the same scene and produced something usable but clearly more processed. The Pixel made me forget I was worried about the light.</p><h2>Where it stumbles</h2><p>Moving subjects at night are still a challenge. Children at birthday parties — the 9pm situation I described — were sometimes blurred in a way that Night Sight\'s long exposure requirements made inevitable. Samsung\'s faster sensor handles motion in low light better. This is a meaningful limitation in real use.</p><h2>The new AI features: useful, ethically squirmy</h2><p>Reimagine — the feature that lets you change elements of photos using generative AI — works impressively well technically. I changed a grey London sky to a sunset behind Tower Bridge and you would not know. The question of whether I should put that photo on Instagram and not disclose the edit is one I chose to resolve by not posting it. Your mileage may vary. Google needs a disclosure workflow built into the sharing process for these images.</p><h2>Six weeks, 3,000 photos, one verdict</h2><p>The Pixel 9 Pro is my recommended smartphone camera for people who want excellent photography with minimal effort. It requires no knowledge of manual settings to produce remarkable images. If you shoot mostly in good light or are occasional about night photography, nothing in this price category consistently produces better photos. If you shoot moving subjects in low light often, consider how that specific limitation fits your life before buying.</p>',
  },
]

async function resetArticles() {
  console.log('Deleting all existing articles...')
  const { error: deleteError } = await supabase
    .from('articles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (deleteError) {
    console.error('Failed to delete articles:', deleteError.message)
    return
  }
  console.log('All existing articles deleted.\n')

  console.log('Inserting new first-person product reviews...')
  let inserted = 0

  for (const review of REVIEWS) {
    const { error } = await supabase.from('articles').insert(review)
    if (error) {
      console.error('Failed to insert "' + review.title + '":', error.message)
    } else {
      console.log('Inserted: ' + review.title)
      inserted++
    }
  }

  console.log('\nDone! Total articles published: ' + inserted)
}

resetArticles().catch(console.error)
