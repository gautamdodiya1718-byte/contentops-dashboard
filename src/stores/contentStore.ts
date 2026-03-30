import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ContentPost, ContentStatus, ViewType, QuickFilter, Comment, ActivityEntry, Priority } from '@/lib/types'
import { SAMPLE_DATA } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase'
import * as db from '@/lib/supabaseService'

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
  addComment: (postId: string, author: string, text: string) => void

  // Supabase sync
  initFromSupabase: () => Promise<void>
  refreshPosts: () => Promise<void>
  refreshComments: () => Promise<void>
  refreshActivity: () => Promise<void>
}

const defaultFilters: Filters = {
  status: 'ALL',
  author: '',
  priority: 'ALL',
  cluster: '',
  dateFrom: '',
  dateTo: '',
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      posts: SAMPLE_DATA,
      comments: [],
      activityLog: [],
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

      // --- CRUD with Supabase sync ---

      addPost: (post) => {
        const now = new Date().toISOString().split('T')[0]
        const newPost: ContentPost = { ...post, id: generateId(), createdAt: now, updatedAt: now }
        // Optimistic update
        set((s) => ({ posts: [newPost, ...s.posts] }))
        // Sync to DB
        if (isSupabaseConfigured()) {
          db.insertPost(newPost)
          db.insertActivity(newPost.id, 'Created', 'Current User', '', newPost.title)
        }
        // Local activity log
        const entry: ActivityEntry = { id: crypto.randomUUID(), postId: newPost.id, action: 'Created', performedBy: 'Current User', oldValue: '', newValue: newPost.title, timestamp: new Date().toISOString() }
        set((s) => ({ activityLog: [...s.activityLog, entry] }))
      },

      updatePost: (id, updates) => {
        const now = new Date().toISOString().split('T')[0]
        set((s) => ({ posts: s.posts.map((p) => p.id === id ? { ...p, ...updates, updatedAt: now } : p) }))
        if (isSupabaseConfigured()) {
          db.updatePostDB(id, { ...updates, updatedAt: now })
        }
      },

      deletePost: (id) => {
        set((s) => ({
          posts: s.posts.filter((p) => p.id !== id),
          selectedPostId: s.selectedPostId === id ? null : s.selectedPostId,
        }))
        if (isSupabaseConfigured()) {
          db.deletePostDB(id)
        }
      },

      changeStatus: (id, newStatus) => {
        const post = get().posts.find((p) => p.id === id)
        if (!post || post.status === newStatus) return
        const oldStatus = post.status
        const now = new Date().toISOString().split('T')[0]
        const updates: Partial<ContentPost> = { status: newStatus, updatedAt: now }
        if (newStatus === 'PUBLISHED' && !post.datePublished) updates.datePublished = now
        if (newStatus === 'WRITTEN' && !post.dateWritten) updates.dateWritten = now
        // Optimistic update
        set((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)) }))
        // Activity log
        const entry: ActivityEntry = { id: crypto.randomUUID(), postId: id, action: 'Status changed', performedBy: 'Current User', oldValue: oldStatus, newValue: newStatus, timestamp: new Date().toISOString() }
        set((s) => ({ activityLog: [...s.activityLog, entry] }))
        // Sync to DB
        if (isSupabaseConfigured()) {
          db.updatePostDB(id, updates)
          db.insertActivity(id, 'Status changed', 'Current User', oldStatus, newStatus)
        }
      },

      importPosts: (newPosts) => {
        set((s) => ({ posts: [...newPosts, ...s.posts] }))
        if (isSupabaseConfigured()) {
          db.bulkInsertPosts(newPosts)
        }
      },

      addComment: (postId, author, text) => {
        const comment: Comment = { id: crypto.randomUUID(), postId, author, text, createdAt: new Date().toISOString() }
        set((s) => ({ comments: [...s.comments, comment] }))
        if (isSupabaseConfigured()) {
          db.insertComment(postId, author, text)
        }
      },

      // --- Supabase sync methods ---

      initFromSupabase: async () => {
        if (!isSupabaseConfigured()) {
          set({ isOnline: false })
          return
        }
        set({ isLoading: true })
        try {
          const [posts, comments, activity] = await Promise.all([
            db.fetchAllPosts(),
            db.fetchComments(),
            db.fetchActivityLog(),
          ])
          // Only replace if we got data from Supabase
          if (posts.length > 0) {
            set({ posts, comments, activityLog: activity, isOnline: true, isLoading: false })
          } else {
            // DB is empty — push local data to Supabase
            const localPosts = get().posts
            if (localPosts.length > 0) {
              await db.bulkInsertPosts(localPosts)
            }
            set({ isOnline: true, isLoading: false })
          }
        } catch (err) {
          console.error('Supabase init failed:', err)
          set({ isOnline: false, isLoading: false })
        }
      },

      refreshPosts: async () => {
        if (!isSupabaseConfigured()) return
        const posts = await db.fetchAllPosts()
        if (posts.length > 0) set({ posts })
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
        posts: state.posts,
        comments: state.comments,
        activityLog: state.activityLog,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
)
