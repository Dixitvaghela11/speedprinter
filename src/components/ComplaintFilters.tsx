import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  COMPLAINT_STATUSES,
  type ComplaintFilters,
  type DatePreset,
} from "@/types/complaint"

interface ComplaintFiltersProps {
  filters: ComplaintFilters
  onChange: (filters: ComplaintFilters) => void
}

export function ComplaintFiltersBar({ filters, onChange }: ComplaintFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12">
      <div className="relative sm:col-span-2 lg:col-span-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search party, printer model, phone or serial..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      <div className="lg:col-span-3">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ ...filters, status: value as ComplaintFilters["status"] })
          }
        >
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {COMPLAINT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="lg:col-span-4">
        <Select
          value={filters.datePreset}
          onValueChange={(value) =>
            onChange({ ...filters, datePreset: value as DatePreset })
          }
        >
          <SelectTrigger aria-label="Filter by date">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="custom">Custom Date Range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filters.datePreset === "custom" && (
        <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-12">
          <Input
            type="date"
            value={filters.customFrom ?? ""}
            onChange={(e) => onChange({ ...filters, customFrom: e.target.value })}
          />
          <Input
            type="date"
            value={filters.customTo ?? ""}
            onChange={(e) => onChange({ ...filters, customTo: e.target.value })}
          />
        </div>
      )}
    </div>
  )
}
