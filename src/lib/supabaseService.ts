import { supabase, isSupabaseConfigured } from './supabase'
import type { ContentPost, Comment, ActivityEntry } from './types'

// Convert DB snake_case row to camelCase ContentPost
function rowToPost(row: Record<string, unknown>): ContentPost {
  return {
    id: row.id as string,
    title: row.title as string,
    primaryKeyword: (row.primary_keyword as string) || '',
    searchVolume: (row.search_volume as string) || '',
    keywordDifficulty: (row.keyword_difficulty as number) || 0,
    metaTitle: (row.meta_title as string) || '',
    metaDescription: (row.meta_description as string) || '',
    urlSlug: (row.url_slug as string) || '',
    dateWritten: (row.date_written as string) || '',
    datePublished: (row.date_published as string) || '',
    author: (row.author as string) || '',
    status: (row.status as ContentPost['status']) || 'IDEA',
    priority: (row.priority as ContentPost['priority']) || 'Medium',
    dueDate: (row.due_date as string) || '',
    contentCluster: (row.content_cluster as string) || '',
    reviewer: (row.reviewer as string) || '',
    wordCount: (row.word_count as number) || 0,
    wordCountTarget: (row.word_count_target as number) || 2000,
    draftUrl: (row.draft_url as string) || '',
    liveUrl: (row.live_url as string) || '',
    notes: (row.notes as string) || '',
    createdAt: (row.created_at as string) || '',
    updatedAt: (row.updated_at as string) || '',
  }
}

// Convert camelCase ContentPost to DB snake_case
function postToRow(post: Partial<ContentPost>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (post.id !== undefined) row.id = post.id
  if (post.title !== undefined) row.title = post.title
  if (post.primaryKeyword !== undefined) row.primary_keyword = post.primaryKeyword
  if (post.searchVolume !== undefined) row.search_volume = post.searchVolume
  if (post.keywordDifficulty !== undefined) row.keyword_difficulty = post.keywordDifficulty
  if (post.metaTitle !== undefined) row.meta_title = post.metaTitle
  if (post.metaDescription !== undefined) row.meta_description = post.metaDescription
  if (post.urlSlug !== undefined) row.url_slug = post.urlSlug
  if (post.dateWritten !== undefined) row.date_written = post.dateWritten || null
  if (post.datePublished !== undefined) row.date_published = post.datePublished || null
  if (post.author !== undefined) row.author = post.author
  if (post.status !== undefined) row.status = post.status
  if (post.priority !== undefined) row.priority = post.priority
  if (post.dueDate !== undefined) row.due_date = post.dueDate || null
  if (post.contentCluster !== undefined) row.content_cluster = post.contentCluster
  if (post.reviewer !== undefined) row.reviewer = post.reviewer
  if (post.wordCount !== undefined) row.word_count = post.wordCount
  if (post.wordCountTarget !== undefined) row.word_count_target = post.wordCountTarget
  if (post.draftUrl !== undefined) row.draft_url = post.draftUrl
  if (post.liveUrl !== undefined) row.live_url = post.liveUrl
  if (post.notes !== undefined) row.notes = post.notes
  return row
}

function rowToComment(row: Record<string, unknown>): Comment {
  return {
    id: row.id as string,
    postId: row.post_id as string,
    author: row.author as string,
    text: row.comment_text as string,
    createdAt: row.created_at as string,
  }
}

function rowToActivity(row: Record<string, unknown>): ActivityEntry {
  return {
    id: row.id as string,
    postId: row.post_id as string,
    action: row.action as string,
    performedBy: row.performed_by as string,
    oldValue: (row.old_value as string) || '',
    newValue: (row.new_value as string) || '',
    timestamp: row.created_at as string,
  }
}

// --- POSTS ---

export async function fetchAllPosts(): Promise<ContentPost[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase
    .from('content_posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchAllPosts error:', error); return [] }
  return (data || []).map(rowToPost)
}

export async function insertPost(post: ContentPost): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const { error } = await supabase.from('content_posts').insert(postToRow(post))
  if (error) { console.error('insertPost error:', error); return false }
  return true
}

export async function updatePostDB(id: string, updates: Partial<ContentPost>): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const { error } = await supabase.from('content_posts').update(postToRow(updates)).eq('id', id)
  if (error) { console.error('updatePost error:', error); return false }
  return true
}

export async function deletePostDB(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const { error } = await supabase.from('content_posts').delete().eq('id', id)
  if (error) { console.error('deletePost error:', error); return false }
  return true
}

export async function bulkInsertPosts(posts: ContentPost[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const rows = posts.map(p => postToRow(p))
  const { error } = await supabase.from('content_posts').insert(rows)
  if (error) { console.error('bulkInsertPosts error:', error); return false }
  return true
}

// --- COMMENTS ---

export async function fetchComments(): Promise<Comment[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase
    .from('content_comments')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error('fetchComments error:', error); return [] }
  return (data || []).map(rowToComment)
}

export async function insertComment(postId: string, author: string, text: string): Promise<Comment | null> {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await supabase
    .from('content_comments')
    .insert({ post_id: postId, author, comment_text: text })
    .select()
    .single()
  if (error) { console.error('insertComment error:', error); return null }
  return rowToComment(data)
}

// --- ACTIVITY LOG ---

export async function fetchActivityLog(): Promise<ActivityEntry[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error('fetchActivityLog error:', error); return [] }
  return (data || []).map(rowToActivity)
}

export async function insertActivity(postId: string, action: string, performedBy: string, oldValue: string, newValue: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const { error } = await supabase
    .from('activity_log')
    .insert({ post_id: postId, action, performed_by: performedBy, old_value: oldValue, new_value: newValue })
  if (error) { console.error('insertActivity error:', error); return false }
  return true
}

// --- REALTIME ---

export function subscribeToChanges(callbacks: {
  onPostChange: () => void
  onCommentChange: () => void
  onActivityChange: () => void
}) {
  if (!isSupabaseConfigured()) return () => {}

  const channel = supabase
    .channel('contentops-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'content_posts' }, () => {
      callbacks.onPostChange()
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'content_comments' }, () => {
      callbacks.onCommentChange()
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, () => {
      callbacks.onActivityChange()
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
