import { cn } from '../../utils/cn'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'paid' | 'denied' | 'pending' | 'info' | 'grey'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  const variantClass = {
    default: 'badge-grey',
    paid: 'badge-paid',
    denied: 'badge-denied',
    pending: 'badge-pending',
    info: 'badge-info',
    grey: 'badge-grey',
  }[variant]

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', variantClass, className)}>
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = status?.toUpperCase()
  let variant: BadgeProps['variant'] = 'grey'
  if (['PAID', 'APPROVED', 'COMPLETED', 'CONVERTED', 'RESOLVED', 'APPEAL_APPROVED'].includes(s)) variant = 'paid'
  else if (['DENIED', 'REJECTED', 'APPEAL_DENIED', 'LOST', 'NO_SHOW', 'EXPIRED'].includes(s)) variant = 'denied'
  else if (['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION', 'DOCUMENTATION_NEEDED', 'NEW', 'WAITING'].includes(s)) variant = 'pending'
  else if (['ACCEPTED', 'APPEAL_SUBMITTED', 'QUALIFIED', 'IN_PROGRESS', 'CONTACTED', 'CONFIRMED', 'SCHEDULED', 'APPOINTMENT_SCHEDULED'].includes(s)) variant = 'info'

  const label = status?.replace(/_/g, ' ')

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const p = priority?.toUpperCase()
  let variant: BadgeProps['variant'] = 'grey'
  if (p === 'URGENT') variant = 'denied'
  else if (p === 'HIGH') variant = 'pending'
  else if (p === 'MEDIUM') variant = 'info'
  return <Badge variant={variant}>{priority}</Badge>
}
