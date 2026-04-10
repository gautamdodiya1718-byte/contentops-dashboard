import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2, X, Plus } from 'lucide-react'
import { useContentStore } from '@/stores/contentStore'
import type { ContentPost } from '@/lib/types'
import { STATUS_COLORS, PRIORITY_COLORS } from '@/lib/types'
import { cn, formatDate, isOverdue, getInitials } from '@/lib/utils'

const col = createColumnHelper<ContentPost>()

export function ContentTable() {
  const setSelectedPostId = useContentStore((s) => s.setSelectedPostId)
  const posts = useContentStore((s) => s.posts)
  const searchTerm = useContentStore((s) => s.searchTerm)
  const quickFilter = useContentStore((s) => s.quickFilter)
  const filters = useContentStore((s) => s.filters)
  const currentUser = useContentStore((s) => s.currentUser)
  const selectedRowIds = useContentStore((s) => s.selectedRowIds)
  const toggleRowSelection = useContentStore((s) => s.toggleRowSelection)
  const toggleAllRows = useContentStore((s) => s.toggleAllRows)
  const clearSelection = useContentStore((s) => s.clearSelection)
  const bulkDeletePosts = useContentStore((s) => s.bulkDeletePosts)
  const setAddModalOpen = useContentStore((s) => s.setAddModalOpen)
  const isInitialized = useContentStore((s) => s.isInitialized)

  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)

  const filteredData = useMemo(() => {
    let result = [...posts]
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(p => p.title.toLowerCase().includes(term) || p.primaryKeyword.toLowerCase().includes(term) || p.author.toLowerCase().includes(term) || p.urlSlug.toLowerCase().includes(term))
    }
    if (quickFilter === 'my-queue') {
      const myName = currentUser?.name || ''
      result = result.filter(p => ['ASSIGNED', 'IN PROGRESS', 'WRITTEN'].includes(p.status) && (p.author === myName || p.reviewer === myName))
    }
    else if (quickFilter === 'needs-review') result = result.filter(p => p.status === 'IN REVIEW')
    else if (quickFilter === 'approved') result = result.filter(p => p.status === 'APPROVED')
    if (filters.status !== 'ALL') result = result.filter(p => p.status === filters.status)
    if (filters.author) result = result.filter(p => p.author === filters.author)
    if (filters.priority !== 'ALL') result = result.filter(p => p.priority === filters.priority)
    if (filters.cluster) result = result.filter(p => p.contentCluster === filters.cluster)
    return result
  }, [posts, searchTerm, quickFilter, filters, currentUser])
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(() => [
    col.display({
      id: 'select',
      header: () => {
        const allIds = filteredData.map(p => p.id)
        const allSelected = allIds.length > 0 && allIds.every(id => selectedRowIds.includes(id))
        return (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => toggleAllRows(allIds)}
            className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
          />
        )
      },
      cell: (info) => (
        <input
          type="checkbox"
          checked={selectedRowIds.includes(info.row.original.id)}
          onChange={(e) => { e.stopPropagation(); toggleRowSelection(info.row.original.id) }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
        />
      ),
      size: 40,
    }),
    col.display({
      id: 'sr',
      header: 'Sr.',
      cell: (info) => <span className="text-muted-foreground">{info.row.index + 1}</span>,
      size: 50,
    }),
    col.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', STATUS_COLORS[info.getValue()])}>
          {info.getValue()}
        </span>
      ),
      size: 130,
    }),
    col.accessor('title', {
      header: 'Blog Title',
      cell: (info) => (
        <span className="font-medium text-foreground truncate block max-w-[280px]" title={info.getValue()}>
          {info.getValue()}
        </span>
      ),
      size: 300,
    }),
    col.accessor('primaryKeyword', {
      header: 'Primary Keyword',
      cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      size: 180,
    }),
    col.accessor('searchVolume', {
      header: 'SV',
      cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      size: 80,
    }),
    col.accessor('keywordDifficulty', {
      header: 'KD',
      cell: (info) => {
        const kd = info.getValue()
        const color = kd > 50
          ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
          : kd > 30
          ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
          : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
        return <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', color)}>{kd}</span>
      },
      size: 60,
    }),
    col.accessor('priority', {
      header: 'Priority',
      cell: (info) => (
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', PRIORITY_COLORS[info.getValue()])}>
          {info.getValue()}
        </span>
      ),
      size: 90,
    }),
    col.accessor('author', {
      header: 'Author',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
            {getInitials(info.getValue())[0]}
          </div>
          <span className="text-muted-foreground truncate">{info.getValue()}</span>
        </div>
      ),
      size: 150,
    }),
    col.accessor('metaTitle', {
      header: 'Meta Title',
      cell: (info) => <span className="text-muted-foreground truncate block max-w-[200px]">{info.getValue() || '--'}</span>,
      size: 220,
      enableSorting: false,
    }),
    col.accessor('dueDate', {
      header: 'Due Date',
      cell: (info) => {
        const overdue = isOverdue(info.getValue(), info.row.original.status)
        return (
          <span className={cn('text-sm', overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground')}>
            {formatDate(info.getValue())}
          </span>
        )
      },
      size: 110,
    }),
    col.accessor('datePublished', {
      header: 'Published',
      cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
      size: 110,
    }),
  ], [filteredData, selectedRowIds, toggleAllRows, toggleRowSelection])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const selectedCount = selectedRowIds.length

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Bulk Action Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-primary/5 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary">{selectedCount} item{selectedCount > 1 ? 's' : ''} selected</span>
            <button onClick={clearSelection} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <X size={12} /> Deselect all
            </button>
          </div>
          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90 transition-colors"
          >
            <Trash2 size={14} /> Delete selected
          </button>
        </div>
      )}

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-3 font-medium whitespace-nowrap',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground'
                    )}
                    onClick={header.id !== 'select' ? header.column.getToggleSortingHandler() : undefined}
                    style={{ width: header.getSize() }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        header.column.getIsSorted() === 'asc' ? <ArrowUp size={14} /> :
                        header.column.getIsSorted() === 'desc' ? <ArrowDown size={14} /> :
                        <ArrowUpDown size={14} className="opacity-30" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/50">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelectedPostId(row.original.id)}
                className={cn(
                  'hover:bg-muted/50 cursor-pointer transition-colors',
                  isOverdue(row.original.dueDate, row.original.status) && 'bg-red-50/30 dark:bg-red-950/10',
                  selectedRowIds.includes(row.original.id) && 'bg-primary/5'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {filteredData.length === 0 && isInitialized && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Plus size={20} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">No content yet. Click "Add Content" to get started.</p>
                    <button onClick={() => setAddModalOpen(true)} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                      + Add your first content
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowBulkDeleteConfirm(false)}>
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete {selectedCount} item{selectedCount > 1 ? 's' : ''}?</h3>
            <p className="text-sm text-muted-foreground mb-6">This will permanently delete the selected content. This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowBulkDeleteConfirm(false)} className="px-4 py-2 text-sm font-medium text-foreground bg-muted border border-border rounded-lg hover:bg-muted/80 transition-colors">Cancel</button>
              <button
                onClick={() => { bulkDeletePosts(selectedRowIds); setShowBulkDeleteConfirm(false) }}
                className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Delete {selectedCount} item{selectedCount > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
