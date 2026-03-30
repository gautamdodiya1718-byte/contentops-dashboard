import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
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
  }, [posts, searchTerm, quickFilter, filters])
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(() => [
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
        const color = kd > 50 ? 'bg-red-50 text-red-700 border-red-100' : kd > 30 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
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
          <span className={cn('text-sm', overdue ? 'text-red-600 font-medium' : 'text-muted-foreground')}>
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
  ], [])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
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
                    onClick={header.column.getToggleSortingHandler()}
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
                  isOverdue(row.original.dueDate, row.original.status) && 'bg-red-50/30 dark:bg-red-950/10'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                  No content found. Try adjusting your filters or add new content.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
