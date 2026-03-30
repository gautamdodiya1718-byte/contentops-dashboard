export type ContentStatus =
  | 'IDEA'
  | 'ASSIGNED'
  | 'IN PROGRESS'
  | 'WRITTEN'
  | 'IN REVIEW'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'ARCHIVED'

export type Priority = 'High' | 'Medium' | 'Low'

export type ViewType = 'table' | 'kanban' | 'calendar'

export type QuickFilter = 'all' | 'my-queue' | 'needs-review' | 'approved'

export interface ContentPost {
  id: string
  title: string
  primaryKeyword: string
  searchVolume: string
  keywordDifficulty: number
  metaTitle: string
  metaDescription: string
  urlSlug: string
  dateWritten: string
  datePublished: string
  author: string
  status: ContentStatus
  priority: Priority
  dueDate: string
  contentCluster: string
  reviewer: string
  wordCount: number
  wordCountTarget: number
  draftUrl: string
  liveUrl: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  postId: string
  author: string
  text: string
  createdAt: string
}

export interface ActivityEntry {
  id: string
  postId: string
  action: string
  performedBy: string
  oldValue: string
  newValue: string
  timestamp: string
}

export const ALL_STATUSES: ContentStatus[] = [
  'IDEA', 'ASSIGNED', 'IN PROGRESS', 'WRITTEN',
  'IN REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'
]

export const STATUS_COLORS: Record<ContentStatus, string> = {
  'IDEA': 'bg-slate-100 text-slate-700 border-slate-200',
  'ASSIGNED': 'bg-blue-50 text-blue-700 border-blue-200',
  'IN PROGRESS': 'bg-amber-50 text-amber-700 border-amber-200',
  'WRITTEN': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'IN REVIEW': 'bg-orange-50 text-orange-700 border-orange-200',
  'APPROVED': 'bg-lime-50 text-lime-700 border-lime-200',
  'SCHEDULED': 'bg-teal-50 text-teal-700 border-teal-200',
  'PUBLISHED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'ARCHIVED': 'bg-gray-100 text-gray-600 border-gray-200',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  'High': 'bg-red-50 text-red-700 border-red-200',
  'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
  'Low': 'bg-slate-100 text-slate-600 border-slate-200',
}

export const SAMPLE_DATA: ContentPost[] = [
  {
    id: 'CP-101', title: 'Mastering Next.js 14 App Router', primaryKeyword: 'Next.js 14 tutorial',
    searchVolume: '15,000', keywordDifficulty: 45, metaTitle: 'Next.js 14 App Router: A Complete Guide',
    metaDescription: 'Learn how to master the new App Router in Next.js 14 with this comprehensive guide.',
    urlSlug: '/nextjs-14-app-router', dateWritten: '2025-10-15', datePublished: '2025-10-20',
    author: 'Sarah Jenkins', status: 'PUBLISHED', priority: 'High', dueDate: '2025-10-18',
    contentCluster: 'Web Development', reviewer: 'John Doe', wordCount: 2150, wordCountTarget: 2000,
    draftUrl: 'https://docs.google.com/document/d/1A2b', liveUrl: 'https://example.com/nextjs-14-app-router',
    notes: 'Great performance, high engagement', createdAt: '2025-10-01', updatedAt: '2025-10-20',
  },
  {
    id: 'CP-102', title: 'Tailwind CSS Best Practices for Large Teams', primaryKeyword: 'Tailwind CSS best practices',
    searchVolume: '8,200', keywordDifficulty: 32, metaTitle: 'Tailwind CSS Best Practices for Enterprise',
    metaDescription: 'Discover how large engineering teams scale their UI with Tailwind CSS.',
    urlSlug: '/tailwind-css-best-practices', dateWritten: '2025-10-22', datePublished: '',
    author: 'Alex Rodriguez', status: 'IN REVIEW', priority: 'Medium', dueDate: '2025-10-25',
    contentCluster: 'CSS & Styling', reviewer: 'John Doe', wordCount: 1800, wordCountTarget: 2000,
    draftUrl: 'https://docs.google.com/document/d/2B3c', liveUrl: '',
    notes: '', createdAt: '2025-10-10', updatedAt: '2025-10-22',
  },
  {
    id: 'CP-103', title: 'Why We Switched to Supabase', primaryKeyword: 'Supabase vs Firebase',
    searchVolume: '12,500', keywordDifficulty: 51, metaTitle: 'Why Our Startup Switched from Firebase to Supabase',
    metaDescription: 'An honest review of our migration journey from Firebase to Supabase.',
    urlSlug: '/supabase-migration-case-study', dateWritten: '', datePublished: '',
    author: 'Emily Chen', status: 'IN PROGRESS', priority: 'High', dueDate: '2026-04-05',
    contentCluster: 'Backend & Database', reviewer: '', wordCount: 500, wordCountTarget: 2500,
    draftUrl: 'https://docs.google.com/document/d/3C4d', liveUrl: '',
    notes: '', createdAt: '2025-10-18', updatedAt: '2025-11-01',
  },
  {
    id: 'CP-104', title: 'React Server Components Explained', primaryKeyword: 'React Server Components',
    searchVolume: '22,000', keywordDifficulty: 65, metaTitle: 'React Server Components: The Future of React?',
    metaDescription: 'A deep dive into how React Server Components work and why they matter.',
    urlSlug: '/react-server-components', dateWritten: '2025-10-25', datePublished: '',
    author: 'David Kim', status: 'WRITTEN', priority: 'High', dueDate: '2025-10-28',
    contentCluster: 'Web Development', reviewer: 'Sarah Jenkins', wordCount: 2400, wordCountTarget: 2000,
    draftUrl: 'https://docs.google.com/document/d/4D5e', liveUrl: '',
    notes: '', createdAt: '2025-10-12', updatedAt: '2025-10-25',
  },
  {
    id: 'CP-105', title: 'Top 10 VS Code Extensions for Web Devs', primaryKeyword: 'VS Code extensions',
    searchVolume: '35,000', keywordDifficulty: 28, metaTitle: '10 Must-Have VS Code Extensions for 2025',
    metaDescription: 'Boost your productivity with these top 10 VS Code extensions.',
    urlSlug: '/top-vscode-extensions', dateWritten: '', datePublished: '',
    author: 'Sarah Jenkins', status: 'IDEA', priority: 'Low', dueDate: '2026-04-15',
    contentCluster: 'Developer Tools', reviewer: '', wordCount: 0, wordCountTarget: 1500,
    draftUrl: '', liveUrl: '',
    notes: '', createdAt: '2025-11-01', updatedAt: '2025-11-01',
  },
  {
    id: 'CP-106', title: 'Building Scalable APIs with Node.js', primaryKeyword: 'Node.js API best practices',
    searchVolume: '18,000', keywordDifficulty: 42, metaTitle: 'Building Scalable APIs with Node.js: Complete Guide',
    metaDescription: 'Learn how to build and scale production APIs with Node.js and Express.',
    urlSlug: '/scalable-nodejs-apis', dateWritten: '2025-10-28', datePublished: '',
    author: 'Alex Rodriguez', status: 'APPROVED', priority: 'High', dueDate: '2025-10-30',
    contentCluster: 'Backend & Database', reviewer: 'John Doe', wordCount: 3200, wordCountTarget: 3000,
    draftUrl: 'https://docs.google.com/document/d/6F7g', liveUrl: '',
    notes: 'Ready for publishing', createdAt: '2025-10-05', updatedAt: '2025-10-28',
  },
  {
    id: 'CP-107', title: 'TypeScript 5.0 New Features', primaryKeyword: 'TypeScript 5.0 features',
    searchVolume: '9,500', keywordDifficulty: 35, metaTitle: "What's New in TypeScript 5.0",
    metaDescription: 'Explore all the new features and improvements in TypeScript 5.0.',
    urlSlug: '/typescript-5-features', dateWritten: '', datePublished: '',
    author: 'Emily Chen', status: 'ASSIGNED', priority: 'Medium', dueDate: '2026-04-10',
    contentCluster: 'Web Development', reviewer: 'David Kim', wordCount: 0, wordCountTarget: 2000,
    draftUrl: '', liveUrl: '',
    notes: '', createdAt: '2025-11-05', updatedAt: '2025-11-05',
  },
]
