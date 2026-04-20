import { readdir } from 'fs/promises';

async function fixEmDashes() {
  let updatedCount = 0;
  
  try {
    // We will use the existing Supabase server context or local API.
    // If we want to get ALL articles, we can fetch the list first.
    // Wait, let's see if /api/articles/list exposes all articles.
    const listRes = await fetch('http://localhost:3000/api/articles/list');
    if (!listRes.ok) throw new Error(\`Failed to fetch articles: \${listRes.status}\`);
    
    // We might have a different route. Let's see...
    const data = await listRes.json();
    const articles = Array.isArray(data) ? data : (data.articles ? data.articles : []);
    
    if (articles.length === 0) {
      console.log('No articles found or wrong endpoint response structure.');
      return;
    }
    
    console.log(\`Found \${articles.length} articles to process...\`);
    
    for (const article of articles) {
      let needsUpdate = false;
      const payload = { slug: article.slug };
      
      // We will check and replace in title, content, meta_description, hook, etc.
      // The reliable regex for em-dash.
      const emDashRegex = /\\s*[—]\\s*/g;
      
      if (article.title && emDashRegex.test(article.title)) {
        payload.title = article.title.replace(emDashRegex, ', ');
        needsUpdate = true;
      }
      
      if (article.content && emDashRegex.test(article.content)) {
        payload.content = article.content.replace(emDashRegex, ', ');
        needsUpdate = true;
      }
      
      if (article.meta_description && emDashRegex.test(article.meta_description)) {
        payload.meta_description = article.meta_description.replace(emDashRegex, ', ');
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        console.log(\`Updating em-dashes in: \${article.slug}\`);
        
        try {
          const res = await fetch('http://localhost:3000/api/articles/' + article.slug, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (res.ok) {
            console.log(\`✅ \${article.slug}\`);
            updatedCount++;
          } else {
            console.error(\`❌ Failed \${article.slug}: \${res.status} \${await res.text()}\`);
          }
        } catch (updateErr) {
           console.error(\`❌ Network error for \${article.slug}: \`, updateErr);
        }
      }
    }
    
    console.log(\`Done! Replaced em-dashes with commas in \${updatedCount} articles.\`);
  } catch (err) {
    console.error('Error during execution:', err);
  }
}

fixEmDashes();
