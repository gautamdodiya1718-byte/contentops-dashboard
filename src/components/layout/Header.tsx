import { Search, Filter, Download, Upload, Plus, Moon, Sun, Menu } from 'lucide-react'
import { useContentStore } from '@/stores/contentStore'

export function Header() {
  const searchTerm = useContentStore((s) => s.searchTerm)
  const setSearchTerm = useContentStore((s) => s.setSearchTerm)
  const isDarkMode = useContentStore((s) => s.isDarkMode)
  const toggleDarkMode = useContentStore((s) => s.toggleDarkMode)
  const setAddModalOpen = useContentStore((s) => s.setAddModalOpen)
  const setImportModalOpen = useContentStore((s) => s.setImportModalOpen)
  const setExportModalOpen = useContentStore((s) => s.setExportModalOpen)
  const isFilterOpen = useContentStore((s) => s.isFilterOpen)
  const setFilterOpen = useContentStore((s) => s.setFilterOpen)
  const setMobileSidebarOpen = useContentStore((s) => s.setMobileSidebarOpen)

  return (
    <header className="bg-card border-b border-border shrink-0 z-10">
      {/* Top row */}
      <div className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 gap-2 md:gap-4">
        {/* Left: hamburger + search */}
        <div className="flex items-center flex-1 gap-2 md:gap-4 min-w-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors md:hidden shrink-0"
          >
            <Menu size={20} />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="h-6 w-px bg-border mx-0.5 hidden sm:block" />

          <button
            onClick={() => setFilterOpen(!isFilterOpen)}
            className={`items-center gap-2 px-2.5 md:px-3 py-2 text-sm font-medium rounded-lg border transition-colors hidden sm:flex ${
              isFilterOpen
                ? 'bg-primary text-primary-foreground border-primary'
                : 'text-foreground bg-card border-border hover:bg-muted'
            }`}
          >
            <Filter size={16} /> <span className="hidden lg:inline">Filters</span>
          </button>

          {/* Mobile filter button */}
          <button
            onClick={() => setFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-lg transition-colors sm:hidden ${
              isFilterOpen ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Filter size={18} />
          </button>

          <div className="border border-border rounded-lg overflow-hidden hidden md:flex">
            <button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-card hover:bg-muted transition-colors border-r border-border"
            >
              <Download size={16} /> <span className="hidden lg:inline">Export</span>
            </button>
            <button
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-card hover:bg-muted transition-colors"
            >
              <Upload size={16} /> <span className="hidden lg:inline">Import</span>
            </button>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add Content</span>
          </button>
        </div>
      </div>

      {/* Mobile action bar (import/export) */}
      <div className="flex items-center gap-2 px-3 pb-2 md:hidden">
        <button
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-muted border border-border rounded-lg"
        >
          <Download size={14} /> Export
        </button>
        <button
          onClick={() => setImportModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-muted border border-border rounded-lg"
        >
          <Upload size={14} /> Import
        </button>
      </div>
    </header>
  )
}
