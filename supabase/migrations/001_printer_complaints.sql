-- Printer Complaint Management System
-- Run this in the Supabase SQL Editor if the table is not already present.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.printer_complaints (
    id BIGSERIAL PRIMARY KEY,
    printer_name VARCHAR(150) NOT NULL,
    serial_no VARCHAR(100),
    party_name VARCHAR(150),
    phone_no VARCHAR(20),
    problem TEXT,
    estimated_cost NUMERIC(12, 2),
    printer_parts TEXT,
    toner BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT printer_complaints_status_check
      CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled'))
);

DROP TRIGGER IF EXISTS printer_complaints_set_updated_at ON public.printer_complaints;
CREATE TRIGGER printer_complaints_set_updated_at
BEFORE UPDATE ON public.printer_complaints
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_printer_complaints_printer_name ON public.printer_complaints (printer_name);
CREATE INDEX IF NOT EXISTS idx_printer_complaints_serial_no ON public.printer_complaints (serial_no);
CREATE INDEX IF NOT EXISTS idx_printer_complaints_party_name ON public.printer_complaints (party_name);
CREATE INDEX IF NOT EXISTS idx_printer_complaints_phone_no ON public.printer_complaints (phone_no);
CREATE INDEX IF NOT EXISTS idx_printer_complaints_status ON public.printer_complaints (status);
CREATE INDEX IF NOT EXISTS idx_printer_complaints_created_at ON public.printer_complaints (created_at);
CREATE INDEX IF NOT EXISTS idx_printer_complaints_completed_at ON public.printer_complaints (completed_at);

ALTER TABLE public.printer_complaints ENABLE ROW LEVEL SECURITY;

-- Internal CRUD: anon + authenticated may read/write.
-- When adding auth, replace USING (true) with auth.uid() IS NOT NULL
-- and drop the anon policies.

DROP POLICY IF EXISTS "Allow select printer_complaints" ON public.printer_complaints;
DROP POLICY IF EXISTS "Allow insert printer_complaints" ON public.printer_complaints;
DROP POLICY IF EXISTS "Allow update printer_complaints" ON public.printer_complaints;
DROP POLICY IF EXISTS "Allow delete printer_complaints" ON public.printer_complaints;

CREATE POLICY "Allow select printer_complaints"
ON public.printer_complaints FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow insert printer_complaints"
ON public.printer_complaints FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow update printer_complaints"
ON public.printer_complaints FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete printer_complaints"
ON public.printer_complaints FOR DELETE
TO anon, authenticated
USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.printer_complaints TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.printer_complaints_id_seq TO anon, authenticated;
