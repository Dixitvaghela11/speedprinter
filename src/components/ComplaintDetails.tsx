import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
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

export function ComplaintDetails({ complaint, open, onOpenChange }: ComplaintDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complaint Details</DialogTitle>
        </DialogHeader>
        {complaint && (
          <dl>
            <Row label="Printer Name" value={complaint.printer_name} />
            <Row label="Serial No" value={complaint.serial_no || "—"} />
            <Row label="Party Name" value={complaint.party_name || "—"} />
            <Row
              label="Phone No"
              value={complaint.phone_no || "—"}
              href={complaint.phone_no ? `tel:${complaint.phone_no}` : undefined}
            />
            <Row label="Problem" value={complaint.problem || "—"} />
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
              label="Updated At"
              value={format(new Date(complaint.updated_at), "dd MMM yyyy, hh:mm a")}
            />
          </dl>
        )}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
