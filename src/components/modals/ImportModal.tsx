import { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useContentStore } from '@/stores/contentStore'
import { generateId } from '@/lib/utils'
import type { ContentPost } from '@/lib/types'

export function ImportModal() {
  const { isImportModalOpen, setImportModalOpen, importPosts } = useContentStore()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!isImportModalOpen) return null

  const close = () => {
    setImportModalOpen(false)
    setFile(null)
    setPreview([])
    setError('')
    setSuccess('')
  }

  const parseFile = async (f: File) => {
    setFile(f)
    setError('')
    setSuccess('')

    try {
      if (f.name.endsWith('.csv')) {
        const Papa = await import('papaparse')
        const text = await f.text()
        const result = Papa.default.parse(text, { header: true, skipEmptyLines: true })
        if (result.errors.length > 0) {
          setError(`CSV parse errors: ${result.errors[0].message}`)
          return
        }
        setPreview(result.data as Record<string, string>[])
      } else if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
        const XLSX = await import('xlsx')
        const buffer = await f.arrayBuffer()
        const wb = XLSX.read(buffer, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws)
        setPreview(data)
      } else {
        setError('Please upload a .csv or .xlsx file')
      }
    } catch (err) {
      setError('Failed to parse file. Please check the format.')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) parseFile(f)
  }

  const handleImport = () => {
    if (preview.length === 0) return

    const now = new Date().toISOString().split('T')[0]
    const posts: ContentPost[] = preview.map((row) => ({
      id: generateId(),
      title: row['title'] || row['Blog Title'] || row['Title'] || '',
      primaryKeyword: row['primaryKeyword'] || row['Primary Keyword'] || row['keyword'] || '',
      searchVolume: row['searchVolume'] || row['Search Volume'] || row['SV'] || '',
      keywordDifficulty: Number(row['keywordDifficulty'] || row['Keyword Difficulty'] || row['KD'] || 0),
      metaTitle: row['metaTitle'] || row['Meta Title'] || '',
      metaDescription: row['metaDescription'] || row['Meta Description'] || '',
      urlSlug: row['urlSlug'] || row['URL Slug'] || row['slug'] || '',
      dateWritten: row['dateWritten'] || row['Date Written'] || '',
      datePublished: row['datePublished'] || row['Date Published'] || '',
      author: row['author'] || row['Author'] || row['Writer'] || '',
      status: (row['status'] || row['Status'] || 'IDEA') as ContentPost['status'],
      priority: (row['priority'] || row['Priority'] || 'Medium') as ContentPost['priority'],
      dueDate: row['dueDate'] || row['Due Date'] || '',
      contentCluster: row['contentCluster'] || row['Content Cluster'] || '',
      reviewer: row['reviewer'] || row['Reviewer'] || '',
      wordCount: Number(row['wordCount'] || row['Word Count'] || 0),
      wordCountTarget: Number(row['wordCountTarget'] || row['Word Count Target'] || 2000),
      draftUrl: row['draftUrl'] || row['Draft URL'] || '',
      liveUrl: row['liveUrl'] || row['Live URL'] || '',
      notes: row['notes'] || row['Notes'] || '',
      createdAt: now,
      updatedAt: now,
    })).filter(p => p.title)

    if (posts.length === 0) {
      setError('No valid rows found. Make sure your file has a "title" or "Blog Title" column.')
      return
    }

    importPosts(posts)
    setSuccess(`Successfully imported ${posts.length} items!`)
    setTimeout(close, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={close}>
      <div className="bg-card w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground">Import Data</h2>
          <button onClick={close} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">Drop your file here or click to browse</p>
            <p className="text-xs text-muted-foreground">Supports CSV and Excel (.xlsx)</p>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => e.target.files?.[0] && parseFile(e.target.files[0])} />
          </div>

          {file && (
            <div className="flex items-center gap-3 bg-muted p-3 rounded-lg border border-border">
              <FileSpreadsheet size={20} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{preview.length} rows found</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden max-h-48 overflow-y-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    {Object.keys(preview[0]).slice(0, 5).map(k => (
                      <th key={k} className="px-3 py-2 text-left font-medium text-muted-foreground">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {preview.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).slice(0, 5).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-foreground truncate max-w-[150px]">{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 5 && <div className="px-3 py-1.5 text-xs text-muted-foreground bg-muted/50">...and {preview.length - 5} more rows</div>}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-4 bg-muted/30 flex justify-end gap-3">
          <button onClick={close} className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleImport} disabled={preview.length === 0 || !!success} className="px-6 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            Import {preview.length > 0 ? `${preview.length} rows` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
