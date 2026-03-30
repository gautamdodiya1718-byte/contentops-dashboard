import { Activity, LayoutDashboard, KanbanSquare, Calendar, Users, Settings, Eye, CheckCircle2 } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useContentStore } from '@/stores/contentStore'
import type { ViewType, QuickFilter } from '@/lib/types'

export function Sidebar() {
  const { activeView, setActiveView, quickFilter, setQuickFilter } = useContentStore()

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
          <Activity className="w-6 h-6" />
          ContentOps
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Views</div>
        <nav className="space-y-1">
          <ViewItem icon={<LayoutDashboard size={18} />} label="Table View" active={activeView === 'table'} onClick={() => { setActiveView('table'); setQuickFilter('all') }} />
          <ViewItem icon={<KanbanSquare size={18} />} label="Kanban Board" active={activeView === 'kanban'} onClick={() => { setActiveView('kanban'); setQuickFilter('all') }} />
          <ViewItem icon={<Calendar size={18} />} label="Calendar" active={activeView === 'calendar'} onClick={() => { setActiveView('calendar'); setQuickFilter('all') }} />
        </nav>

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-8 mb-3 px-2">Quick Filters</div>
        <nav className="space-y-1">
          <ViewItem icon={<Users size={18} />} label="My Queue" active={quickFilter === 'my-queue'} onClick={() => setQuickFilter(quickFilter === 'my-queue' ? 'all' : 'my-queue')} />
          <ViewItem icon={<Eye size={18} />} label="Needs Review" active={quickFilter === 'needs-review'} onClick={() => setQuickFilter(quickFilter === 'needs-review' ? 'all' : 'needs-review')} />
          <ViewItem icon={<CheckCircle2 size={18} />} label="Approved" active={quickFilter === 'approved'} onClick={() => setQuickFilter(quickFilter === 'approved' ? 'all' : 'approved')} />
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            CU
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground">Current User</p>
            <p className="text-xs text-muted-foreground">SEO Lead</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function ViewItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
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
