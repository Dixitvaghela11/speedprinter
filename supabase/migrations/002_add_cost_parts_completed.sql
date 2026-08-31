-- Add estimated cost, printer parts, and completed timestamp.
-- Run in Supabase SQL Editor if the table already exists.

ALTER TABLE public.printer_complaints
ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS printer_parts TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_printer_complaints_completed_at
ON public.printer_complaints (completed_at);

-- Backfill completed_at for existing completed complaints.
UPDATE public.printer_complaints
SET completed_at = updated_at
WHERE status = 'Completed' AND completed_at IS NULL;
