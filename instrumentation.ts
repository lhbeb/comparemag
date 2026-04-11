export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamically import the check to avoid Edge runtime issues on build
    const { executeDatabaseHealthCheck } = await import('./lib/supabase/health-check')
    
    console.log('[System] Running Background Database Health Check on Startup...')
    const health = await executeDatabaseHealthCheck()
    
    if (health.status === 'healthy') {
      console.log('[System] Database Health Check: ✅ PASS (Connection: OK, Tables: articles, writers, product_cards checked)')
    } else {
      console.warn('[System] Database Health Check: ⚠️ WARNING')
      if (!health.database.connected) {
        console.error('         ❌ Database connection failed:', health.database.error)
      }
      if (!health.storage.accessible) {
        console.error('         ❌ Storage accessibility failed:', health.storage.error)
      }
      
      const tables = ['articles', 'writers', 'product_cards'] as const
      tables.forEach((table) => {
        if (!health.tables[table].exists) {
          console.warn(`         ⚠️ Table missing or throwing error: '${table}' - ${health.tables[table].error || 'Not found'}`)
        }
      })
    }
  }
}
