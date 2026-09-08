import { format } from "date-fns"
import { Eye, Pencil, Phone, Printer, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { printComplaintLabel } from "@/lib/printLabel"
import type { ComplaintStatus, PrinterComplaint } from "@/types/complaint"

interface ComplaintTableProps {
  complaints: PrinterComplaint[]
  loading: boolean
  page: number
  pageSize: number
  onView: (complaint: PrinterComplaint) => void
  onEdit: (complaint: PrinterComplaint) => void
  onDelete: (complaint: PrinterComplaint) => void
  onStatusChange: (complaint: PrinterComplaint, status: ComplaintStatus) => void
}

function statusVariant(status: ComplaintStatus) {
  if (status === "Completed") return "success" as const
  if (status === "Pending") return "warning" as const
  if (status === "Cancelled") return "muted" as const
  return "secondary" as const
}

function formatCost(value: number | null) {
  if (value == null) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateTime(value: string | null) {
  if (!value) return "—"
  return format(new Date(value), "dd MMM yyyy, hh:mm a")
}

function handlePrint(complaint: PrinterComplaint) {
  try {
    printComplaintLabel(complaint)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Unable to print label.")
  }
}

export function ComplaintTable({
  complaints,
  loading,
  page,
  pageSize,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: ComplaintTableProps) {
  if (loading) return <TableSkeleton />

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Printer Name</TableHead>
              <TableHead>Serial No</TableHead>
              <TableHead>Party Name</TableHead>
              <TableHead>Phone No</TableHead>
              <TableHead>Problem</TableHead>
              <TableHead>Printer Parts</TableHead>
              <TableHead>Est. Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Completed At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((complaint, index) => (
              <TableRow key={complaint.id}>
                <TableCell className="text-muted-foreground">
                  {(page - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell className="font-medium">{complaint.printer_name}</TableCell>
                <TableCell>{complaint.serial_no || "—"}</TableCell>
                <TableCell>{complaint.party_name || "—"}</TableCell>
                <TableCell>{complaint.phone_no || "—"}</TableCell>
                <TableCell className="max-w-48 truncate">{complaint.problem || "—"}</TableCell>
                <TableCell className="max-w-48 truncate">{complaint.printer_parts || "—"}</TableCell>
                <TableCell>{formatCost(complaint.estimated_cost)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className="rounded-md focus:outline-none">
                        <Badge variant={statusVariant(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {(["Pending", "In Progress", "Completed", "Cancelled"] as const).map(
                        (status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => onStatusChange(complaint, status)}
                          >
                            {status}
                          </DropdownMenuItem>
                        ),
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>{formatDateTime(complaint.created_at)}</TableCell>
                <TableCell>{formatDateTime(complaint.completed_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handlePrint(complaint)}>
                      Print
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onView(complaint)}>
                      View
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(complaint)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => onDelete(complaint)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 lg:hidden">
        {complaints.map((complaint) => (
          <article
            key={complaint.id}
            className="overflow-hidden rounded-2xl border bg-card shadow-sm"
          >
            <button
              type="button"
              className="w-full p-4 text-left"
              onClick={() => onView(complaint)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{complaint.printer_name}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {complaint.party_name || "No party name"}
                  </p>
                </div>
                <Badge variant={statusVariant(complaint.status)}>{complaint.status}</Badge>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/80">
                {complaint.problem || "No problem description"}
              </p>
              {complaint.printer_parts && (
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  Parts: {complaint.printer_parts}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{complaint.serial_no || "No serial"}</span>
                <span>·</span>
                <span>{formatCost(complaint.estimated_cost)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Created {formatDateTime(complaint.created_at)}
              </p>
              {complaint.completed_at && (
                <p className="mt-1 text-xs font-medium text-emerald-700">
                  Completed {formatDateTime(complaint.completed_at)}
                </p>
              )}
            </button>
            <div className="grid grid-cols-5 border-t bg-muted/40">
              {complaint.phone_no ? (
                <a
                  href={`tel:${complaint.phone_no}`}
                  className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-primary"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              ) : (
                <span className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Call
                </span>
              )}
              <button
                type="button"
                className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium"
                onClick={() => handlePrint(complaint)}
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                type="button"
                className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium"
                onClick={() => onView(complaint)}
              >
                <Eye className="h-4 w-4" />
                View
              </button>
              <button
                type="button"
                className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium"
                onClick={() => onEdit(complaint)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-destructive"
                onClick={() => onDelete(complaint)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
