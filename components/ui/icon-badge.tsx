import type { LucideIcon } from "lucide-react"

export function IconBadge({ icon: Icon, className = "" }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold ${className}`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </span>
  )
}
