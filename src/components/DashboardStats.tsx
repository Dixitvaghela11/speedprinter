import { Printer, Clock, Wrench, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { ComplaintStatistics } from "@/types/complaint"

interface DashboardStatsProps {
  stats: ComplaintStatistics | null
  loading: boolean
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  const items = [
    {
      label: "Total",
      full: "Total Complaints",
      value: stats?.total ?? 0,
      icon: Printer,
      tone: "bg-[#1e3a5f]/10 text-[#1e3a5f]",
    },
    {
      label: "Pending",
      full: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      tone: "bg-amber-50 text-amber-800",
    },
    {
      label: "In Progress",
      full: "In Progress",
      value: stats?.inProgress ?? 0,
      icon: Wrench,
      tone: "bg-sky-50 text-sky-800",
    },
    {
      label: "Completed",
      full: "Completed",
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-800",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
      {items.map((item) => (
        <Card key={item.label} className="shadow-none">
          <CardContent className="flex items-center gap-3 p-3.5 md:justify-between md:p-5">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:text-sm md:normal-case md:tracking-normal">
                <span className="md:hidden">{item.label}</span>
                <span className="hidden md:inline">{item.full}</span>
              </p>
              {loading ? (
                <Skeleton className="mt-1.5 h-7 w-10 md:h-8 md:w-16" />
              ) : (
                <p className="mt-0.5 text-2xl font-semibold tracking-tight md:text-3xl">
                  {item.value}
                </p>
              )}
            </div>
            <div className={`hidden rounded-xl p-2.5 md:block ${item.tone}`}>
              <item.icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
