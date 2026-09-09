import { format } from "date-fns"
import { Printer } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { printComplaintLabel } from "@/lib/printLabel"
import type { PrinterComplaint } from "@/types/complaint"

interface ComplaintDetailsProps {
  complaint: PrinterComplaint | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b py-3 last:border-0 sm:grid-cols-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium sm:col-span-2">
        {href ? (
          <a href={href} className="text-primary underline-offset-2 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function formatCost(value: number | null) {
  if (value == null) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)
}

export function ComplaintDetails({ complaint, open, onOpenChange }: ComplaintDetailsProps) {
  function handlePrint() {
    if (!complaint) return
    try {
      printComplaintLabel(complaint)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to print label.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complaint Details</DialogTitle>
        </DialogHeader>
        {complaint && (
          <dl>
            <Row label="Party Name" value={complaint.party_name || "—"} />
            <Row label="Printer Model" value={complaint.printer_name} />
            <Row label="Serial No" value={complaint.serial_no || "—"} />
            <Row
              label="Phone No"
              value={complaint.phone_no || "—"}
              href={complaint.phone_no ? `tel:${complaint.phone_no}` : undefined}
            />
            <Row label="Toner" value={complaint.toner ? "Yes" : "No"} />
            <Row label="Problem" value={complaint.problem || "—"} />
            <Row label="Printer Parts" value={complaint.printer_parts || "—"} />
            <Row label="Estimated Cost" value={formatCost(complaint.estimated_cost)} />
            <div className="grid grid-cols-1 gap-1 border-b py-3 sm:grid-cols-3">
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="sm:col-span-2">
                <Badge>{complaint.status}</Badge>
              </dd>
            </div>
            <Row
              label="Created At"
              value={format(new Date(complaint.created_at), "dd MMM yyyy, hh:mm a")}
            />
            <Row
              label="Completed At"
              value={
                complaint.completed_at
                  ? format(new Date(complaint.completed_at), "dd MMM yyyy, hh:mm a")
                  : "—"
              }
            />
            <Row
              label="Updated At"
              value={format(new Date(complaint.updated_at), "dd MMM yyyy, hh:mm a")}
            />
          </dl>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint} disabled={!complaint}>
            <Printer />
            Print Label
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
