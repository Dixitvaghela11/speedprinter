import { format } from "date-fns"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import type { DatePreset, PrinterComplaint } from "@/types/complaint"

function formatCost(value: number | null) {
  if (value == null) return ""
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateTime(value: string | null) {
  if (!value) return ""
  return format(new Date(value), "dd MMM yyyy, hh:mm a")
}

export function getDateRangeLabel(params: {
  datePreset: DatePreset
  customFrom?: string
  customTo?: string
}) {
  if (params.datePreset === "today") return "Today"
  if (params.datePreset === "7d") return "Last 7 Days"
  if (params.datePreset === "30d") return "Last 30 Days"
  if (params.datePreset === "custom") {
    const from = params.customFrom || "…"
    const to = params.customTo || "…"
    return `${from} to ${to}`
  }
  return "All Dates"
}

function toRows(complaints: PrinterComplaint[]) {
  return complaints.map((item, index) => ({
    "#": index + 1,
    "Party Name": item.party_name || "",
    "Printer Model": item.printer_name || "",
    "Serial No": item.serial_no || "",
    "Mobile No": item.phone_no || "",
    Toner: item.toner ? "Yes" : "No",
    Problem: item.problem || "",
    "Printer Parts": item.printer_parts || "",
    "Estimated Cost": formatCost(item.estimated_cost),
    Status: item.status,
    "Created At": formatDateTime(item.created_at),
    "Completed At": formatDateTime(item.completed_at),
  }))
}

function fileStamp() {
  return format(new Date(), "yyyyMMdd_HHmmss")
}

export function exportComplaintsToExcel(
  complaints: PrinterComplaint[],
  rangeLabel: string,
) {
  const rows = toRows(complaints)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints")
  XLSX.writeFile(workbook, `printer_complaints_${fileStamp()}.xlsx`)
  return { count: rows.length, rangeLabel }
}

export function exportComplaintsToPdf(
  complaints: PrinterComplaint[],
  rangeLabel: string,
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
  doc.setFontSize(14)
  doc.text("Printer Complaint Report", 14, 12)
  doc.setFontSize(10)
  doc.text(`Date Range: ${rangeLabel}`, 14, 18)
  doc.text(`Total Records: ${complaints.length}`, 14, 23)
  doc.text(`Generated: ${format(new Date(), "dd MMM yyyy, hh:mm a")}`, 14, 28)

  const body = complaints.map((item, index) => [
    String(index + 1),
    item.party_name || "—",
    item.printer_name || "—",
    item.serial_no || "—",
    item.phone_no || "—",
    item.toner ? "Yes" : "No",
    item.status,
    formatCost(item.estimated_cost) || "—",
    formatDateTime(item.created_at) || "—",
    formatDateTime(item.completed_at) || "—",
  ])

  autoTable(doc, {
    startY: 32,
    head: [[
      "#",
      "Party",
      "Model",
      "Serial",
      "Mobile",
      "Toner",
      "Status",
      "Est. Cost",
      "Created",
      "Completed",
    ]],
    body,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [30, 58, 95] },
    margin: { left: 10, right: 10 },
  })

  doc.save(`printer_complaints_${fileStamp()}.pdf`)
  return { count: complaints.length, rangeLabel }
}
