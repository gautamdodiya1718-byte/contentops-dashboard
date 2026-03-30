import { X, RotateCcw } from 'lucide-react'
import { useContentStore } from '@/stores/contentStore'
import { ALL_STATUSES } from '@/lib/types'

export function FilterPanel() {
  const { isFilterOpen, setFilterOpen, filters, setFilters, resetFilters, posts } = useContentStore()

  if (!isFilterOpen) return null

  const authors = [...new Set(posts.map(p => p.author).filter(Boolean))].sort()
  const clusters = [...new Set(posts.map(p => p.contentCluster).filter(Boolean))].sort()
  const hasActiveFilters = filters.status !== 'ALL' || filters.author || filters.priority !== 'ALL' || filters.cluster || filters.dateFrom || filters.dateTo

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw size={12} /> Clear all
            </button>
          )}
          <button onClick={() => setFilterOpen(false)} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
          <select
            value={filters.status}
            onChange={e => setFilters({ status: e.target.value as any })}
            className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Author</label>
          <select
            value={filters.author}
            onChange={e => setFilters({ author: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">All Authors</option>
            {authors.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
          <select
            value={filters.priority}
            onChange={e => setFilters({ priority: e.target.value as any })}
            className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Cluster</label>
          <select
            value={filters.cluster}
            onChange={e => setFilters({ cluster: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">All Clusters</option>
            {clusters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">From Date</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => setFilters({ dateFrom: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">To Date</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => setFilters({ dateTo: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  )
}
