'use client'

import { useEffect } from 'react'

export function EmbedHydrator() {
  useEffect(() => {
    // 1. Locate the article body container
    const articleContainer = document.querySelector('[itemprop="articleBody"]')
    if (!articleContainer) return

    // 2. Find all <script> tags inside the content that were bypassed by React's dangerouslySetInnerHTML
    const scripts = articleContainer.querySelectorAll('script')
    
    scripts.forEach((oldScript) => {
      // Prevent running the same script twice in strict mode / re-renders
      if (oldScript.getAttribute('data-hydrated') === 'true') return
      
      const newScript = document.createElement('script')
      
      // Copy all attributes (like src, async, charset)
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value)
      })
      
      // Copy inline JS content if present
      if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML
      }
      
      // Mark as hydrated
      oldScript.setAttribute('data-hydrated', 'true')
      
      // Insert the new active script into the DOM so the browser fetches/executes it
      if (oldScript.parentNode) {
        oldScript.parentNode.insertBefore(newScript, oldScript.nextSibling)
      }
    })
    
    // Optional utility: If Twitter is used, sometimes the script needs a manual trigger if it was already loaded globally
    if ((window as any).twttr && (window as any).twttr.widgets) {
      (window as any).twttr.widgets.load(articleContainer)
    }
    
    // Optional utility: For Instagram
    if ((window as any).instgrm && (window as any).instgrm.Embeds) {
      (window as any).instgrm.Embeds.process()
    }
    
  }, [])

  return null
}
