import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useContentStore } from '@/stores/contentStore'
import type { ContentPost, ContentStatus, Priority } from '@/lib/types'
import { ALL_STATUSES } from '@/lib/types'

const emptyForm = {
  title: '', primaryKeyword: '', searchVolume: '', keywordDifficulty: 0,
  metaTitle: '', metaDescription: '', urlSlug: '', dateWritten: '', datePublished: '',
  author: '', status: 'IDEA' as ContentStatus, priority: 'Medium' as Priority,
  dueDate: '', contentCluster: '', reviewer: '', wordCount: 0, wordCountTarget: 2000,
  draftUrl: '', liveUrl: '', notes: '',
}

export function AddEditModal() {
  const {
    isAddModalOpen, setAddModalOpen,
    isEditModalOpen, setEditModalOpen,
    editingPost, setEditingPost,
    addPost, updatePost,
  } = useContentStore()

  const isOpen = isAddModalOpen || isEditModalOpen
  const isEdit = isEditModalOpen && !!editingPost

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isEdit && editingPost) {
      setForm({
        title: editingPost.title,
        primaryKeyword: editingPost.primaryKeyword,
        searchVolume: editingPost.searchVolume,
        keywordDifficulty: editingPost.keywordDifficulty,
        metaTitle: editingPost.metaTitle,
        metaDescription: editingPost.metaDescription,
        urlSlug: editingPost.urlSlug,
        dateWritten: editingPost.dateWritten,
        datePublished: editingPost.datePublished,
        author: editingPost.author,
        status: editingPost.status,
        priority: editingPost.priority,
        dueDate: editingPost.dueDate,
        contentCluster: editingPost.contentCluster,
        reviewer: editingPost.reviewer,
        wordCount: editingPost.wordCount,
        wordCountTarget: editingPost.wordCountTarget,
        draftUrl: editingPost.draftUrl,
        liveUrl: editingPost.liveUrl,
        notes: editingPost.notes,
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [isOpen, isEdit, editingPost])

  if (!isOpen) return null

  const close = () => {
    setAddModalOpen(false)
    setEditModalOpen(false)
    setEditingPost(null)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.author.trim()) e.author = 'Author is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    if (isEdit && editingPost) {
      updatePost(editingPost.id, form)
    } else {
      addPost(form)
    }
    close()
  }

  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={close}>
      <div className="bg-card w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground">{isEdit ? 'Edit Content' : 'Add New Content'}</h2>
          <button onClick={close} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
          {/* Core SEO */}
          <fieldset>
            <legend className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Core Info</legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormInput label="Blog Title *" value={form.title} onChange={v => set('title', v)} error={errors.title} />
              </div>
              <FormInput label="Primary Keyword" value={form.primaryKeyword} onChange={v => set('primaryKeyword', v)} />
              <FormInput label="URL Slug" value={form.urlSlug} onChange={v => set('urlSlug', v)} placeholder="/your-post-slug" />
              <FormInput label="Search Volume" value={form.searchVolume} onChange={v => set('searchVolume', v)} />
              <FormInput label="Keyword Difficulty" value={String(form.keywordDifficulty)} onChange={v => set('keywordDifficulty', Number(v))} type="number" />
              <FormInput label="Meta Title" value={form.metaTitle} onChange={v => set('metaTitle', v)} />
              <FormInput label="Content Cluster" value={form.contentCluster} onChange={v => set('contentCluster', v)} />
              <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Meta Description</label>
                <textarea
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[70px] resize-y"
                  value={form.metaDescription}
                  onChange={e => set('metaDescription', e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          {/* Assignment */}
          <fieldset>
            <legend className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Assignment</legend>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Author (Writer) *" value={form.author} onChange={v => set('author', v)} error={errors.author} />
              <FormInput label="Reviewer" value={form.reviewer} onChange={v => set('reviewer', v)} />
              <FormSelect label="Status" value={form.status} options={ALL_STATUSES} onChange={v => set('status', v)} />
              <FormSelect label="Priority" value={form.priority} options={['High', 'Medium', 'Low']} onChange={v => set('priority', v)} />
              <FormInput label="Due Date" value={form.dueDate} onChange={v => set('dueDate', v)} type="date" />
              <FormInput label="Date Written" value={form.dateWritten} onChange={v => set('dateWritten', v)} type="date" />
              <FormInput label="Date Published" value={form.datePublished} onChange={v => set('datePublished', v)} type="date" />
              <div />
              <FormInput label="Word Count" value={String(form.wordCount)} onChange={v => set('wordCount', Number(v))} type="number" />
              <FormInput label="Word Count Target" value={String(form.wordCountTarget)} onChange={v => set('wordCountTarget', Number(v))} type="number" />
            </div>
          </fieldset>

          {/* Links */}
          <fieldset>
            <legend className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Links & Notes</legend>
            <div className="grid grid-cols-1 gap-4">
              <FormInput label="Draft URL (Google Docs / Notion)" value={form.draftUrl} onChange={v => set('draftUrl', v)} placeholder="https://docs.google.com/..." />
              <FormInput label="Live URL" value={form.liveUrl} onChange={v => set('liveUrl', v)} placeholder="https://yourblog.com/..." />
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                <textarea
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px] resize-y"
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                />
              </div>
            </div>
          </fieldset>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 bg-muted/30 flex justify-end gap-3">
          <button onClick={close} className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
            {isEdit ? 'Save Changes' : 'Add Content'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FormInput({ label, value, onChange, type = 'text', placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-muted border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${error ? 'border-destructive' : 'border-border'}`}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

function FormSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
