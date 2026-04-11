export interface Database {
  public: {
    Tables: {
      writers: {
        Row: {
          id: string
          slug: string
          name: string
          specialty: string | null
          bio: string | null
          bio_html: string | null
          avatar_url: string | null
          email: string | null
          website: string | null
          twitter_handle: string | null
          linkedin_url: string | null
          github_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          specialty?: string | null
          bio?: string | null
          bio_html?: string | null
          avatar_url?: string | null
          email?: string | null
          website?: string | null
          twitter_handle?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          specialty?: string | null
          bio?: string | null
          bio_html?: string | null
          avatar_url?: string | null
          email?: string | null
          website?: string | null
          twitter_handle?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          author: string
          category: string
          image_url: string | null
          read_time: string
          published: boolean
          created_at: string
          updated_at: string
          published_at: string | null
          meta_description: string | null
          meta_keywords: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          generation_status: string | null
          programmatic_data: any | null
          programmatic_key: string | null
          programmatic_template: string | null
          seo_score: number | null
          twitter_card: string | null
        }
        Insert: {
          article_type?: string | null
          author: string
          canonical_url?: string | null
          category: string
          content: string
          created_at?: string
          focus_keyword?: string | null
          generation_status?: string | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          programmatic_data?: any | null
          programmatic_key?: string | null
          programmatic_template?: string | null
          published?: boolean
          published_at?: string | null
          read_time?: string
          seo_score?: number | null
          slug: string
          title: string
          twitter_card?: string | null
          updated_at?: string
        }
        Update: {
          article_type?: string | null
          author?: string
          canonical_url?: string | null
          category?: string
          content?: string
          created_at?: string
          focus_keyword?: string | null
          generation_status?: string | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          programmatic_data?: any | null
          programmatic_key?: string | null
          programmatic_template?: string | null
          published?: boolean
          published_at?: string | null
          read_time?: string
          seo_score?: number | null
          slug?: string
          title?: string
          twitter_card?: string | null
          updated_at?: string
        }
      }
      product_cards: {
        Row: {
          id: string
          slug: string
          title: string
          brand: string | null
          image_url: string | null
          short_description: string
          cta_label: string | null
          external_url: string
          price_text: string | null
          rating_text: string | null
          badge_text: string | null
          specs: any | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          brand?: string | null
          image_url?: string | null
          short_description: string
          cta_label?: string | null
          external_url: string
          price_text?: string | null
          rating_text?: string | null
          badge_text?: string | null
          specs?: any | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          brand?: string | null
          image_url?: string | null
          short_description?: string
          cta_label?: string | null
          external_url?: string
          price_text?: string | null
          rating_text?: string | null
          badge_text?: string | null
          specs?: any | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Storage: {
      buckets: {
        article_images: {
          id: 'article_images'
          name: 'article_images'
          public: true
        }
      }
    }
  }
}

export type Writer = Database['public']['Tables']['writers']['Row']
export type WriterInsert = Database['public']['Tables']['writers']['Insert']
export type WriterUpdate = Database['public']['Tables']['writers']['Update']

export type Article = Database['public']['Tables']['articles']['Row']
export type ArticleInsert = Database['public']['Tables']['articles']['Insert']
export type ArticleUpdate = Database['public']['Tables']['articles']['Update']

export type ProductCard = Database['public']['Tables']['product_cards']['Row']
export type ProductCardInsert = Database['public']['Tables']['product_cards']['Insert']
export type ProductCardUpdate = Database['public']['Tables']['product_cards']['Update']
