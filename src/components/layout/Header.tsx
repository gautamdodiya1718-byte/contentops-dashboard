import { Search, Filter, Download, Upload, Plus, Moon, Sun } from 'lucide-react'
import { useContentStore } from '@/stores/contentStore'

export function Header() {
  const {
    searchTerm, setSearchTerm, isDarkMode, toggleDarkMode,
    setAddModalOpen, setImportModalOpen, setExportModalOpen,
    isFilterOpen, setFilterOpen,
  } = useContentStore()

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center flex-1 gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search content, keywords, authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleDarkMode}
          className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          title={isDarkMode ? 'Light mode' : 'Dark mode'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="h-6 w-px bg-border mx-1" />

        <button
          onClick={() => setFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            isFilterOpen
              ? 'bg-primary text-primary-foreground border-primary'
              : 'text-foreground bg-card border-border hover:bg-muted'
          }`}
        >
          <Filter size={16} /> Filters
        </button>

        <div className="flex border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-card hover:bg-muted transition-colors border-r border-border"
          >
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-card hover:bg-muted transition-colors"
          >
            <Upload size={16} /> Import
          </button>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors"
        >
          <Plus size={16} /> Add Content
        </button>
      </div>
    </header>
  )
}
