# Printer Complaint Management System

Single-page React app for tracking printer service complaints. Data is stored in Supabase PostgreSQL and accessed directly from the browser with the publishable key (no service-role key).

## Setup

1. Install dependencies:

```bash
npm install
```

2. Environment variables are in `.env`:

```
VITE_SUPABASE_URL=https://xvbrvrxqlqgkmehemvob.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

3. Create the database table by running `supabase/migrations/001_printer_complaints.sql` in the [Supabase SQL Editor](https://supabase.com/dashboard). This creates `printer_complaints`, indexes, an `updated_at` trigger, and Row Level Security policies for this internal app (`anon` + `authenticated` may CRUD). When you add login later, tighten those policies to `auth.uid() IS NOT NULL` and remove anonymous write access.

4. Start the app:

```bash
npm run dev
```

## Features

- Dashboard counts from live data
- Create, view, edit, delete complaints
- Search, status filter, date filter, pagination
- Toast feedback and loading/empty states
- Responsive table (cards on mobile)
- Installable PWA with app logo and offline shell

To install on a phone: open the site, then **Add to Home Screen**. Icons live in `public/icons/`.

Row Level Security is enabled. The current policies are intentionally open for a small internal tool and are written so they can be replaced with authenticated-only access without changing the table.
