module.exports = [
"[project]/Downloads/ai-blog/lib/supabase/health-check.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "executeDatabaseHealthCheck",
    ()=>executeDatabaseHealthCheck
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [instrumentation] (ecmascript)");
;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgkvrbdpmwyfjvpubzxn.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE';
// We use anonymous key for simple read-only metadata checks 
// like checking table existence or row counting public tables.
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["createClient"])(SUPABASE_URL, SUPABASE_ANON_KEY);
async function executeDatabaseHealthCheck() {
    const result = {
        status: 'healthy',
        database: {
            connected: false
        },
        storage: {
            accessible: false
        },
        tables: {
            articles: {
                exists: false
            },
            writers: {
                exists: false
            },
            product_cards: {
                exists: false
            }
        },
        timestamp: new Date().toISOString()
    };
    try {
        // Check articles table
        const { data: articles, error: dbError, count } = await supabase.from('articles').select('id', {
            count: 'exact',
            head: true
        });
        if (dbError) {
            result.database.connected = false;
            result.database.error = dbError.message;
            result.status = 'unhealthy';
        } else {
            result.database.connected = true;
            result.tables.articles.exists = true;
            result.tables.articles.rowCount = count || 0;
        }
        // Check writers table
        if (result.database.connected) {
            const { error: writersError, count: writersCount } = await supabase.from('writers').select('id', {
                count: 'exact',
                head: true
            });
            if (writersError) {
                result.tables.writers.error = writersError.message;
                result.status = 'unhealthy';
            } else {
                result.tables.writers.exists = true;
                result.tables.writers.rowCount = writersCount || 0;
            }
            // Check product_cards table
            const { error: productsError, count: productsCount } = await supabase.from('product_cards').select('id', {
                count: 'exact',
                head: true
            });
            if (productsError) {
                result.tables.product_cards.error = productsError.message;
                result.status = 'unhealthy';
            } else {
                result.tables.product_cards.exists = true;
                result.tables.product_cards.rowCount = productsCount || 0;
            }
        }
        // Check storage bucket accessibility
        const { error: bucketError } = await supabase.storage.from('article_images').list('', {
            limit: 1
        });
        if (bucketError) {
            if (bucketError.message.includes('not found') || bucketError.message.includes('Bucket')) {
                result.storage.accessible = false;
                result.storage.error = 'article_images bucket not found or not accessible';
                result.status = 'unhealthy';
            } else {
                result.storage.accessible = true;
                result.storage.error = `Note: ${bucketError.message} (bucket exists but may have permission issues)`;
            }
        } else {
            result.storage.accessible = true;
        }
    } catch (error) {
        result.status = 'unhealthy';
        result.database.error = error instanceof Error ? error.message : 'Unknown error';
    }
    return result;
}
}),
];

//# sourceMappingURL=Downloads_ai-blog_lib_supabase_health-check_ts_e5b43d47._.js.map