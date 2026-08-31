import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Printer } from "lucide-react"
import { toast } from "sonner"
import { ComplaintDetails } from "@/components/ComplaintDetails"
import { ComplaintFiltersBar } from "@/components/ComplaintFilters"
import { ComplaintForm, type ComplaintFormValues } from "@/components/ComplaintForm"
import { ComplaintTable } from "@/components/ComplaintTable"
import { DashboardStats } from "@/components/DashboardStats"
import { DeleteComplaintDialog } from "@/components/DeleteComplaintDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsDesktop } from "@/hooks/useIsDesktop"
import {
  createComplaint,
  deleteComplaint,
  getComplaintStatistics,
  getComplaints,
  isMissingTableError,
  updateComplaint,
} from "@/services/complaintService"
import type {
  ComplaintFilters,
  ComplaintStatistics,
  ComplaintStatus,
  PrinterComplaint,
} from "@/types/complaint"

const PAGE_SIZES = [10, 25, 50, 100]

export function PrinterComplaints() {
  const isDesktop = useIsDesktop()
  const [filters, setFilters] = useState<ComplaintFilters>({
    search: "",
    status: "Pending",
    datePreset: "all",
  })
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [complaints, setComplaints] = useState<PrinterComplaint[]>([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<ComplaintStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState<PrinterComplaint | null>(null)
  const [viewing, setViewing] = useState<PrinterComplaint | null>(null)
  const [toDelete, setToDelete] = useState<PrinterComplaint | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(filters.search), 350)
    return () => window.clearTimeout(timer)
  }, [filters.search])

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [list, statistics] = await Promise.all([
        getComplaints({
          ...filters,
          search: debouncedSearch,
          page,
          pageSize,
        }),
        getComplaintStatistics(),
      ])
      setComplaints(list.data)
      setTotal(list.total)
      setStats(statistics)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load complaints."
      setLoadError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [
    debouncedSearch,
    filters.status,
    filters.datePreset,
    filters.customFrom,
    filters.customTo,
    page,
    pageSize,
  ])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filters.status, filters.datePreset, filters.customFrom, filters.customTo, pageSize])

  function closeForm() {
    setEditing(null)
    setFormOpen(false)
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(complaint: PrinterComplaint) {
    setEditing(complaint)
    setFormOpen(true)
  }

  async function handleSubmit(values: ComplaintFormValues) {
    if (submitting) return
    setSubmitting(true)
    try {
      const estimatedCost = values.estimated_cost.trim()
      const payload = {
        printer_name: values.printer_name,
        serial_no: values.serial_no || null,
        party_name: values.party_name || null,
        phone_no: values.phone_no || null,
        problem: values.problem || null,
        printer_parts: values.printer_parts || null,
        estimated_cost: estimatedCost ? Number(estimatedCost) : null,
        status: values.status,
      }
      if (editing) {
        await updateComplaint(editing.id, payload)
        toast.success("Complaint updated successfully.")
      } else {
        await createComplaint(payload)
        toast.success("Complaint created successfully.")
      }
      closeForm()
      await loadData()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : editing
            ? "Unable to update complaint."
            : "Unable to save complaint.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(complaint: PrinterComplaint, status: ComplaintStatus) {
    try {
      await updateComplaint(complaint.id, { status })
      toast.success("Complaint updated successfully.")
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update complaint.")
    }
  }

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteComplaint(toDelete.id)
      toast.success("Complaint deleted successfully.")
      setToDelete(null)
      if (editing?.id === toDelete.id) closeForm()
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete complaint.")
    } finally {
      setDeleting(false)
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const showEmpty = !loading && total === 0
  const form = (
    <ComplaintForm
      editing={editing}
      submitting={submitting}
      compact={!isDesktop}
      onSubmit={handleSubmit}
      onCancelEdit={closeForm}
    />
  )

  return (
    <div className="min-h-svh bg-[linear-gradient(180deg,#1e3a5f_0%,#1e3a5f_132px,#eef3f8_132px)] md:bg-[linear-gradient(180deg,#1e3a5f_0%,#1e3a5f_168px,#eef3f8_168px)]">
      <header className="sticky top-0 z-30 bg-[#1e3a5f] px-4 pb-4 pt-3 text-white md:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <img
            src="/logo.svg"
            alt="Printer CMS"
            className="h-11 w-11 rounded-xl bg-white/10 p-1 shadow-sm ring-1 ring-white/20"
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold leading-tight md:text-2xl">
              Printer Complaint Management
            </h1>
            <p className="truncate text-xs text-white/75 md:text-sm">
              Track and manage printer service complaints
            </p>
          </div>
          <Button
            className="hidden bg-white text-primary hover:bg-white/90 md:inline-flex"
            onClick={openCreate}
          >
            <Plus />
            Add Complaint
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-4 px-3 pb-28 pt-4 md:space-y-6 md:px-8 md:pb-10">
        {loadError && isMissingTableError(loadError) && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="space-y-3 p-4 md:p-6">
              <p className="font-semibold text-amber-950">Database table is missing</p>
              <p className="text-sm text-amber-900">
                The frontend key cannot create tables. Open the SQL Editor for project{" "}
                <span className="font-mono">xvbrvrxqlqgkmehemvob</span>, paste the contents of{" "}
                <span className="font-mono">supabase/migrations/001_printer_complaints.sql</span>,
                click Run, then Retry.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a
                    href="https://supabase.com/dashboard/project/xvbrvrxqlqgkmehemvob/sql/new"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open SQL Editor
                  </a>
                </Button>
                <Button type="button" variant="outline" onClick={() => void loadData()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <DashboardStats stats={stats} loading={loading && !stats} />

        {isDesktop && (
          <Card>
            <CardContent className="p-6">{form}</CardContent>
          </Card>
        )}

        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="space-y-4 p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base md:text-lg">Complaint Records</CardTitle>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                {total} total
              </span>
            </div>
            <ComplaintFiltersBar filters={filters} onChange={setFilters} />
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            {showEmpty ? (
              <div className="rounded-2xl border border-dashed bg-muted/30 px-5 py-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Printer className="h-6 w-6" />
                </div>
                <p className="text-base font-medium">No printer complaints found.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first complaint to get started.
                </p>
                <Button className="mt-4" onClick={openCreate}>
                  <Plus />
                  Add Complaint
                </Button>
              </div>
            ) : (
              <ComplaintTable
                complaints={complaints}
                loading={loading}
                page={page}
                pageSize={pageSize}
                onView={setViewing}
                onEdit={openEdit}
                onDelete={setToDelete}
                onStatusChange={handleStatusChange}
              />
            )}

            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-sm text-muted-foreground sm:text-left">
                Showing {from}-{to} of {total} complaints
              </p>
              <div className="flex items-center justify-center gap-2">
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-[7.5rem]" aria-label="Rows per page">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} / page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft />
                </Button>
                <span className="min-w-16 text-center text-sm font-medium">
                  {page} / {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= pageCount}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {!isDesktop && (
        <button
          type="button"
          onClick={openCreate}
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30"
        >
          <Plus className="h-5 w-5" />
          Add
        </button>
      )}

      {!isDesktop && (
        <Dialog
          open={formOpen}
          onOpenChange={(open) => {
            if (!open) closeForm()
            else setFormOpen(true)
          }}
        >
          <DialogContent className="max-h-[92svh]">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Printer Complaint" : "Add Printer Complaint"}
              </DialogTitle>
            </DialogHeader>
            {form}
          </DialogContent>
        </Dialog>
      )}

      <ComplaintDetails
        complaint={viewing}
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) setViewing(null)
        }}
      />
      <DeleteComplaintDialog
        open={Boolean(toDelete)}
        loading={deleting}
        onOpenChange={(open) => {
          if (!open && !deleting) setToDelete(null)
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}
