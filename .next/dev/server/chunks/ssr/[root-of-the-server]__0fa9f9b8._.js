module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/Downloads/ai-blog/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Downloads/ai-blog/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Downloads/ai-blog/app/not-found.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Downloads/ai-blog/app/not-found.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Downloads/ai-blog/app/blog/[slug]/not-found.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Downloads/ai-blog/app/blog/[slug]/not-found.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Downloads/ai-blog/lib/supabase/server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/next/dist/compiled/server-only/empty.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/next/headers.js [app-rsc] (ecmascript)");
;
;
;
;
const SUPABASE_URL = 'https://fgkvrbdpmwyfjvpubzxn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE';
async function createClient() {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(SUPABASE_URL, SUPABASE_ANON_KEY, {
            cookies: {
                getAll () {
                    return cookieStore.getAll();
                },
                setAll (cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                    } catch  {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                    }
                }
            }
        });
    } catch (error) {
        // Fallback to direct client if cookies() fails
        console.warn('Failed to create server client with cookies, using direct client:', error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
    }
}
}),
"[project]/Downloads/ai-blog/lib/supabase/articles.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createArticle",
    ()=>createArticle,
    "deleteArticle",
    ()=>deleteArticle,
    "getAllArticles",
    ()=>getAllArticles,
    "getAllSlugs",
    ()=>getAllSlugs,
    "getArticleBySlug",
    ()=>getArticleBySlug,
    "publishArticle",
    ()=>publishArticle,
    "unpublishArticle",
    ()=>unpublishArticle,
    "updateArticle",
    ()=>updateArticle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/next/dist/compiled/server-only/empty.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/lib/supabase/server.ts [app-rsc] (ecmascript)");
;
;
function getMissingColumnName(message) {
    const match = message.match(/Could not find the '([^']+)' column/);
    return match?.[1] ?? null;
}
async function retryWithoutMissingColumns(operation, payload) {
    let nextPayload = {
        ...payload
    };
    while(true){
        const result = await operation(nextPayload);
        if (!result.error) {
            return result.data;
        }
        const missingColumn = getMissingColumnName(result.error.message);
        if (!missingColumn || !(missingColumn in nextPayload)) {
            throw new Error(result.error.message);
        }
        const { [missingColumn]: _removed, ...rest } = nextPayload;
        nextPayload = rest;
    }
}
async function getAllArticles(publishedOnly = true) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
        let query = supabase.from('articles').select('*').order('created_at', {
            ascending: false
        });
        if (publishedOnly) {
            query = query.eq('published', true);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Supabase error:', error);
            throw new Error(`Failed to fetch articles: ${error.message}`);
        }
        return data;
    } catch (error) {
        console.error('Error in getAllArticles:', error);
        // If it's a network error, try one more time with a direct client
        if (error instanceof Error && error.message.includes('fetch failed')) {
            try {
                const { createClient: createDirectClient } = await __turbopack_context__.A("[project]/Downloads/ai-blog/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-rsc] (ecmascript, async loader)");
                const directClient = createDirectClient('https://fgkvrbdpmwyfjvpubzxn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE');
                let query = directClient.from('articles').select('*').order('created_at', {
                    ascending: false
                });
                if (publishedOnly) {
                    query = query.eq('published', true);
                }
                const { data, error: retryError } = await query;
                if (retryError) {
                    throw new Error(`Failed to fetch articles: ${retryError.message}`);
                }
                return data;
            } catch (retryError) {
                console.error('Retry also failed:', retryError);
                throw error // Throw original error
                ;
            }
        }
        throw error;
    }
}
async function getArticleBySlug(slug) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
        const { data, error } = await supabase.from('articles').select('*').eq('slug', slug).eq('published', true).single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null // Article not found
                ;
            }
            console.error('Supabase error:', error);
            throw new Error(`Failed to fetch article: ${error.message}`);
        }
        return data;
    } catch (error) {
        console.error('Error in getArticleBySlug:', error);
        // If it's a network error, try one more time with a direct client
        if (error instanceof Error && error.message.includes('fetch failed')) {
            try {
                const { createClient: createDirectClient } = await __turbopack_context__.A("[project]/Downloads/ai-blog/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-rsc] (ecmascript, async loader)");
                const directClient = createDirectClient('https://fgkvrbdpmwyfjvpubzxn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE');
                const { data, error: retryError } = await directClient.from('articles').select('*').eq('slug', slug).eq('published', true).single();
                if (retryError) {
                    if (retryError.code === 'PGRST116') {
                        return null // Article not found
                        ;
                    }
                    throw new Error(`Failed to fetch article: ${retryError.message}`);
                }
                return data;
            } catch (retryError) {
                console.error('Retry also failed:', retryError);
                throw error // Throw original error
                ;
            }
        }
        throw error;
    }
}
async function getAllSlugs() {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
        const { data, error } = await supabase.from('articles').select('slug').eq('published', true);
        if (error) {
            console.error('Supabase error:', error);
            throw new Error(`Failed to fetch slugs: ${error.message}`);
        }
        return data.map((item)=>item.slug);
    } catch (error) {
        console.error('Error in getAllSlugs:', error);
        // If it's a network error, try one more time with a direct client
        if (error instanceof Error && error.message.includes('fetch failed')) {
            try {
                const { createClient: createDirectClient } = await __turbopack_context__.A("[project]/Downloads/ai-blog/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-rsc] (ecmascript, async loader)");
                const directClient = createDirectClient('https://fgkvrbdpmwyfjvpubzxn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE');
                const { data, error: retryError } = await directClient.from('articles').select('slug').eq('published', true);
                if (retryError) {
                    throw new Error(`Failed to fetch slugs: ${retryError.message}`);
                }
                return data.map((item)=>item.slug);
            } catch (retryError) {
                console.error('Retry also failed:', retryError);
                // Return empty array to prevent build failures
                return [];
            }
        }
        // Return empty array to prevent build failures
        return [];
    }
}
async function createArticle(article) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const data = await retryWithoutMissingColumns((payload)=>supabase.from('articles').insert(payload).select().single(), article);
    return data;
}
async function updateArticle(slug, updates) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const data = await retryWithoutMissingColumns((payload)=>supabase.from('articles').update(payload).eq('slug', slug).select().single(), updates);
    return data;
}
async function deleteArticle(slug) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from('articles').delete().eq('slug', slug);
    if (error) {
        throw new Error(`Failed to delete article: ${error.message}`);
    }
}
async function publishArticle(slug) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from('articles').update({
        published: true,
        published_at: new Date().toISOString()
    }).eq('slug', slug).select().single();
    if (error) {
        throw new Error(`Failed to publish article: ${error.message}`);
    }
    return data;
}
async function unpublishArticle(slug) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from('articles').update({
        published: false,
        published_at: null
    }).eq('slug', slug).select().single();
    if (error) {
        throw new Error(`Failed to unpublish article: ${error.message}`);
    }
    return data;
}
}),
"[project]/Downloads/ai-blog/components/blog-post-content.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "BlogPostContent",
    ()=>BlogPostContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const BlogPostContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BlogPostContent() from the server but BlogPostContent is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Downloads/ai-blog/components/blog-post-content.tsx <module evaluation>", "BlogPostContent");
}),
"[project]/Downloads/ai-blog/components/blog-post-content.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "BlogPostContent",
    ()=>BlogPostContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const BlogPostContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call BlogPostContent() from the server but BlogPostContent is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Downloads/ai-blog/components/blog-post-content.tsx", "BlogPostContent");
}),
"[project]/Downloads/ai-blog/components/blog-post-content.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$components$2f$blog$2d$post$2d$content$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/components/blog-post-content.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$components$2f$blog$2d$post$2d$content$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/components/blog-post-content.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$components$2f$blog$2d$post$2d$content$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Downloads/ai-blog/lib/seo/article-seo.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateArticleMetadata",
    ()=>generateArticleMetadata,
    "generateArticleStructuredData",
    ()=>generateArticleStructuredData,
    "generateBreadcrumbStructuredData",
    ()=>generateBreadcrumbStructuredData,
    "generateOrganizationStructuredData",
    ()=>generateOrganizationStructuredData
]);
function generateArticleMetadata(article, siteUrl = 'https://comparemag.blog') {
    const url = `${siteUrl}/blog/${article.slug}`;
    const imageUrl = article.og_image || article.image_url || `${siteUrl}/placeholder.svg`;
    // Use provided meta description or generate from content
    const metaDescription = article.meta_description || article.content.replace(/<[^>]*>/g, '').substring(0, 160).trim() + '...';
    // Use provided OG title or fallback to article title
    const ogTitle = article.og_title || article.title;
    // Use provided OG description or fallback to meta description
    const ogDescription = article.og_description || metaDescription;
    // Parse keywords
    const keywords = article.meta_keywords ? article.meta_keywords.split(',').map((k)=>k.trim()) : [
        article.category,
        'AI',
        'Artificial Intelligence',
        'Machine Learning',
        'Deep Learning'
    ];
    return {
        title: `${article.title} | CompareMag`,
        description: metaDescription,
        keywords: keywords,
        authors: [
            {
                name: article.author
            }
        ],
        creator: article.author,
        publisher: 'CompareMag',
        formatDetection: {
            email: false,
            address: false,
            telephone: false
        },
        metadataBase: new URL(siteUrl),
        alternates: {
            canonical: url
        },
        openGraph: {
            title: ogTitle,
            description: ogDescription,
            url: article.canonical_url || url,
            siteName: 'CompareMag',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: article.title
                }
            ],
            locale: 'en_US',
            type: 'article',
            publishedTime: article.published_at || article.created_at,
            modifiedTime: article.updated_at,
            authors: [
                article.author
            ],
            section: article.category,
            tags: [
                article.category,
                'AI',
                'Machine Learning'
            ]
        },
        twitter: {
            card: article.twitter_card || 'summary_large_image',
            title: ogTitle,
            description: ogDescription,
            images: [
                imageUrl
            ],
            creator: '@comparemag',
            site: '@comparemag'
        },
        robots: {
            index: article.published,
            follow: true,
            googleBot: {
                index: article.published,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1
            }
        },
        other: {
            'article:published_time': article.published_at || article.created_at,
            'article:modified_time': article.updated_at,
            'article:author': article.author,
            'article:section': article.category,
            'article:tag': article.category
        }
    };
}
function generateArticleStructuredData(article, siteUrl = 'https://neuralpulse.blog') {
    const url = `${siteUrl}/blog/${article.slug}`;
    const imageUrl = article.image_url || `${siteUrl}/placeholder.svg`;
    // Extract text content for description
    const description = article.content.replace(/<[^>]*>/g, '').substring(0, 200).trim();
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: description,
        image: imageUrl,
        datePublished: article.published_at || article.created_at,
        dateModified: article.updated_at,
        author: {
            '@type': 'Person',
            name: article.author
        },
        publisher: {
            '@type': 'Organization',
            name: 'CompareMag',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/icon.svg`
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url
        },
        articleSection: article.category,
        keywords: article.category,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        wordCount: article.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
        timeRequired: article.read_time
    };
}
function generateBreadcrumbStructuredData(article, siteUrl = 'https://comparemag.blog') {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteUrl
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Articles',
                item: `${siteUrl}/articles`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: article.category,
                item: `${siteUrl}/topics/${article.category.toLowerCase().replace(/\s+/g, '-')}`
            },
            {
                '@type': 'ListItem',
                position: 4,
                name: article.title,
                item: `${siteUrl}/blog/${article.slug}`
            }
        ]
    };
}
function generateOrganizationStructuredData(siteUrl = 'https://comparemag.blog') {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'CompareMag',
        url: siteUrl,
        logo: `${siteUrl}/icon.svg`,
        sameAs: [
            'https://twitter.com/comparemag',
            'https://github.com/comparemag',
            'https://linkedin.com/company/comparemag'
        ],
        description: 'Exploring the frontiers of artificial intelligence, generative AI, computer vision, and deep learning.'
    };
}
}),
"[project]/Downloads/ai-blog/components/seo/structured-data.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StructuredData",
    ()=>StructuredData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/next/script.js [app-rsc] (ecmascript)");
;
;
function StructuredData({ data }) {
    const jsonLd = Array.isArray(data) ? data : [
        data
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: jsonLd.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                id: `structured-data-${index}`,
                type: "application/ld+json",
                dangerouslySetInnerHTML: {
                    __html: JSON.stringify(item)
                }
            }, index, false, {
                fileName: "[project]/Downloads/ai-blog/components/seo/structured-data.tsx",
                lineNumber: 13,
                columnNumber: 9
            }, this))
    }, void 0, false);
}
}),
"[project]/Downloads/ai-blog/lib/supabase/products.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createProduct",
    ()=>createProduct,
    "deleteProduct",
    ()=>deleteProduct,
    "getAllProducts",
    ()=>getAllProducts,
    "getProductBySlug",
    ()=>getProductBySlug,
    "updateProduct",
    ()=>updateProduct
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/next/dist/compiled/server-only/empty.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/lib/supabase/server.ts [app-rsc] (ecmascript)");
;
;
async function getAllProducts(publishedOnly = false) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
        let query = supabase.from('product_cards').select('*').order('created_at', {
            ascending: false
        });
        if (publishedOnly) {
            query = query.eq('published', true);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Supabase error fetching products:', error);
            throw new Error(`Failed to fetch products: ${error.message}`);
        }
        return data;
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        if (error instanceof Error && error.message.includes('fetch failed')) {
            const { createClient: createDirectClient } = await __turbopack_context__.A("[project]/Downloads/ai-blog/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-rsc] (ecmascript, async loader)");
            const directClient = createDirectClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgkvrbdpmwyfjvpubzxn.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE');
            let query = directClient.from('product_cards').select('*').order('created_at', {
                ascending: false
            });
            if (publishedOnly) {
                query = query.eq('published', true);
            }
            const { data, error: retryError } = await query;
            if (retryError) throw new Error(`Failed to fetch products: ${retryError.message}`);
            return data;
        }
        throw error;
    }
}
async function getProductBySlug(slug) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
        const { data, error } = await supabase.from('product_cards').select('*').eq('slug', slug).single();
        if (error) {
            if (error.code === 'PGRST116') return null // Not found
            ;
            throw new Error(`Failed to fetch product: ${error.message}`);
        }
        return data;
    } catch (error) {
        if (error instanceof Error && error.message.includes('fetch failed')) {
            const { createClient: createDirectClient } = await __turbopack_context__.A("[project]/Downloads/ai-blog/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-rsc] (ecmascript, async loader)");
            const directClient = createDirectClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgkvrbdpmwyfjvpubzxn.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE');
            const { data, error: retryError } = await directClient.from('product_cards').select('*').eq('slug', slug).single();
            if (retryError) {
                if (retryError.code === 'PGRST116') return null;
                throw new Error(`Failed to fetch product: ${retryError.message}`);
            }
            return data;
        }
        throw error;
    }
}
async function createProduct(product) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from('product_cards').insert(product).select().single();
    if (error) {
        throw new Error(`Failed to create product card: ${error.message}`);
    }
    return data;
}
async function updateProduct(slug, updates) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from('product_cards').update(updates).eq('slug', slug).select().single();
    if (error) {
        throw new Error(`Failed to update product card: ${error.message}`);
    }
    return data;
}
async function deleteProduct(slug) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.from('product_cards').delete().eq('slug', slug);
    if (error) {
        throw new Error(`Failed to delete product card: ${error.message}`);
    }
}
}),
"[project]/Downloads/ai-blog/lib/products/embed.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseProductShortcodes",
    ()=>parseProductShortcodes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$products$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/lib/supabase/products.ts [app-rsc] (ecmascript)");
;
async function parseProductShortcodes(content) {
    const shortcodeRegex = /\[product-card:([a-zA-Z0-9-]+)\]/g;
    const matches = [
        ...content.matchAll(shortcodeRegex)
    ];
    if (matches.length === 0) {
        return content;
    }
    let parsedContent = content;
    // We fetch products and replace them one by one
    for (const match of matches){
        const originalShortcode = match[0];
        const slug = match[1];
        try {
            const product = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$products$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProductBySlug"])(slug);
            if (!product || !product.published) {
                // Leave shortcode or remove it if product not found/published. 
                // We'll replace with an empty string or a small notice.
                parsedContent = parsedContent.replace(originalShortcode, '');
                continue;
            }
            // Generate HTML string for the product card
            const ctaHref = product.external_url || '#';
            const ctaLabel = product.cta_label || 'Check Price';
            const featuresHTML = product.specs ? Object.entries(product.specs).map(([k, v])=>`
        <li style="display: flex; justify-content: space-between; font-size: 0.875rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.25rem;">
          <span style="color: #64748b; font-weight: 500;">${k}</span>
          <span style="color: #0f172a;">${v}</span>
        </li>
      `).join('') : '';
            const badgeHtml = product.badge_text ? `
        <div style="position: absolute; top: -10px; left: 16px; background-color: #ea580c; color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          ${product.badge_text}
        </div>
      ` : '';
            const ratingHtml = product.rating_text ? `
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f59e0b; fill: #f59e0b;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span style="font-size: 0.875rem; font-weight: 600; color: #334155;">${product.rating_text}</span>
        </div>
      ` : '';
            const cardHtml = `
      <div style="position: relative; margin: 32px 0; border-radius: 16px; border: 1px solid #e2e8f0; background: white; padding: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); display: flex; flex-direction: column; gap: 20px;" class="product-card-embed">
        ${badgeHtml}
        
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
            ${product.image_url ? `
              <img src="${product.image_url}" alt="${product.title}" style="max-height: 200px; width: auto; object-fit: contain; border-radius: 8px; margin: 0;" />
            ` : `
              <div style="height: 150px; width: 100%; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8;">No image</div>
            `}
          </div>
          
          <div style="flex: 1;">
            ${product.brand ? `<p style="text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-size: 0.75rem; font-weight: 700; margin: 0 0 4px 0;">${product.brand}</p>` : ''}
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; line-height: 1.3;">${product.title}</h3>
            ${ratingHtml}
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.5; margin: 0 0 16px 0;">${product.short_description}</p>
            
            ${product.specs && Object.keys(product.specs).length > 0 ? `
              <div style="margin-bottom: 20px;">
                <h4 style="font-size: 0.875rem; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; text-transform: uppercase;">Key Specs</h4>
                <ul style="margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; list-style: none;">
                  ${featuresHTML}
                </ul>
              </div>
            ` : ''}

            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: auto;">
              ${product.price_text ? `
                <div style="font-size: 1.5rem; font-weight: 800; color: #0f172a;">${product.price_text}</div>
              ` : ''}
              <a href="${ctaHref}" target="_blank" rel="noopener noreferrer nofollow" style="display: block; width: 100%; text-align: center; background-color: #ea580c; color: white; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; transition: background-color 0.2s;">
                ${ctaLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
      `;
            parsedContent = parsedContent.replace(originalShortcode, cardHtml);
        } catch (err) {
            console.error(`Failed to load product card for slug ${slug}`, err);
            parsedContent = parsedContent.replace(originalShortcode, '');
        }
    }
    return parsedContent;
}
}),
"[project]/Downloads/ai-blog/app/blog/[slug]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BlogPost,
    "generateMetadata",
    ()=>generateMetadata,
    "generateStaticParams",
    ()=>generateStaticParams
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$articles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/lib/supabase/articles.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$components$2f$blog$2d$post$2d$content$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/components/blog-post-content.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$seo$2f$article$2d$seo$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/lib/seo/article-seo.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$components$2f$seo$2f$structured$2d$data$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/components/seo/structured-data.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$products$2f$embed$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/ai-blog/lib/products/embed.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
async function generateStaticParams() {
    try {
        const slugs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$articles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAllSlugs"])();
        return slugs.map((slug)=>({
                slug: slug
            }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}
async function generateMetadata({ params }) {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug?.replace(/\/$/, '') || resolvedParams.slug;
    if (!slug) {
        return {};
    }
    const article = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$articles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getArticleBySlug"])(slug);
    if (!article) {
        return {};
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$seo$2f$article$2d$seo$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateArticleMetadata"])(article);
}
async function BlogPost({ params }) {
    // Handle both sync and async params (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    // Handle potential trailing slash and normalize slug
    const slug = resolvedParams.slug?.replace(/\/$/, '') || resolvedParams.slug;
    if (!slug) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    }
    const article = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$articles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getArticleBySlug"])(slug);
    if (!article) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    }
    const allArticles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$supabase$2f$articles$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAllArticles"])(true);
    const relatedArticles = allArticles.filter((a)=>a.category === article.category && a.slug !== article.slug).map((a)=>({
            title: a.title,
            slug: a.slug,
            image: a.image_url || "/placeholder.svg",
            category: a.category
        }));
    // Convert Supabase article to BlogPost format
    const parsedContent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$products$2f$embed$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseProductShortcodes"])(article.content);
    const post = {
        title: article.title,
        date: new Date(article.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        author: article.author,
        category: article.category,
        readTime: article.read_time,
        image: article.image_url || "/placeholder.svg",
        content: parsedContent,
        relatedPosts: relatedArticles
    };
    // Generate structured data for SEO
    const articleStructuredData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$seo$2f$article$2d$seo$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateArticleStructuredData"])(article);
    const breadcrumbStructuredData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$seo$2f$article$2d$seo$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateBreadcrumbStructuredData"])(article);
    const organizationStructuredData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$lib$2f$seo$2f$article$2d$seo$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateOrganizationStructuredData"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$components$2f$seo$2f$structured$2d$data$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StructuredData"], {
                data: [
                    articleStructuredData,
                    breadcrumbStructuredData,
                    organizationStructuredData
                ]
            }, void 0, false, {
                fileName: "[project]/Downloads/ai-blog/app/blog/[slug]/page.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$ai$2d$blog$2f$components$2f$blog$2d$post$2d$content$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BlogPostContent"], {
                post: post,
                article: article
            }, void 0, false, {
                fileName: "[project]/Downloads/ai-blog/app/blog/[slug]/page.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/Downloads/ai-blog/app/blog/[slug]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Downloads/ai-blog/app/blog/[slug]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0fa9f9b8._.js.map