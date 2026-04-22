'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText, Users, Home, LayoutDashboard,
  PlusCircle, ChevronRight, ArrowUpRight, Newspaper, ShoppingBag, Wand2, LogOut, Database, Eye
} from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import './admin.css'

const navGroups = [
  {
    groupLabel: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        children: [],
      },
    ],
  },
  {
    groupLabel: 'Content Operations',
    items: [
      {
        label: 'Manual Articles',
        href: '/admin/articles',
        icon: Newspaper,
        children: [
          { label: 'All Articles', href: '/admin/articles' },
          { label: 'New Article', href: '/admin/articles/new', icon: PlusCircle },
        ],
      },
    ],
  },
  {
    groupLabel: 'Database',
    items: [
      {
        label: 'Products',
        href: '/admin/products',
        icon: ShoppingBag,
        children: [
          { label: 'All Products', href: '/admin/products' },
          { label: 'New Product', href: '/admin/products/new', icon: PlusCircle },
        ],
      },
    ],
  },
  {
    groupLabel: 'Team',
    items: [
      {
        label: 'Editors',
        href: '/admin/writers',
        icon: Users,
        children: [
          { label: 'All Editors', href: '/admin/writers' },
          { label: 'Add Editor', href: '/admin/writers/new', icon: PlusCircle },
        ],
      },
    ],
  },
  {
    groupLabel: 'Growth & Operations',
    items: [
      {
        label: 'Programmatic SEO',
        href: '/admin/programmatic',
        icon: Wand2,
        children: [
          { label: 'Templates', href: '/admin/programmatic/templates' },
          { label: 'Generated Pages', href: '/admin/programmatic/generated-pages' },
          { label: 'Bulk Generate', href: '/admin/programmatic/new' },
        ],
      },
      {
        label: 'Imports & Exports',
        href: '/admin/imports-exports',
        icon: Database,
        children: [
          { label: 'Import Products', href: '/admin/imports-exports/import-products', icon: PlusCircle },
          { label: 'Export Data', href: '/admin/imports-exports/export-data' },
        ],
      },
    ],
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isProductEditorPage =
    pathname === '/admin/products/new' || pathname.startsWith('/admin/products/edit/')
  const isArticlesIndexPage = pathname === '/admin/articles'
  const currentArticleSlug = pathname.startsWith('/admin/articles/edit/')
    ? pathname.split('/').pop()
    : null

  const contentMaxWidth = isProductEditorPage ? 1240 : isArticlesIndexPage ? 1560 : 960
  const contentPaddingClass = isProductEditorPage
    ? 'flex-1 px-4 py-4 lg:px-5 lg:py-4'
    : isArticlesIndexPage
      ? 'flex-1 px-5 py-8 xl:px-8'
      : 'flex-1 px-8 py-8'

  const isGroupActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin' 
    if (href === '/admin/articles') return pathname.startsWith('/admin/articles')
    return pathname.startsWith(href)
  }

  const isChildActive = (href: string) => pathname === href

  if (pathname === '/admin/login') {
    return (
      <div className="admin-page flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" style={{ fontFamily: 'var(--font-monument), sans-serif' }}>
        {children}
      </div>
    )
  }

  return (
    <div className="admin-page flex min-h-screen" style={{ background: 'var(--content-bg)' }}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-30"
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-5 h-16 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--admin-primary)' }}
          >
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate" style={{ color: '#F1F5F9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              CompareMag
            </p>
            <p className="text-xs leading-tight" style={{ color: 'var(--sidebar-section)' }}>
              Admin Dashboard
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.groupLabel}>
              {/* Group label */}
              <p
                className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--sidebar-section)' }}
              >
                {group.groupLabel}
              </p>

              {group.items.map((item) => {
                const Icon = item.icon
                const active = isGroupActive(item.href)
                return (
                  <div key={item.href} className="mb-0.5">
                    {/* Parent row */}
                    <Link
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                      style={{
                        color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                        background: active ? 'rgba(29,78,216,0.18)' : 'transparent',
                      }}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </Link>

                    {/* Children */}
                    <div className="mt-0.5 space-y-0.5 pl-3">
                      {item.children.map((child) => {
                        const childActive = isChildActive(child.href)
                        const ChildIcon = child.icon || ChevronRight
                        const isActionChild = Boolean(child.icon)
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 relative group"
                            style={{
                              color: childActive ? '#FFFFFF' : 'var(--sidebar-text)',
                              background: childActive ? 'var(--admin-primary)' : 'transparent',
                              fontWeight: childActive ? 600 : 400,
                            }}
                          >
                            {/* Active indicator line */}
                            {childActive && (
                              <span
                                className="absolute left-0 inset-y-1 w-0.5 rounded-full"
                                style={{ background: '#60A5FA' }}
                              />
                            )}
                            {isActionChild ? (
                              <span
                                className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md border"
                                style={{
                                  background: childActive ? 'rgba(255,255,255,0.18)' : 'rgba(251, 146, 60, 0.18)',
                                  borderColor: childActive ? 'rgba(255,255,255,0.22)' : 'rgba(251, 146, 60, 0.28)',
                                  color: childActive ? '#FFFFFF' : '#FDBA74',
                                }}
                              >
                                <ChildIcon className="h-2.5 w-2.5" />
                              </span>
                            ) : (
                              <ChildIcon
                                className="h-3 w-3 flex-shrink-0"
                                style={{ opacity: childActive ? 1 : 0.4 }}
                              />
                            )}
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div
          className="px-3 py-4 space-y-1"
          style={{ borderTop: '1px solid var(--sidebar-border)' }}
        >
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors group"
              style={{ color: '#EF4444' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <span className="flex items-center gap-2 font-medium">
                <LogOut className="h-4 w-4" />
                Secure Logout
              </span>
            </button>
          </form>
          <Link
            href="/"
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors group"
            style={{ color: 'var(--sidebar-text)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--sidebar-text-hover)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--sidebar-text)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <span className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Site
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
          </Link>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      {/* Offset by sidebar width (w-60 = 240px) */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: 240 }}>

        {/* Top bar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-8 h-14 flex-shrink-0"
          style={{
            background: 'rgba(248, 250, 252, 0.9)',
            borderBottom: '1px solid var(--content-border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Breadcrumb / current section */}
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--content-text-secondary)' }}>
            <LayoutDashboard className="h-4 w-4" />
            <span style={{ color: 'var(--content-border)' }}>/</span>
            <span style={{ color: 'var(--content-text)', fontWeight: 600 }}>
              {pathname === '/admin' ? 'Dashboard Overview'
                : pathname === '/admin/articles' ? 'Articles'
                : pathname === '/admin/articles/new' ? 'New Article'
                : pathname.startsWith('/admin/articles/edit') ? 'Edit Article'
                : pathname.startsWith('/admin/products/new') ? 'New Product Card'
                : pathname.startsWith('/admin/products/edit') ? 'Edit Product Card'
                : pathname.startsWith('/admin/products') ? 'Product Cards'
                : pathname.startsWith('/admin/programmatic/new') ? 'Generate Programmatic Article'
                : pathname.startsWith('/admin/writers/new') ? 'Add Editor'
                : pathname.startsWith('/admin/writers/edit') ? 'Edit Editor'
                : pathname.startsWith('/admin/writers') ? 'Editors'
                : 'Admin'}
            </span>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            {pathname.startsWith('/admin/articles/edit/') && currentArticleSlug ? (
              <Link
                href={`/blog/${currentArticleSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-700 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                View Article
              </Link>
            ) : pathname === '/admin/articles/new' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200">
                Save article to view it
              </span>
            ) : null}
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors mr-2"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              New Product
            </Link>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: 'var(--admin-primary)' }}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              New Article
            </Link>
          </div>
        </div>

        {/* Page content — centered with max-width */}
        <main className={contentPaddingClass}>
          <div className="mx-auto w-full" style={{ maxWidth: contentMaxWidth }}>
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
