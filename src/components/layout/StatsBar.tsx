import { FileText, Activity, Eye, CheckCircle2, Globe, AlertTriangle } from 'lucide-react'
import { useContentStore } from '@/stores/contentStore'
import { isOverdue } from '@/lib/utils'

export function StatsBar() {
  const posts = useContentStore((s) => s.posts)

  const stats = [
    { title: 'Total', value: posts.length, icon: <FileText size={20} className="text-primary" />, color: 'text-primary' },
    { title: 'In Progress', value: posts.filter(p => ['ASSIGNED', 'IN PROGRESS', 'WRITTEN'].includes(p.status)).length, icon: <Activity size={20} className="text-amber-500" />, color: 'text-amber-500' },
    { title: 'Needs Review', value: posts.filter(p => p.status === 'IN REVIEW').length, icon: <Eye size={20} className="text-orange-500" />, color: 'text-orange-500' },
    { title: 'Approved', value: posts.filter(p => p.status === 'APPROVED').length, icon: <CheckCircle2 size={20} className="text-lime-600" />, color: 'text-lime-600' },
    { title: 'Published', value: posts.filter(p => p.status === 'PUBLISHED').length, icon: <Globe size={20} className="text-emerald-500" />, color: 'text-emerald-500' },
    { title: 'Overdue', value: posts.filter(p => isOverdue(p.dueDate, p.status)).length, icon: <AlertTriangle size={20} className="text-red-500" />, color: 'text-red-500' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-card p-4 rounded-xl border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            {stat.icon}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
