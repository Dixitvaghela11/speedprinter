import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  COMPLAINT_STATUSES,
  type ComplaintFilterOptions,
  type ComplaintFilters,
  type DatePreset,
} from "@/types/complaint"

interface ComplaintFiltersProps {
  filters: ComplaintFilters
  options: ComplaintFilterOptions
  onChange: (filters: ComplaintFilters) => void
}

const ALL = "__all__"

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <Select value={value || ALL} onValueChange={(next) => onChange(next === ALL ? "" : next)}>
      <SelectTrigger aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ComplaintFiltersBar({ filters, options, onChange }: ComplaintFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      <FilterSelect
        label="Party Name"
        value={filters.partyName}
        options={options.partyNames}
        onChange={(partyName) => onChange({ ...filters, partyName })}
      />
      <FilterSelect
        label="Printer Model"
        value={filters.printerModel}
        options={options.printerModels}
        onChange={(printerModel) => onChange({ ...filters, printerModel })}
      />
      <FilterSelect
        label="Phone No"
        value={filters.phoneNo}
        options={options.phoneNos}
        onChange={(phoneNo) => onChange({ ...filters, phoneNo })}
      />
      <FilterSelect
        label="Serial No"
        value={filters.serialNo}
        options={options.serialNos}
        onChange={(serialNo) => onChange({ ...filters, serialNo })}
      />
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
          <SelectItem value="All">Status: All</SelectItem>
          {COMPLAINT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              Status: {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
          <SelectItem value="all">Date: All</SelectItem>
          <SelectItem value="today">Date: Today</SelectItem>
          <SelectItem value="7d">Date: Last 7 Days</SelectItem>
          <SelectItem value="30d">Date: Last 30 Days</SelectItem>
          <SelectItem value="custom">Date: Custom Range</SelectItem>
        </SelectContent>
      </Select>
      {filters.datePreset === "custom" && (
        <div className="grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-3">
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
