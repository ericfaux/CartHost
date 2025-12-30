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
