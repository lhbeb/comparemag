import 'server-only'
import { createClient } from './server'
import type { Writer, WriterInsert, WriterUpdate } from './types'

export async function getAllWriters() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('writers')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch writers: ${error.message}`)
  }

  return data as Writer[]
}

export async function getWriterBySlug(slug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('writers')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    throw new Error(`Failed to fetch writer: ${error.message}`)
  }

  return data as Writer
}

export async function createWriter(writer: WriterInsert) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('writers')
    .insert(writer)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create writer: ${error.message}`)
  }

  return data as Writer
}

export async function updateWriter(slug: string, updates: WriterUpdate) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('writers')
    .update(updates)
    .eq('slug', slug)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update writer: ${error.message}`)
  }

  return data as Writer
}

export async function deleteWriter(slug: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('writers')
    .delete()
    .eq('slug', slug)

  if (error) {
    throw new Error(`Failed to delete writer: ${error.message}`)
  }
}

