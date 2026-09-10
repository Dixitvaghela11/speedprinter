export const COMPLAINT_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
] as const

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number]

export interface PrinterComplaint {
  id: number
  printer_name: string
  serial_no: string | null
  party_name: string | null
  phone_no: string | null
  problem: string | null
  estimated_cost: number | null
  printer_parts: string | null
  toner: boolean
  status: ComplaintStatus
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface CreatePrinterComplaint {
  printer_name: string
  serial_no?: string | null
  party_name?: string | null
  phone_no?: string | null
  problem?: string | null
  estimated_cost?: number | null
  printer_parts?: string | null
  toner?: boolean
  status?: ComplaintStatus
}

export type UpdatePrinterComplaint = Partial<CreatePrinterComplaint>

export type DatePreset = "all" | "today" | "7d" | "30d" | "custom"

export interface ComplaintFilters {
  search: string
  status: ComplaintStatus | "All"
  datePreset: DatePreset
  customFrom?: string
  customTo?: string
}

export interface SearchSuggestion {
  value: string
  type: "Party Name" | "Printer Model" | "Phone No" | "Serial No"
  phoneNo?: string | null
}

export interface ComplaintListParams extends ComplaintFilters {
  page: number
  pageSize: number
}

export interface ComplaintListResult {
  data: PrinterComplaint[]
  total: number
}

export interface ComplaintStatistics {
  total: number
  pending: number
  inProgress: number
  completed: number
  cancelled: number
}
