-- Run this after supabase/schema.sql
-- This seed is intentionally small but covers the current overview adapter.

insert into public.profiles (
  id,
  display_name,
  username,
  email,
  avatar_url
)
values (
  '11111111-1111-1111-1111-111111111111',
  'Mia',
  'mialovesmusic',
  'mia.loves.music@email.com',
  null
)
on conflict (id) do nothing;

insert into public.artists (id, name, slug, image_url)
values
  ('22222222-2222-2222-2222-222222222221', 'Lofi Chill', 'lofi-chill', null),
  ('22222222-2222-2222-2222-222222222222', 'JVKE', 'jvke', null),
  ('22222222-2222-2222-2222-222222222223', 'Beabadoobee', 'beabadoobee', null),
  ('22222222-2222-2222-2222-222222222224', 'Oatmello', 'oatmello', null)
on conflict (id) do nothing;

insert into public.albums (
  id,
  artist_id,
  title,
  slug,
  cover_url,
  released_at
)
values
  (
    '33333333-3333-3333-3333-333333333331',
    '22222222-2222-2222-2222-222222222221',
    'Sunset Drive',
    'sunset-drive',
    'weekend-van',
    '2026-07-01'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '22222222-2222-2222-2222-222222222222',
    'Golden Hour',
    'golden-hour',
    'road-trip',
    '2026-07-02'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222223',
    'Coffee Shop',
    'coffee-shop',
    'coffee-latte',
    '2026-07-03'
  ),
  (
    '33333333-3333-3333-3333-333333333334',
    '22222222-2222-2222-2222-222222222224',
    'Dreamscape',
    'dreamscape',
    'dream-clouds',
    '2026-07-04'
  )
on conflict (id) do nothing;

insert into public.tracks (
  id,
  album_id,
  artist_id,
  title,
  slug,
  duration_seconds,
  cover_url,
  audio_url
)
values
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333331',
    '22222222-2222-2222-2222-222222222221',
    'Sunset Drive',
    'track-sunset-drive',
    210,
    'weekend-van',
    null
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333332',
    '22222222-2222-2222-2222-222222222222',
    'Golden Hour',
    'track-golden-hour',
    171,
    'road-trip',
    null
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222223',
    'Coffee Shop',
    'track-coffee-shop',
    197,
    'coffee-latte',
    null
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333334',
    '22222222-2222-2222-2222-222222222224',
    'Dreamscape',
    'track-dreamscape',
    243,
    'dream-clouds',
    null
  )
on conflict (id) do nothing;

insert into public.playlists (
  id,
  owner_profile_id,
  title,
  description,
  cover_url,
  is_public,
  is_featured
)
values
  (
    '55555555-5555-5555-5555-555555555551',
    '11111111-1111-1111-1111-111111111111',
    'Weekend Vibes',
    'Warm sunset tracks for your afternoon.',
    'weekend-van',
    true,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    '11111111-1111-1111-1111-111111111111',
    'My Favorites',
    'Personal picks synced from Supabase.',
    'heart-balloon',
    false,
    false
  )
on conflict (id) do nothing;

insert into public.playlist_tracks (
  id,
  playlist_id,
  track_id,
  sort_order
)
values
  (
    '66666666-6666-6666-6666-666666666661',
    '55555555-5555-5555-5555-555555555551',
    '44444444-4444-4444-4444-444444444441',
    1
  ),
  (
    '66666666-6666-6666-6666-666666666662',
    '55555555-5555-5555-5555-555555555551',
    '44444444-4444-4444-4444-444444444442',
    2
  ),
  (
    '66666666-6666-6666-6666-666666666663',
    '55555555-5555-5555-5555-555555555552',
    '44444444-4444-4444-4444-444444444443',
    1
  )
on conflict (id) do nothing;

insert into public.favorite_tracks (id, profile_id, track_id)
values
  (
    '77777777-7777-7777-7777-777777777771',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444441'
  ),
  (
    '77777777-7777-7777-7777-777777777772',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444442'
  ),
  (
    '77777777-7777-7777-7777-777777777773',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444443'
  )
on conflict (id) do nothing;

insert into public.favorite_albums (id, profile_id, album_id)
values
  (
    '88888888-8888-8888-8888-888888888881',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333331'
  ),
  (
    '88888888-8888-8888-8888-888888888882',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333332'
  )
on conflict (id) do nothing;

insert into public.favorite_artists (id, profile_id, artist_id)
values
  (
    '99999999-9999-9999-9999-999999999991',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221'
  ),
  (
    '99999999-9999-9999-9999-999999999992',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222'
  )
on conflict (id) do nothing;

insert into public.playback_settings (
  profile_id,
  audio_quality,
  crossfade_seconds,
  equalizer_preset,
  autoplay_enabled,
  normalize_volume_enabled
)
values (
  '11111111-1111-1111-1111-111111111111',
  'high',
  5,
  'custom',
  true,
  true
)
on conflict (profile_id) do nothing;

insert into public.notification_settings (
  profile_id,
  new_music_enabled,
  playlist_updates_enabled,
  recommendations_enabled,
  podcast_updates_enabled,
  offers_enabled
)
values (
  '11111111-1111-1111-1111-111111111111',
  true,
  true,
  true,
  false,
  false
)
on conflict (profile_id) do nothing;

insert into public.appearance_settings (
  profile_id,
  theme_name,
  text_scale
)
values (
  '11111111-1111-1111-1111-111111111111',
  'Lavender',
  1.00
)
on conflict (profile_id) do nothing;

insert into public.privacy_settings (
  profile_id,
  private_session_enabled
)
values (
  '11111111-1111-1111-1111-111111111111',
  false
)
on conflict (profile_id) do nothing;

insert into public.connected_devices (
  id,
  profile_id,
  name,
  model,
  device_type,
  is_connected
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    'Mia''s Headphones',
    'AirPods Max',
    'headphones',
    true
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '11111111-1111-1111-1111-111111111111',
    'Bedroom Speaker',
    'Sonos One',
    'speaker',
    true
  )
on conflict (id) do nothing;

insert into public.podcast_shows (
  id,
  title,
  slug,
  category,
  cover_url,
  description
)
values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'The Curious Minds',
    'the-curious-minds',
    'Science',
    'space',
    'Stories and ideas for curious listeners.'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'Mindful Moments',
    'mindful-moments',
    'Wellness',
    'room',
    'A soft-spoken podcast for calmer days.'
  )
on conflict (id) do nothing;

insert into public.podcast_episodes (
  id,
  show_id,
  title,
  audio_url,
  duration_seconds,
  published_at
)
values
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'The Science of Sleep',
    null,
    1800,
    '2026-07-20T08:00:00Z'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'The Power of Positive Thinking',
    null,
    1920,
    '2026-07-21T08:00:00Z'
  )
on conflict (id) do nothing;

insert into public.recent_plays (
  id,
  profile_id,
  track_id,
  podcast_episode_id,
  played_at,
  progress_seconds
)
values
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444441',
    null,
    '2026-07-23T08:15:00Z',
    210
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444442',
    null,
    '2026-07-22T10:20:00Z',
    171
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd3',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444443',
    null,
    '2026-07-21T09:12:00Z',
    197
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd4',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    null,
    '2026-07-20T11:00:00Z',
    243
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd5',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444441',
    null,
    '2026-07-19T14:00:00Z',
    210
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd6',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444442',
    null,
    '2026-07-18T16:30:00Z',
    171
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd7',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444443',
    null,
    '2026-07-17T19:00:00Z',
    197
  )
on conflict (id) do nothing;
