import { X, FileSpreadsheet, FileText } from 'lucide-react'
import { useContentStore } from '@/stores/contentStore'

export function ExportModal() {
  const isExportModalOpen = useContentStore((s) => s.isExportModalOpen)
  const setExportModalOpen = useContentStore((s) => s.setExportModalOpen)
  const posts = useContentStore((s) => s.posts)

  if (!isExportModalOpen) return null

  const close = () => setExportModalOpen(false)

  const exportData = (format: 'xlsx' | 'csv') => {
    const data = posts.map((p, i) => ({
      'Sr.': i + 1,
      'Blog Title': p.title,
      'Status': p.status,
      'Primary Keyword': p.primaryKeyword,
      'Search Volume': p.searchVolume,
      'Keyword Difficulty': p.keywordDifficulty,
      'Meta Title': p.metaTitle,
      'Meta Description': p.metaDescription,
      'URL Slug': p.urlSlug,
      'Author': p.author,
      'Priority': p.priority,
      'Due Date': p.dueDate,
      'Date Written': p.dateWritten,
      'Date Published': p.datePublished,
      'Content Cluster': p.contentCluster,
      'Reviewer': p.reviewer,
      'Word Count': p.wordCount,
      'Word Count Target': p.wordCountTarget,
      'Draft URL': p.draftUrl,
      'Live URL': p.liveUrl,
      'Notes': p.notes,
    }))

    if (format === 'xlsx') {
      import('xlsx').then(XLSX => {
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Content')
        // Set column widths
        ws['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 14 }, { wch: 25 }, { wch: 12 }, { wch: 8 }, { wch: 40 }, { wch: 60 }, { wch: 30 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 40 }, { wch: 40 }, { wch: 30 }]
        XLSX.writeFile(wb, `contentops-export-${new Date().toISOString().split('T')[0]}.xlsx`)
      })
    } else {
      import('papaparse').then(Papa => {
        const csv = Papa.default.unparse(data)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `contentops-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      })
    }

    close()
  }

  const filteredCount = posts.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={close}>
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground">Export Data</h2>
          <button onClick={close} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Export <span className="font-semibold text-foreground">{filteredCount}</span> items
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => exportData('xlsx')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={28} className="text-emerald-600" />
              <span className="text-sm font-medium text-foreground">Export as Excel</span>
              <span className="text-xs text-muted-foreground">.xlsx format</span>
            </button>

            <button
              onClick={() => exportData('csv')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
            >
              <FileText size={28} className="text-blue-600" />
              <span className="text-sm font-medium text-foreground">Export as CSV</span>
              <span className="text-xs text-muted-foreground">.csv format</span>
            </button>
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 bg-muted/30 flex justify-end">
          <button onClick={close} className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors">Close</button>
        </div>
      </div>
    </div>
  )
}
