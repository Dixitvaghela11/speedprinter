import { useEffect, useState, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COMPLAINT_STATUSES, type ComplaintStatus, type PrinterComplaint } from "@/types/complaint"

export interface ComplaintFormValues {
  printer_name: string
  serial_no: string
  party_name: string
  phone_no: string
  problem: string
  estimated_cost: string
  printer_parts: string
  status: ComplaintStatus
}

interface ComplaintFormProps {
  editing: PrinterComplaint | null
  submitting: boolean
  compact?: boolean
  onSubmit: (values: ComplaintFormValues) => Promise<void>
  onCancelEdit: () => void
}

const emptyValues: ComplaintFormValues = {
  printer_name: "",
  serial_no: "",
  party_name: "",
  phone_no: "",
  problem: "",
  estimated_cost: "",
  printer_parts: "",
  status: "Pending",
}

export function isValidIndianPhone(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return true
  const digits = trimmed.replace(/\D/g, "")
  let national = digits
  if (national.startsWith("91") && national.length === 12) {
    national = national.slice(2)
  } else if (national.startsWith("0") && national.length === 11) {
    national = national.slice(1)
  }
  return /^[6-9]\d{9}$/.test(national)
}

function parseEstimatedCost(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return { value: null as number | null, error: null as string | null }
  const parsed = Number(trimmed.replace(/,/g, ""))
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { value: null, error: "Please enter a valid estimated cost." }
  }
  return { value: parsed, error: null }
}

export function ComplaintForm({
  editing,
  submitting,
  compact = false,
  onSubmit,
  onCancelEdit,
}: ComplaintFormProps) {
  const [values, setValues] = useState<ComplaintFormValues>(emptyValues)
  const [errors, setErrors] = useState<Partial<Record<keyof ComplaintFormValues, string>>>({})

  useEffect(() => {
    if (editing) {
      setValues({
        printer_name: editing.printer_name ?? "",
        serial_no: editing.serial_no ?? "",
        party_name: editing.party_name ?? "",
        phone_no: editing.phone_no ?? "",
        problem: editing.problem ?? "",
        estimated_cost:
          editing.estimated_cost != null ? String(editing.estimated_cost) : "",
        printer_parts: editing.printer_parts ?? "",
        status: editing.status,
      })
      setErrors({})
    } else {
      setValues(emptyValues)
      setErrors({})
    }
  }, [editing])

  const title = editing ? "Edit Printer Complaint" : "Add Printer Complaint"

  function validate(next: ComplaintFormValues) {
    const nextErrors: Partial<Record<keyof ComplaintFormValues, string>> = {}
    if (!next.printer_name.trim()) {
      nextErrors.printer_name = "Printer name is required."
    }
    if (!isValidIndianPhone(next.phone_no)) {
      nextErrors.phone_no = "Please enter a valid phone number."
    }
    const cost = parseEstimatedCost(next.estimated_cost)
    if (cost.error) {
      nextErrors.estimated_cost = cost.error
    }
    return nextErrors
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    await onSubmit({
      ...values,
      printer_name: values.printer_name.trim(),
      serial_no: values.serial_no.trim(),
      party_name: values.party_name.trim(),
      phone_no: values.phone_no.trim(),
      problem: values.problem.trim(),
      printer_parts: values.printer_parts.trim(),
    })
    if (!editing) setValues(emptyValues)
  }

  function handleClear() {
    if (editing) {
      onCancelEdit()
      return
    }
    setValues(emptyValues)
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      {!compact && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Record printer issues, customer details, and service status.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="printer_name">Printer Name</Label>
          <Input
            id="printer_name"
            autoComplete="off"
            placeholder="Enter printer name"
            value={values.printer_name}
            onChange={(e) => setValues((v) => ({ ...v, printer_name: e.target.value }))}
          />
          {errors.printer_name && (
            <p className="text-xs text-destructive">{errors.printer_name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="serial_no">Serial No</Label>
          <Input
            id="serial_no"
            autoComplete="off"
            placeholder="Enter serial number"
            value={values.serial_no}
            onChange={(e) => setValues((v) => ({ ...v, serial_no: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="party_name">Party Name</Label>
          <Input
            id="party_name"
            autoComplete="organization"
            placeholder="Enter party/customer name"
            value={values.party_name}
            onChange={(e) => setValues((v) => ({ ...v, party_name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone_no">Phone No</Label>
          <Input
            id="phone_no"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Enter phone number"
            value={values.phone_no}
            onChange={(e) => setValues((v) => ({ ...v, phone_no: e.target.value }))}
          />
          {errors.phone_no && <p className="text-xs text-destructive">{errors.phone_no}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimated_cost">Estimated Cost</Label>
          <Input
            id="estimated_cost"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Enter estimated cost"
            value={values.estimated_cost}
            onChange={(e) => setValues((v) => ({ ...v, estimated_cost: e.target.value }))}
          />
          {errors.estimated_cost && (
            <p className="text-xs text-destructive">{errors.estimated_cost}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={values.status}
            onValueChange={(value) =>
              setValues((v) => ({ ...v, status: value as ComplaintStatus }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {COMPLAINT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="printer_parts">Printer Parts</Label>
          <Textarea
            id="printer_parts"
            placeholder="List printer parts used or required..."
            value={values.printer_parts}
            onChange={(e) => setValues((v) => ({ ...v, printer_parts: e.target.value }))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="problem">Problem</Label>
          <Textarea
            id="problem"
            placeholder="Describe the printer problem..."
            value={values.problem}
            onChange={(e) => setValues((v) => ({ ...v, problem: e.target.value }))}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleClear} disabled={submitting}>
          {editing ? "Cancel" : "Clear"}
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {editing ? "Update Complaint" : "Save Complaint"}
        </Button>
      </div>
    </form>
  )
}
