import { Activity, LayoutDashboard, KanbanSquare, Calendar, Users, Eye, CheckCircle2, LogOut, X } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useContentStore } from '@/stores/contentStore'

const ROLE_LABELS: Record<string, string> = {
  writer: 'Content Writer',
  editor: 'Editor',
  publisher: 'Publisher',
  seo: 'SEO Lead',
  marketer: 'Marketer',
  admin: 'Admin',
}

export function Sidebar() {
  const activeView = useContentStore((s) => s.activeView)
  const setActiveView = useContentStore((s) => s.setActiveView)
  const quickFilter = useContentStore((s) => s.quickFilter)
  const setQuickFilter = useContentStore((s) => s.setQuickFilter)
  const currentUser = useContentStore((s) => s.currentUser)
  const clearCurrentUser = useContentStore((s) => s.clearCurrentUser)
  const isMobileSidebarOpen = useContentStore((s) => s.isMobileSidebarOpen)
  const setMobileSidebarOpen = useContentStore((s) => s.setMobileSidebarOpen)

  const sidebarContent = (
    <>
      <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-2 text-primary font-bold text-lg md:text-xl tracking-tight">
          <Activity className="w-5 h-5 md:w-6 md:h-6" />
          ContentOps
        </div>
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="p-1 text-muted-foreground hover:text-foreground md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-3 md:p-4 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Views</div>
        <nav className="space-y-1">
          <ViewItem icon={<LayoutDashboard size={18} />} label="Table View" active={activeView === 'table'} onClick={() => setActiveView('table')} />
          <ViewItem icon={<KanbanSquare size={18} />} label="Kanban Board" active={activeView === 'kanban'} onClick={() => setActiveView('kanban')} />
          <ViewItem icon={<Calendar size={18} />} label="Calendar" active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} />
        </nav>

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 md:mt-8 mb-3 px-2">Quick Filters</div>
        <nav className="space-y-1">
          <ViewItem icon={<Users size={18} />} label="My Queue" active={quickFilter === 'my-queue'} onClick={() => { setQuickFilter(quickFilter === 'my-queue' ? 'all' : 'my-queue'); setMobileSidebarOpen(false) }} />
          <ViewItem icon={<Eye size={18} />} label="Needs Review" active={quickFilter === 'needs-review'} onClick={() => { setQuickFilter(quickFilter === 'needs-review' ? 'all' : 'needs-review'); setMobileSidebarOpen(false) }} />
          <ViewItem icon={<CheckCircle2 size={18} />} label="Approved" active={quickFilter === 'approved'} onClick={() => { setQuickFilter(quickFilter === 'approved' ? 'all' : 'approved'); setMobileSidebarOpen(false) }} />
        </nav>
      </div>

      {currentUser && (
        <div className="p-3 md:p-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {getInitials(currentUser.name)}
            </div>
            <div className="text-sm flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[currentUser.role] || currentUser.role}</p>
            </div>
            <button
              onClick={clearCurrentUser}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors shrink-0"
              title="Switch user"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 border-r border-border bg-card flex-col shrink-0 hidden md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}

function ViewItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-lg cursor-pointer transition-colors',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-muted'
      )}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  )
}
