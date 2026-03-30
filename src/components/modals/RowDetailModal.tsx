import { useState } from 'react'
import { X, FileText, Search, Link as LinkIcon, MessageSquare, Pencil, Trash2, ExternalLink, Clock } from 'lucide-react'
import { useContentStore } from '@/stores/contentStore'
import { ALL_STATUSES, STATUS_COLORS, PRIORITY_COLORS } from '@/lib/types'
import type { ContentStatus } from '@/lib/types'
import { cn, formatDate, getInitials, isOverdue } from '@/lib/utils'

export function RowDetailModal() {
  const {
    posts, selectedPostId, setSelectedPostId, changeStatus,
    deletePost, comments, addComment, activityLog,
    setEditingPost, setEditModalOpen,
  } = useContentStore()

  const post = posts.find(p => p.id === selectedPostId)
  const [commentText, setCommentText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!post) return null

  const postComments = comments.filter(c => c.postId === post.id)
  const postActivity = activityLog.filter(a => a.postId === post.id).slice(-10).reverse()
  const overdue = isOverdue(post.dueDate, post.status)
  const wordPct = post.wordCountTarget ? Math.min(100, Math.round((post.wordCount / post.wordCountTarget) * 100)) : 0

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeStatus(post.id, e.target.value as ContentStatus)
  }

  const handleDelete = () => {
    deletePost(post.id)
    setShowDeleteConfirm(false)
  }

  const handleEdit = () => {
    setEditingPost(post)
    setEditModalOpen(true)
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return
    addComment(post.id, 'Current User', commentText.trim())
    setCommentText('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedPostId(null)}>
      <div
        className="bg-card w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="text-xs font-mono text-muted-foreground shrink-0">{post.id}</span>
            <h2 className="text-lg font-semibold text-foreground truncate">{post.title}</h2>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <select
              value={post.status}
              onChange={handleStatusChange}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer appearance-none pr-6 bg-no-repeat bg-[right_6px_center] bg-[length:12px]', STATUS_COLORS[post.status])}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            >
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleEdit} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Edit">
              <Pencil size={16} />
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
              <Trash2 size={16} />
            </button>
            <div className="h-5 w-px bg-border" />
            <button onClick={() => setSelectedPostId(null)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Content & SEO */}
            <div className="lg:col-span-2 space-y-8">
              {/* Content Details */}
              <section>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-primary" /> Content Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Blog Title" value={post.title} />
                  <InfoField label="URL Slug" value={post.urlSlug || '--'} />
                  {post.draftUrl && (
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Draft URL</label>
                      <a href={post.draftUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary bg-primary/5 p-2.5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors">
                        <LinkIcon size={14} /> {post.draftUrl}
                        <ExternalLink size={12} className="ml-auto opacity-50" />
                      </a>
                    </div>
                  )}
                  {post.liveUrl && (
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Live URL</label>
                      <a href={post.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors">
                        <LinkIcon size={14} /> {post.liveUrl}
                        <ExternalLink size={12} className="ml-auto opacity-50" />
                      </a>
                    </div>
                  )}
                </div>
              </section>

              <hr className="border-border" />

              {/* SEO & Meta */}
              <section>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Search size={16} className="text-primary" /> SEO & Meta
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <InfoField label="Primary Keyword" value={post.primaryKeyword} />
                  <InfoField label="Search Volume" value={post.searchVolume} />
                  <InfoField label="Keyword Difficulty" value={String(post.keywordDifficulty)} />
                </div>
                <div className="space-y-4">
                  <InfoField label="Meta Title" value={post.metaTitle || '--'} />
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Meta Description</label>
                    <p className="text-sm text-foreground bg-muted p-3 rounded-lg border border-border">{post.metaDescription || '--'}</p>
                  </div>
                </div>
              </section>

              {post.notes && (
                <>
                  <hr className="border-border" />
                  <section>
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText size={16} className="text-primary" /> Notes
                    </h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg border border-border">{post.notes}</p>
                  </section>
                </>
              )}
            </div>

            {/* Right: Assignment, Comments, Activity */}
            <div className="space-y-6">
              {/* Assignment */}
              <div className="bg-muted/50 border border-border rounded-xl p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Assignment & Dates</h4>
                <div className="space-y-4">
                  <PersonField label="Author" name={post.author} />
                  {post.reviewer && <PersonField label="Reviewer" name={post.reviewer} />}
                  <div>
                    <label className="text-xs text-muted-foreground">Priority</label>
                    <p className="mt-1"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', PRIORITY_COLORS[post.priority])}>{post.priority}</span></p>
                  </div>
                  {post.contentCluster && (
                    <div>
                      <label className="text-xs text-muted-foreground">Content Cluster</label>
                      <p className="text-sm font-medium text-foreground mt-1">{post.contentCluster}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Date Written</label>
                      <p className="text-sm font-medium text-foreground mt-1">{formatDate(post.dateWritten)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Publish Date</label>
                      <p className="text-sm font-medium text-foreground mt-1">{formatDate(post.datePublished)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Due Date</label>
                    <p className={cn('text-sm font-medium mt-1', overdue ? 'text-red-600' : 'text-foreground')}>{formatDate(post.dueDate)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Word Count</label>
                    <div className="mt-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-foreground">{post.wordCount}</span>
                        <span className="text-xs text-muted-foreground">/ {post.wordCountTarget} target</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all', wordPct >= 100 ? 'bg-emerald-500' : wordPct >= 50 ? 'bg-amber-500' : 'bg-red-400')} style={{ width: `${wordPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquare size={14} /> Team Notes
                </h4>
                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto scrollbar-thin">
                  {postComments.length === 0 && <p className="text-xs text-muted-foreground">No comments yet</p>}
                  {postComments.map((c) => (
                    <div key={c.id} className="bg-muted border border-border p-2.5 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground text-xs">{c.author}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-muted-foreground text-xs">{c.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  <button onClick={handleAddComment} className="px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Post
                  </button>
                </div>
              </div>

              {/* Activity Log */}
              {postActivity.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock size={14} /> Activity
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                    {postActivity.map((a) => (
                      <div key={a.id} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                        <div>
                          <span className="font-medium text-foreground">{a.performedBy}</span>{' '}
                          {a.action}: {a.oldValue && <span className="line-through">{a.oldValue}</span>} {a.newValue}
                          <div className="text-[10px]">{new Date(a.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete confirmation overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl z-10">
            <div className="bg-card p-6 rounded-xl border border-border shadow-xl max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete Content</h3>
              <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete "{post.title}"? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm font-medium text-foreground bg-muted border border-border rounded-lg hover:bg-muted/80 transition-colors">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  )
}

function PersonField({ label, name }: { label: string; name: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
          {getInitials(name)[0]}
        </div>
        <span className="text-sm font-medium text-foreground">{name}</span>
      </div>
    </div>
  )
}
