import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useContentStore } from '@/stores/contentStore'
import { cn } from '@/lib/utils'

export function CalendarView() {
  const posts = useContentStore((s) => s.posts)
  const setSelectedPostId = useContentStore((s) => s.setSelectedPostId)
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const days: { date: number; isCurrentMonth: boolean; dateStr: string }[] = []

    // Previous month padding
    const prevLastDay = new Date(year, month, 0).getDate()
    for (let i = startPad - 1; i >= 0; i--) {
      const d = prevLastDay - i
      const m = month === 0 ? 12 : month
      const y = month === 0 ? year - 1 : year
      days.push({ date: d, isCurrentMonth: false, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      })
    }

    // Next month padding
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const m = month + 2 > 12 ? 1 : month + 2
      const y = month + 2 > 12 ? year + 1 : year
      days.push({ date: i, isCurrentMonth: false, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}` })
    }

    return days
  }, [year, month])

  const eventsByDate = useMemo(() => {
    const map: Record<string, { type: 'written' | 'published'; post: typeof posts[0] }[]> = {}
    posts.forEach((post) => {
      if (post.dateWritten) {
        if (!map[post.dateWritten]) map[post.dateWritten] = []
        map[post.dateWritten].push({ type: 'written', post })
      }
      if (post.datePublished) {
        if (!map[post.datePublished]) map[post.datePublished] = []
        map[post.datePublished].push({ type: 'published', post })
      }
    })
    return map
  }, [posts])

  const today = new Date().toISOString().split('T')[0]
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 border-b border-border">
        <h2 className="text-base md:text-lg font-semibold text-foreground">{monthName}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm font-medium hover:bg-muted rounded-lg transition-colors text-muted-foreground"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="px-2 py-2 text-xs font-semibold text-muted-foreground text-center uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, i) => {
          const events = eventsByDate[day.dateStr] || []
          const isToday = day.dateStr === today

          return (
            <div
              key={i}
              className={cn(
                'min-h-[60px] md:min-h-[100px] p-1 md:p-1.5 border-b border-r border-border/50 transition-colors',
                !day.isCurrentMonth && 'bg-muted/30',
                isToday && 'bg-primary/5'
              )}
            >
              <span className={cn(
                'text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full',
                isToday && 'bg-primary text-primary-foreground',
                !day.isCurrentMonth && 'text-muted-foreground/50',
                day.isCurrentMonth && !isToday && 'text-foreground'
              )}>
                {day.date}
              </span>
              <div className="mt-1 space-y-0.5">
                {events.slice(0, 3).map((event, j) => (
                  <div
                    key={j}
                    onClick={() => setSelectedPostId(event.post.id)}
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer font-medium transition-opacity hover:opacity-80',
                      event.type === 'written'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    )}
                    title={`${event.type === 'written' ? 'Written' : 'Published'}: ${event.post.title}`}
                  >
                    {event.post.title}
                  </div>
                ))}
                {events.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1.5">+{events.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-6 py-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-800" />
          Date Written
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-800" />
          Date Published
        </div>
      </div>
    </div>
  )
}
