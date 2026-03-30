import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return `CP-${Math.floor(100 + Math.random() * 900)}`
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '--'
  return new Date(date).toLocaleDateString('en-CA')
}

export function isOverdue(dueDate: string | null | undefined, status: string): boolean {
  if (!dueDate || status === 'PUBLISHED' || status === 'ARCHIVED') return false
  return new Date(dueDate) < new Date()
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
