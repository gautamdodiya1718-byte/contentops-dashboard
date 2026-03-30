import { useState } from 'react'
import { User, Briefcase } from 'lucide-react'
import { useContentStore } from '@/stores/contentStore'
import { cn } from '@/lib/utils'

const ROLES = [
  { value: 'writer', label: 'Content Writer', description: 'Write and submit drafts for review' },
  { value: 'editor', label: 'Editor / Reviewer', description: 'Review, edit, and approve content' },
  { value: 'publisher', label: 'Publisher', description: 'Publish approved content to live site' },
  { value: 'seo', label: 'SEO Lead', description: 'Manage keywords, track SEO metrics, oversee all content' },
  { value: 'marketer', label: 'Marketer', description: 'View content pipeline and coordinate campaigns' },
  { value: 'admin', label: 'Admin / CEO', description: 'Full access to all content and settings' },
] as const

export type UserRole = typeof ROLES[number]['value']

export function UserSetupModal() {
  const currentUser = useContentStore((s) => s.currentUser)
  const setCurrentUser = useContentStore((s) => s.setCurrentUser)

  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [error, setError] = useState('')

  if (currentUser) return null

  const handleSubmit = () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!role) { setError('Please select your role'); return }
    setCurrentUser({ name: name.trim(), role })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User size={28} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Welcome to ContentOps</h2>
          <p className="text-sm text-muted-foreground">Set up your profile to get started. Your team will see your name on assigned content.</p>
        </div>

        {/* Form */}
        <div className="px-8 pb-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="e.g. Sarah Jenkins"
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
              autoFocus
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Your Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => { setRole(r.value); setError('') }}
                  className={cn(
                    'flex flex-col items-start p-3 rounded-lg border-2 text-left transition-all',
                    role === r.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30 hover:bg-muted/50'
                  )}
                >
                  <span className="text-sm font-medium text-foreground">{r.label}</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">{r.description}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-muted/30 border-t border-border">
          <button
            onClick={handleSubmit}
            className="w-full py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}
