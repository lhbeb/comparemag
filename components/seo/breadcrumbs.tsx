import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex items-center space-x-2 text-sm text-gray-600" itemScope itemType="https://schema.org/BreadcrumbList">
        <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link 
            href="/" 
            className="hover:text-accent transition-colors flex items-center text-gray-700"
            itemProp="item"
          >
            <Home className="h-4 w-4 mr-1" />
            <span itemProp="name">Home</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>
        
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            <Link 
              href={item.href}
              className="hover:text-accent transition-colors text-gray-700"
              itemProp="item"
            >
              <span itemProp="name">{item.label}</span>
            </Link>
            <meta itemProp="position" content={String(index + 2)} />
          </li>
        ))}
      </ol>
    </nav>
  )
}
