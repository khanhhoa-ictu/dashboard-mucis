-- Run this after supabase/schema.sql and supabase/seed.sql
-- This project reads demo data directly from the browser with the anon key.
-- These grants keep the demo dashboard readable without Supabase Auth.

grant usage on schema public to anon, authenticated;

grant select on table public.profiles to anon, authenticated;
grant select on table public.artists to anon, authenticated;
grant insert on table public.artists to anon, authenticated;
grant update on table public.artists to anon, authenticated;
grant select on table public.albums to anon, authenticated;
grant select on table public.tracks to anon, authenticated;
grant insert on table public.tracks to anon, authenticated;
grant update on table public.tracks to anon, authenticated;
grant delete on table public.tracks to anon, authenticated;
grant select on table public.playlists to anon, authenticated;
grant select on table public.playlist_tracks to anon, authenticated;
grant select on table public.favorite_tracks to anon, authenticated;
grant select on table public.favorite_albums to anon, authenticated;
grant select on table public.favorite_artists to anon, authenticated;
grant select on table public.playback_settings to anon, authenticated;
grant select on table public.notification_settings to anon, authenticated;
grant select on table public.appearance_settings to anon, authenticated;
grant select on table public.privacy_settings to anon, authenticated;
grant select on table public.connected_devices to anon, authenticated;
grant select on table public.podcast_shows to anon, authenticated;
grant select on table public.podcast_episodes to anon, authenticated;
grant select on table public.recent_plays to anon, authenticated;
grant insert on table public.recent_plays to anon, authenticated;
grant update on table public.recent_plays to anon, authenticated;

alter table public.profiles disable row level security;
alter table public.artists disable row level security;
alter table public.albums disable row level security;
alter table public.tracks disable row level security;
alter table public.playlists disable row level security;
alter table public.playlist_tracks disable row level security;
alter table public.favorite_tracks disable row level security;
alter table public.favorite_albums disable row level security;
alter table public.favorite_artists disable row level security;
alter table public.playback_settings disable row level security;
alter table public.notification_settings disable row level security;
alter table public.appearance_settings disable row level security;
alter table public.privacy_settings disable row level security;
alter table public.connected_devices disable row level security;
alter table public.podcast_shows disable row level security;
alter table public.podcast_episodes disable row level security;
alter table public.recent_plays disable row level security;
