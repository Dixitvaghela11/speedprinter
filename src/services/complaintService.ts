import { supabase } from "@/lib/supabase"
import type {
  ComplaintListParams,
  ComplaintListResult,
  ComplaintStatistics,
  CreatePrinterComplaint,
  PrinterComplaint,
  UpdatePrinterComplaint,
} from "@/types/complaint"

const TABLE = "printer_complaints"

function sanitizeSearch(value: string) {
  return value.replace(/[%_,()]/g, " ").trim()
}

function startOfLocalDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function resolveDateRange(params: ComplaintListParams) {
  const now = new Date()
  if (params.datePreset === "today") {
    return { from: startOfLocalDay(now).toISOString(), to: undefined }
  }
  if (params.datePreset === "7d") {
    const from = startOfLocalDay(now)
    from.setDate(from.getDate() - 6)
    return { from: from.toISOString(), to: undefined }
  }
  if (params.datePreset === "30d") {
    const from = startOfLocalDay(now)
    from.setDate(from.getDate() - 29)
    return { from: from.toISOString(), to: undefined }
  }
  if (params.datePreset === "custom") {
    const from = params.customFrom
      ? new Date(`${params.customFrom}T00:00:00`).toISOString()
      : undefined
    const to = params.customTo
      ? new Date(`${params.customTo}T23:59:59.999`).toISOString()
      : undefined
    return { from, to }
  }
  return { from: undefined, to: undefined }
}

function applyListFilters<T extends { or: Function; eq: Function; gte: Function; lte: Function }>(
  query: T,
  params: ComplaintListParams,
): T {
  let next = query
  const search = sanitizeSearch(params.search)
  if (search) {
    next = next.or(
      [
        `printer_name.ilike.%${search}%`,
        `serial_no.ilike.%${search}%`,
        `party_name.ilike.%${search}%`,
        `phone_no.ilike.%${search}%`,
        `problem.ilike.%${search}%`,
      ].join(","),
    ) as T
  }
  if (params.status !== "All") {
    next = next.eq("status", params.status) as T
  }
  const range = resolveDateRange(params)
  if (range.from) next = next.gte("created_at", range.from) as T
  if (range.to) next = next.lte("created_at", range.to) as T
  return next
}

export function isMissingTableError(message: string) {
  return /schema cache|does not exist|PGRST205/i.test(message)
}

function mapError(error: { message: string; code?: string } | null, fallback: string) {
  if (!error) return fallback
  if (error.code === "PGRST205" || isMissingTableError(error.message)) {
    return "Could not find the table public.printer_complaints. Open the Supabase SQL Editor and run supabase/migrations/001_printer_complaints.sql, then click Retry."
  }
  return error.message || fallback
}

export async function getComplaints(
  params: ComplaintListParams,
): Promise<ComplaintListResult> {
  const from = (params.page - 1) * params.pageSize
  const to = from + params.pageSize - 1

  let query = supabase
    .from(TABLE)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  query = applyListFilters(query, params)

  const { data, error, count } = await query
  if (error) throw new Error(mapError(error, "Unable to load complaints."))
  return { data: (data ?? []) as PrinterComplaint[], total: count ?? 0 }
}

export async function getComplaintById(id: number): Promise<PrinterComplaint> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw new Error(mapError(error, "Unable to load complaints."))
  return data as PrinterComplaint
}

export async function createComplaint(
  payload: CreatePrinterComplaint,
): Promise<PrinterComplaint> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      printer_name: payload.printer_name,
      serial_no: payload.serial_no ?? null,
      party_name: payload.party_name ?? null,
      phone_no: payload.phone_no ?? null,
      problem: payload.problem ?? null,
      status: payload.status ?? "Pending",
    })
    .select("*")
    .single()
  if (error) throw new Error(mapError(error, "Unable to save complaint."))
  return data as PrinterComplaint
}

export async function updateComplaint(
  id: number,
  payload: UpdatePrinterComplaint,
): Promise<PrinterComplaint> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single()
  if (error) throw new Error(mapError(error, "Unable to update complaint."))
  return data as PrinterComplaint
}

export async function deleteComplaint(id: number): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id)
  if (error) throw new Error(mapError(error, "Unable to delete complaint."))
}

export async function getComplaintStatistics(): Promise<ComplaintStatistics> {
  const statuses = ["Pending", "In Progress", "Completed", "Cancelled"] as const
  const [totalRes, ...statusResults] = await Promise.all([
    supabase.from(TABLE).select("id", { count: "exact", head: true }),
    ...statuses.map((status) =>
      supabase
        .from(TABLE)
        .select("id", { count: "exact", head: true })
        .eq("status", status),
    ),
  ])

  const firstError =
    totalRes.error ?? statusResults.find((result) => result.error)?.error
  if (firstError) {
    throw new Error(mapError(firstError, "Unable to load complaints."))
  }

  return {
    total: totalRes.count ?? 0,
    pending: statusResults[0]?.count ?? 0,
    inProgress: statusResults[1]?.count ?? 0,
    completed: statusResults[2]?.count ?? 0,
    cancelled: statusResults[3]?.count ?? 0,
  }
}
