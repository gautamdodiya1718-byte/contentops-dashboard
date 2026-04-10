import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  action?: { label: string; onClick: () => void }
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>()((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    if (!toast.action) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) }))
      }, 6000)
    }
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))
