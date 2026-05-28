import { STATUSES } from '../lib/constants'

export default function StatusBadge({ status }) {
  const s = STATUSES[status] || STATUSES.new
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}
