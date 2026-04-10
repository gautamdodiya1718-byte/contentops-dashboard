import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ContentPost, ContentStatus, ViewType, QuickFilter, Comment, ActivityEntry, Priority } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase'
import * as db from '@/lib/supabaseService'

export interface CurrentUser {
  name: string
  role: 'writer' | 'editor' | 'publisher' | 'seo' | 'marketer' | 'admin'
}

interface Filters {
  status: ContentStatus | 'ALL'
  author: string
  priority: Priority | 'ALL'
  cluster: string
  dateFrom: string
  dateTo: string
}

interface ContentStore {
  posts: ContentPost[]
  comments: Comment[]
  activityLog: ActivityEntry[]
  currentUser: CurrentUser | null

  activeView: ViewType
  quickFilter: QuickFilter
  searchTerm: string
  isDarkMode: boolean
  selectedPostId: string | null
  isAddModalOpen: boolean
  isEditModalOpen: boolean
  isImportModalOpen: boolean
  isExportModalOpen: boolean
  isFilterOpen: boolean
  editingPost: ContentPost | null
  filters: Filters
  isLoading: boolean
  isOnline: boolean
  isInitialized: boolean
  lastSyncedAt: string | null

  // Multi-select
  selectedRowIds: string[]
  toggleRowSelection: (id: string) => void
  toggleAllRows: (ids: string[]) => void
  clearSelection: () => void
  bulkDeletePosts: (ids: string[]) => void

  setCurrentUser: (user: CurrentUser) => void
  clearCurrentUser: () => void
  setActiveView: (view: ViewType) => void
  setQuickFilter: (filter: QuickFilter) => void
  setSearchTerm: (term: string) => void
  toggleDarkMode: () => void
  setSelectedPostId: (id: string | null) => void
  setAddModalOpen: (open: boolean) => void
  setEditModalOpen: (open: boolean) => void
  setImportModalOpen: (open: boolean) => void
  setExportModalOpen: (open: boolean) => void
  setFilterOpen: (open: boolean) => void
  setEditingPost: (post: ContentPost | null) => void
  setFilters: (filters: Partial<Filters>) => void
  resetFilters: () => void

  addPost: (post: Omit<ContentPost, 'id' | 'createdAt' | 'updatedAt'>) => void
  updatePost: (id: string, updates: Partial<ContentPost>) => void
  deletePost: (id: string) => void
  changeStatus: (id: string, newStatus: ContentStatus) => void
  importPosts: (posts: ContentPost[]) => void
  addComment: (postId: string, text: string) => void

  initFromSupabase: () => Promise<void>
  refreshPosts: () => Promise<void>
  refreshComments: () => Promise<void>
  refreshActivity: () => Promise<void>
}

const defaultFilters: Filters = {
  status: 'ALL', author: '', priority: 'ALL', cluster: '', dateFrom: '', dateTo: '',
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      // Data — start EMPTY, Supabase is the source of truth
      posts: [],
      comments: [],
      activityLog: [],
      currentUser: null,

      activeView: 'table' as ViewType,
      quickFilter: 'all' as QuickFilter,
      searchTerm: '',
      isDarkMode: false,
      selectedPostId: null,
      isAddModalOpen: false,
      isEditModalOpen: false,
      isImportModalOpen: false,
      isExportModalOpen: false,
      isFilterOpen: false,
      editingPost: null,
      filters: defaultFilters,
      isLoading: false,
      isOnline: false,
      isInitialized: false,
      lastSyncedAt: null,

      // Multi-select
      selectedRowIds: [],
      toggleRowSelection: (id) => set((s) => {
        const exists = s.selectedRowIds.includes(id)
        return { selectedRowIds: exists ? s.selectedRowIds.filter(r => r !== id) : [...s.selectedRowIds, id] }
      }),
      toggleAllRows: (ids) => set((s) => {
        const allSelected = ids.every(id => s.selectedRowIds.includes(id))
        return { selectedRowIds: allSelected ? [] : [...ids] }
      }),
      clearSelection: () => set({ selectedRowIds: [] }),
      bulkDeletePosts: (ids) => {
        const userName = get().currentUser?.name || 'Unknown'
        set((s) => ({
          posts: s.posts.filter(p => !ids.includes(p.id)),
          selectedRowIds: [],
          selectedPostId: ids.includes(s.selectedPostId || '') ? null : s.selectedPostId,
        }))
        if (isSupabaseConfigured()) {
          db.bulkDeletePostsDB(ids)
          ids.forEach(id => db.insertActivity(id, 'Deleted', userName, '', ''))
        }
      },

      setCurrentUser: (user) => set({ currentUser: user }),
      clearCurrentUser: () => set({ currentUser: null }),
      setActiveView: (view) => set({ activeView: view }),
      setQuickFilter: (filter) => set({ quickFilter: filter }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      toggleDarkMode: () => set((s) => {
        const newMode = !s.isDarkMode
        document.documentElement.classList.toggle('dark', newMode)
        return { isDarkMode: newMode }
      }),
      setSelectedPostId: (id) => set({ selectedPostId: id }),
      setAddModalOpen: (open) => set({ isAddModalOpen: open }),
      setEditModalOpen: (open) => set({ isEditModalOpen: open }),
      setImportModalOpen: (open) => set({ isImportModalOpen: open }),
      setExportModalOpen: (open) => set({ isExportModalOpen: open }),
      setFilterOpen: (open) => set({ isFilterOpen: open }),
      setEditingPost: (post) => set({ editingPost: post }),
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      resetFilters: () => set({ filters: defaultFilters }),

      // --- CRUD ---

      addPost: (post) => {
        const userName = get().currentUser?.name || 'Unknown'
        const now = new Date().toISOString().split('T')[0]
        const newPost: ContentPost = { ...post, id: generateId(), createdAt: now, updatedAt: now }
        set((s) => ({ posts: [newPost, ...s.posts] }))
        const entry: ActivityEntry = { id: crypto.randomUUID(), postId: newPost.id, action: 'Created', performedBy: userName, oldValue: '', newValue: newPost.title, timestamp: new Date().toISOString() }
        set((s) => ({ activityLog: [...s.activityLog, entry] }))
        if (isSupabaseConfigured()) {
          db.insertPost(newPost)
          db.insertActivity(newPost.id, 'Created', userName, '', newPost.title)
        }
      },

      updatePost: (id, updates) => {
        const now = new Date().toISOString().split('T')[0]
        set((s) => ({ posts: s.posts.map((p) => p.id === id ? { ...p, ...updates, updatedAt: now } : p) }))
        if (isSupabaseConfigured()) { db.updatePostDB(id, { ...updates, updatedAt: now }) }
      },

      deletePost: (id) => {
        set((s) => ({
          posts: s.posts.filter((p) => p.id !== id),
          selectedPostId: s.selectedPostId === id ? null : s.selectedPostId,
        }))
        if (isSupabaseConfigured()) { db.deletePostDB(id) }
      },

      changeStatus: (id, newStatus) => {
        const post = get().posts.find((p) => p.id === id)
        if (!post || post.status === newStatus) return
        const userName = get().currentUser?.name || 'Unknown'
        const oldStatus = post.status
        const now = new Date().toISOString().split('T')[0]
        const updates: Partial<ContentPost> = { status: newStatus, updatedAt: now }
        if (newStatus === 'PUBLISHED' && !post.datePublished) updates.datePublished = now
        if (newStatus === 'WRITTEN' && !post.dateWritten) updates.dateWritten = now
        set((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)) }))
        const entry: ActivityEntry = { id: crypto.randomUUID(), postId: id, action: 'Status changed', performedBy: userName, oldValue: oldStatus, newValue: newStatus, timestamp: new Date().toISOString() }
        set((s) => ({ activityLog: [...s.activityLog, entry] }))
        if (isSupabaseConfigured()) {
          db.updatePostDB(id, updates)
          db.insertActivity(id, 'Status changed', userName, oldStatus, newStatus)
        }
      },

      importPosts: (newPosts) => {
        set((s) => ({ posts: [...newPosts, ...s.posts] }))
        if (isSupabaseConfigured()) {
          db.bulkInsertPosts(newPosts).then(ok => { if (ok) get().refreshPosts() })
        }
      },

      addComment: (postId, text) => {
        const userName = get().currentUser?.name || 'Unknown'
        const comment: Comment = { id: crypto.randomUUID(), postId, author: userName, text, createdAt: new Date().toISOString() }
        set((s) => ({ comments: [...s.comments, comment] }))
        if (isSupabaseConfigured()) { db.insertComment(postId, userName, text) }
      },

      // --- Supabase sync ---

      initFromSupabase: async () => {
        if (!isSupabaseConfigured()) {
          set({ isOnline: false, isInitialized: true })
          return
        }
        set({ isLoading: true })
        try {
          // Clean up expired posts first
          const cleanedCount = await db.deleteExpiredPosts(14)
          if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} posts older than 14 days`)
          }

          const [posts, comments, activity] = await Promise.all([
            db.fetchAllPosts(), db.fetchComments(), db.fetchActivityLog(),
          ])
          // Always set what Supabase returns — even if empty
          set({
            posts,
            comments,
            activityLog: activity,
            isOnline: true,
            isLoading: false,
            isInitialized: true,
            lastSyncedAt: new Date().toISOString(),
          })
        } catch (err) {
          console.error('Supabase init failed:', err)
          set({ isOnline: false, isLoading: false, isInitialized: true })
        }
      },

      refreshPosts: async () => {
        if (!isSupabaseConfigured()) return
        const posts = await db.fetchAllPosts()
        set({ posts, lastSyncedAt: new Date().toISOString() })
      },
      refreshComments: async () => {
        if (!isSupabaseConfigured()) return
        const comments = await db.fetchComments()
        set({ comments })
      },
      refreshActivity: async () => {
        if (!isSupabaseConfigured()) return
        const activityLog = await db.fetchActivityLog()
        set({ activityLog })
      },
    }),
    {
      name: 'contentops-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
)
