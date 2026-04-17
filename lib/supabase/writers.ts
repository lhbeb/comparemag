import 'server-only'
import { createClient } from './server'
import type { Writer, WriterInsert, WriterUpdate } from './types'

export async function getAllWriters(includeDeleted = false) {
  const supabase = await createClient()
  
  let query = supabase
    .from('writers')
    .select('*')
  
  if (!includeDeleted) {
    query = query.is('deleted_at', null)
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch writers: ${error.message}`)
  }

  return data as Writer[]
}

export async function getWriterBySlug(slug: string, includeDeleted = false) {
  const supabase = await createClient()
  
  let query = supabase
    .from('writers')
    .select('*')
    .eq('slug', slug)
  
  if (!includeDeleted) {
    query = query.is('deleted_at', null)
  }

  const { data, error } = await query.single()

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
    .update({ deleted_at: new Date().toISOString() })
    .eq('slug', slug)

  if (error) {
    throw new Error(`Failed to soft delete writer: ${error.message}`)
  }
}

export async function restoreWriter(slug: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('writers')
    .update({ deleted_at: null })
    .eq('slug', slug)

  if (error) {
    throw new Error(`Failed to restore writer: ${error.message}`)
  }
}

