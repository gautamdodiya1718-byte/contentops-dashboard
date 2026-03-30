import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { StatsBar } from '@/components/layout/StatsBar'
import { ContentTable } from '@/components/table/ContentTable'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { CalendarView } from '@/components/calendar/CalendarView'
import { RowDetailModal } from '@/components/modals/RowDetailModal'
import { AddEditModal } from '@/components/modals/AddEditModal'
import { ImportModal } from '@/components/modals/ImportModal'
import { ExportModal } from '@/components/modals/ExportModal'
import { FilterPanel } from '@/components/modals/FilterPanel'
import { useContentStore } from '@/stores/contentStore'
import { isSupabaseConfigured } from '@/lib/supabase'
import { subscribeToChanges } from '@/lib/supabaseService'

export default function App() {
  const activeView = useContentStore((s) => s.activeView)
  const isDarkMode = useContentStore((s) => s.isDarkMode)
  const selectedPostId = useContentStore((s) => s.selectedPostId)
  const isLoading = useContentStore((s) => s.isLoading)
  const isOnline = useContentStore((s) => s.isOnline)
  const initFromSupabase = useContentStore((s) => s.initFromSupabase)
  const refreshPosts = useContentStore((s) => s.refreshPosts)
  const refreshComments = useContentStore((s) => s.refreshComments)
  const refreshActivity = useContentStore((s) => s.refreshActivity)

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  // Initialize Supabase data on mount
  useEffect(() => {
    initFromSupabase()
  }, [initFromSupabase])

  // Set up realtime subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const unsubscribe = subscribeToChanges({
      onPostChange: () => refreshPosts(),
      onCommentChange: () => refreshComments(),
      onActivityChange: () => refreshActivity(),
    })

    return unsubscribe
  }, [refreshPosts, refreshComments, refreshActivity])

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-4">
            {/* Connection status indicator */}
            {isSupabaseConfigured() && (
              <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg w-fit ${isOnline ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {isLoading ? 'Syncing...' : isOnline ? 'Connected to Supabase' : 'Offline — using local data'}
              </div>
            )}

            <StatsBar />
            <FilterPanel />

            {activeView === 'table' && <ContentTable />}
            {activeView === 'kanban' && <KanbanBoard />}
            {activeView === 'calendar' && <CalendarView />}
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedPostId && <RowDetailModal />}
      <AddEditModal />
      <ImportModal />
      <ExportModal />
    </div>
  )
}
