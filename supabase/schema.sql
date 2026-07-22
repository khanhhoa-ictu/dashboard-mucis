create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  display_name text not null,
  username text not null unique,
  email text not null unique,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id) on delete cascade,
  title text not null,
  slug text not null unique,
  cover_url text,
  released_at date,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.albums(id) on delete set null,
  artist_id uuid references public.artists(id) on delete cascade,
  title text not null,
  slug text not null unique,
  duration_seconds integer not null default 0,
  cover_url text,
  audio_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  cover_url text,
  is_public boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.playlist_tracks (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  sort_order integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (playlist_id, track_id),
  unique (playlist_id, sort_order)
);

create table if not exists public.favorite_tracks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, track_id)
);

create table if not exists public.favorite_albums (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  album_id uuid not null references public.albums(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, album_id)
);

create table if not exists public.favorite_artists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, artist_id)
);

create table if not exists public.playback_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  audio_quality text not null default 'high',
  crossfade_seconds integer not null default 5,
  equalizer_preset text not null default 'custom',
  autoplay_enabled boolean not null default true,
  normalize_volume_enabled boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  new_music_enabled boolean not null default true,
  playlist_updates_enabled boolean not null default true,
  recommendations_enabled boolean not null default true,
  podcast_updates_enabled boolean not null default false,
  offers_enabled boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appearance_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  theme_name text not null default 'Lavender',
  text_scale numeric(3,2) not null default 1.00,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.privacy_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  private_session_enabled boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.connected_devices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  model text not null,
  device_type text not null,
  is_connected boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.podcast_shows (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  cover_url text,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.podcast_episodes (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.podcast_shows(id) on delete cascade,
  title text not null,
  audio_url text,
  duration_seconds integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.recent_plays (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete cascade,
  podcast_episode_id uuid references public.podcast_episodes(id) on delete cascade,
  played_at timestamptz not null default timezone('utc', now()),
  progress_seconds integer not null default 0,
  check (
    (track_id is not null and podcast_episode_id is null)
    or (track_id is null and podcast_episode_id is not null)
  )
);

