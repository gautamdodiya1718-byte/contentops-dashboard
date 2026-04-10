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
import { UserSetupModal } from '@/components/modals/UserSetupModal'
import { ToastContainer } from '@/components/ui/Toast'
import { useContentStore } from '@/stores/contentStore'
import { useToastStore } from '@/stores/toastStore'
import { isSupabaseConfigured } from '@/lib/supabase'
import { subscribeToChanges } from '@/lib/supabaseService'
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'

export default function App() {
  const activeView = useContentStore((s) => s.activeView)
  const isDarkMode = useContentStore((s) => s.isDarkMode)
  const selectedPostId = useContentStore((s) => s.selectedPostId)
  const isLoading = useContentStore((s) => s.isLoading)
  const isOnline = useContentStore((s) => s.isOnline)
  const isInitialized = useContentStore((s) => s.isInitialized)
  const lastSyncedAt = useContentStore((s) => s.lastSyncedAt)
  const initFromSupabase = useContentStore((s) => s.initFromSupabase)
  const refreshPosts = useContentStore((s) => s.refreshPosts)
  const refreshComments = useContentStore((s) => s.refreshComments)
  const refreshActivity = useContentStore((s) => s.refreshActivity)
  const addToast = useToastStore((s) => s.addToast)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    initFromSupabase()
  }, [initFromSupabase])

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    const unsubscribe = subscribeToChanges({
      onPostChange: () => {
        addToast({
          message: 'Content updated by another user',
          type: 'info',
          action: {
            label: 'Reload data',
            onClick: () => {
              refreshPosts()
              refreshComments()
              refreshActivity()
            },
          },
        })
      },
      onCommentChange: () => refreshComments(),
      onActivityChange: () => refreshActivity(),
    })
    return unsubscribe
  }, [refreshPosts, refreshComments, refreshActivity, addToast])

  const lastSyncedLabel = lastSyncedAt
    ? `Last synced ${formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}`
    : null

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <UserSetupModal />
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <div className="flex-1 overflow-auto p-3 md:p-6">
          <div className="max-w-[1600px] mx-auto space-y-4">
            {/* Connection status */}
            {isSupabaseConfigured() && (
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${isOnline ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {isLoading ? 'Syncing...' : isOnline ? 'Connected' : 'Offline'}
                </div>
                {lastSyncedLabel && (
                  <span className="text-xs text-muted-foreground">{lastSyncedLabel}</span>
                )}
              </div>
            )}

            {/* Loading state — before first Supabase fetch */}
            {!isInitialized && isSupabaseConfigured() ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 size={32} className="text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading content from database...</p>
              </div>
            ) : (
              <>
                <StatsBar />
                <FilterPanel />
                {activeView === 'table' && <ContentTable />}
                {activeView === 'kanban' && <KanbanBoard />}
                {activeView === 'calendar' && <CalendarView />}
              </>
            )}
          </div>
        </div>
      </main>

      {selectedPostId && <RowDetailModal />}
      <AddEditModal />
      <ImportModal />
      <ExportModal />
      <ToastContainer />
    </div>
  )
}
