module.exports = [
"[project]/Downloads/ai-blog/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "register",
    ()=>register
]);
async function register() {
    if ("TURBOPACK compile-time truthy", 1) {
        // Dynamically import the check to avoid Edge runtime issues on build
        const { executeDatabaseHealthCheck } = await __turbopack_context__.A("[project]/Downloads/ai-blog/lib/supabase/health-check.ts [instrumentation] (ecmascript, async loader)");
        console.log('[System] Running Background Database Health Check on Startup...');
        const health = await executeDatabaseHealthCheck();
        if (health.status === 'healthy') {
            console.log('[System] Database Health Check: ✅ PASS (Connection: OK, Tables: articles, writers, product_cards checked)');
        } else {
            console.warn('[System] Database Health Check: ⚠️ WARNING');
            if (!health.database.connected) {
                console.error('         ❌ Database connection failed:', health.database.error);
            }
            if (!health.storage.accessible) {
                console.error('         ❌ Storage accessibility failed:', health.storage.error);
            }
            const tables = [
                'articles',
                'writers',
                'product_cards'
            ];
            tables.forEach((table)=>{
                if (!health.tables[table].exists) {
                    console.warn(`         ⚠️ Table missing or throwing error: '${table}' - ${health.tables[table].error || 'Not found'}`);
                }
            });
        }
    }
}
}),
];

//# sourceMappingURL=Downloads_ai-blog_instrumentation_ts_0a580083._.js.map