import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

export function formatDate(date: string | Date): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function getStatusColor(status: string): string {
  const s = status?.toUpperCase()
  if (['PAID', 'APPROVED', 'COMPLETED', 'CONVERTED', 'RESOLVED', 'APPEAL_APPROVED'].includes(s)) return 'badge-paid'
  if (['DENIED', 'REJECTED', 'APPEAL_DENIED', 'LOST', 'NO_SHOW', 'EXPIRED'].includes(s)) return 'badge-denied'
  if (['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION', 'DOCUMENTATION_NEEDED', 'NEW', 'WAITING'].includes(s)) return 'badge-pending'
  if (['ACCEPTED', 'APPEAL_SUBMITTED', 'QUALIFIED', 'IN_PROGRESS', 'CONTACTED', 'CONFIRMED', 'SCHEDULED', 'APPOINTMENT_SCHEDULED'].includes(s)) return 'badge-info'
  return 'badge-grey'
}

export function getPriorityColor(priority: string): string {
  switch (priority?.toUpperCase()) {
    case 'URGENT': return 'badge-denied'
    case 'HIGH': return 'badge-pending'
    case 'MEDIUM': return 'badge-info'
    default: return 'badge-grey'
  }
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export function truncate(str: string, len = 40): string {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 10) / 10}%`
}

export function ageBucketColor(bucket: string): string {
  switch (bucket) {
    case '0-30': return 'bg-green-500'
    case '31-60': return 'bg-yellow-500'
    case '61-90': return 'bg-orange-500'
    case '91-120': return 'bg-red-500'
    default: return 'bg-red-700'
  }
}
