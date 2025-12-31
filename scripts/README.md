# Evidence migration helper

This endpoint imports Supabase Storage objects from the `evidence` bucket into `public.photos` while computing authoritative hashes and GPS.

## Quick run (local dev)
1. Ensure `CRON_SECRET`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are set in your environment.
2. Start the dev server: `npm run dev`.
3. Trigger a dry run to inspect what would be inserted:
   ```bash
   curl -X POST "http://localhost:3000/api/migrate/evidence?dry=true" \
     -H "x-cron-secret: ${CRON_SECRET}"
   ```
4. Execute the migration (writes rows) when ready:
   ```bash
   curl -X POST "http://localhost:3000/api/migrate/evidence" \
     -H "x-cron-secret: ${CRON_SECRET}"
   ```

Use `?folder=<UUID>` to limit processing to a single top-level folder if desired. The response includes counts for inserted rows, skips, and any errors.

---

## RLS Policies for `public.photos`

The dashboard rental history page fetches photos using the service role key (admin client), so RLS doesn't block that path. However, if you want guests or authenticated users to read their own photos via the anon/authenticated client, apply these policies in Supabase SQL Editor:

```sql
-- Enable RLS on the photos table if not already enabled
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Policy: Hosts can read photos for rentals associated with their carts
CREATE POLICY "Hosts can view photos for their rentals"
  ON public.photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rentals r
      JOIN public.carts c ON r.cart_id = c.id
      WHERE r.id = photos.rental_id
        AND c.host_id = auth.uid()
    )
  );

-- Policy: Service role bypasses RLS (already default behavior)
-- The admin client uses service_role key which bypasses RLS automatically.

-- Optional: Allow guests to see their own rental photos (if guest_id is tracked)
-- CREATE POLICY "Guests can view their own rental photos"
--   ON public.photos
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.rentals r
--       WHERE r.id = photos.rental_id
--         AND r.guest_id = auth.uid()
--     )
--   );
```

### Verifying RLS in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Policies**
2. Select the `photos` table
3. Verify that RLS is enabled (toggle should be ON)
4. Check that the "Hosts can view photos" policy exists
5. Test by:
   - Signing in as a host user
   - Querying `photos` for a rental that belongs to one of their carts (should return rows)
   - Querying `photos` for a rental belonging to another host (should return empty)

---

## Deployment / Test Checklist

### Pre-deployment

- [ ] Verify environment variables are set in Vercel/production:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `CRON_SECRET`

- [ ] Run TypeScript check locally: `npm run typecheck`
- [ ] Run linter locally: `npm run lint`
- [ ] Run tests if available: `npm test`

### Post-deployment

1. **Run the evidence migration** (if not already done):
   ```bash
   # Dry run first
   curl -X POST "https://your-domain.vercel.app/api/migrate/evidence?dry=true" \
     -H "x-cron-secret: ${CRON_SECRET}"

   # Actual migration
   curl -X POST "https://your-domain.vercel.app/api/migrate/evidence" \
     -H "x-cron-secret: ${CRON_SECRET}"
   ```

2. **Verify photos appear in rental history**:
   - Sign in as a host
   - Navigate to Dashboard → History
   - Click on a rental that should have photos
   - Confirm:
     - Photos load with signed URLs (images display)
     - SHA256 hash badges appear on each photo
     - Clicking a photo opens the lightbox with hash displayed
     - Photos are in chronological order

3. **Verify RLS policies** (if using anon client elsewhere):
   - Test that hosts can only see photos for their own rentals
   - Test that unauthenticated requests are blocked

4. **Check browser console** for any errors:
   - No 403/401 errors on signed URLs
   - No missing image errors

### Rollback

If issues occur:
1. The `supabase-admin.ts` proxy is backward-compatible; existing imports will continue to work
2. The RentalDetail component gracefully handles missing photos (shows placeholder)
3. To fully rollback, revert the git commit and redeploy
