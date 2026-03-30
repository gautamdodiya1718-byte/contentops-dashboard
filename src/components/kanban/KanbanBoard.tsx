import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { FileText } from 'lucide-react'
import { useContentStore } from '@/stores/contentStore'
import type { ContentPost, ContentStatus } from '@/lib/types'
import { ALL_STATUSES, STATUS_COLORS, PRIORITY_COLORS } from '@/lib/types'
import { cn, getInitials, isOverdue } from '@/lib/utils'

export function KanbanBoard() {
  const posts = useContentStore((s) => s.posts)
  const changeStatus = useContentStore((s) => s.changeStatus)
  const setSelectedPostId = useContentStore((s) => s.setSelectedPostId)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const activePost = activeId ? posts.find(p => p.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const postId = active.id as string
    const newStatus = over.id as ContentStatus
    changeStatus(postId, newStatus)
  }

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4 min-h-[600px] overflow-x-auto">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 min-w-max">
          {ALL_STATUSES.map((status) => {
            const columnPosts = posts.filter(p => p.status === status)
            return (
              <KanbanColumn key={status} status={status} posts={columnPosts} onCardClick={setSelectedPostId} />
            )
          })}
        </div>
        <DragOverlay>
          {activePost && <KanbanCardOverlay post={activePost} />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function KanbanColumn({ status, posts, onCardClick }: { status: ContentStatus; posts: ContentPost[]; onCardClick: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'w-64 bg-muted/50 border border-border rounded-lg p-3 flex flex-col gap-2 min-h-[500px] transition-colors',
        isOver && 'bg-primary/5 border-primary/30'
      )}
    >
      <div className="flex items-center justify-between px-1 mb-1">
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">{status}</h3>
        <span className="text-xs font-medium bg-background text-muted-foreground px-2 py-0.5 rounded-full border border-border">
          {posts.length}
        </span>
      </div>
      {posts.map((post) => (
        <KanbanCard key={post.id} post={post} onClick={() => onCardClick(post.id)} />
      ))}
    </div>
  )
}

function KanbanCard({ post, onClick }: { post: ContentPost; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: post.id })
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined
  const overdue = isOverdue(post.dueDate, post.status)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={cn(
        'bg-card p-3 rounded-lg border border-border cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all shadow-sm',
        isDragging && 'opacity-50 shadow-lg',
        overdue && 'border-red-300'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-foreground line-clamp-2 flex-1">{post.title}</p>
        <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0', PRIORITY_COLORS[post.priority])}>
          {post.priority}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">
            {getInitials(post.author)[0]}
          </div>
          <span className="truncate max-w-[100px]">{post.author}</span>
        </div>
        <span className="flex items-center gap-1"><FileText size={11} /> {post.wordCount}w</span>
      </div>
      {post.dueDate && (
        <div className={cn('text-[10px] mt-2', overdue ? 'text-red-600 font-medium' : 'text-muted-foreground')}>
          Due: {post.dueDate}
        </div>
      )}
    </div>
  )
}

function KanbanCardOverlay({ post }: { post: ContentPost }) {
  return (
    <div className="bg-card p-3 rounded-lg border-2 border-primary shadow-xl w-64 opacity-90">
      <p className="text-sm font-medium text-foreground line-clamp-2">{post.title}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <span>{post.author}</span>
        <span>{post.wordCount}w</span>
      </div>
    </div>
  )
}
