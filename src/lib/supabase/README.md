# Supabase Integration Notes

This project can now use either mock data or Supabase through the same `AppApi` contract.

Recommended setup order:

1. Create a Supabase project.
2. Run [schema.sql](/D:/laptrinh/react/testvibecode/patreon clone/supabase/schema.sql).
3. Run [seed.sql](/D:/laptrinh/react/testvibecode/patreon clone/supabase/seed.sql).
4. Run [policies.sql](/D:/laptrinh/react/testvibecode/patreon clone/supabase/policies.sql) so the browser `anon` key can read demo data.
5. Optional for real audio: run [storage.sql](/D:/laptrinh/react/testvibecode/patreon clone/supabase/storage.sql).
6. Copy `.env.example` to `.env`.
7. Fill in `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and optionally `VITE_SUPABASE_AUDIO_BUCKET`.
8. Restart the dev server.

Current architecture:

- `src/types/appData.ts`: shared response contracts between UI and adapters.
- `src/services/appApi.ts`: common service interface.
- `src/services/mockAppApi.ts`: local mock adapter.
- `src/services/supabaseAppApi.ts`: Supabase adapter with mock fallback.
- `src/lib/supabase/client.ts`: Supabase client bootstrap.

Current behavior:

- If Supabase env vars are missing, the app uses mock data.
- If Supabase env vars exist, the app tries Supabase first.
- If a Supabase request fails or data is incomplete, the adapter falls back to mock data.
- If you want to upload MP3 files directly from the website, rerun [policies.sql](/D:/laptrinh/react/testvibecode/patreon clone/supabase/policies.sql) after pulling the latest code so `anon` can update `public.tracks.audio_url`.
- For audio playback, `audio_url` can be:
  - a full public URL such as `https://.../song.mp3`
  - a storage path such as `sunset-drive.mp3`
  - a bucket-qualified storage path such as `audio:sunset-drive.mp3`
- If `audio_url` is empty, the app falls back to generated demo audio.

At the moment, the `sidebar` and `overview` endpoints are Supabase-ready first. The remaining pages still safely fall back to mock data.
