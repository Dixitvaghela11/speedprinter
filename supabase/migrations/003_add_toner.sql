-- Add toner yes/no field.
-- Run in Supabase SQL Editor if the table already exists.

ALTER TABLE public.printer_complaints
ADD COLUMN IF NOT EXISTS toner BOOLEAN NOT NULL DEFAULT false;
