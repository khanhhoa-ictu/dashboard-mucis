import { isSupabaseConfigured, supabase } from '../supabase/client'
import { getDemoAudioUrl } from './demoAudio'

const defaultAudioBucket = import.meta.env.VITE_SUPABASE_AUDIO_BUCKET?.trim() || 'audio'

function isDirectPlayableUrl(value: string) {
  return /^(https?:|data:|blob:)/i.test(value)
}

function resolveStorageReference(value: string) {
  const normalized = value.trim().replace(/^\/+/, '')

  if (!normalized) {
    return null
  }

  if (normalized.includes(':')) {
    const [bucket, ...pathParts] = normalized.split(':')
    const path = pathParts.join(':').replace(/^\/+/, '')

    if (!bucket || !path) {
      return null
    }

    return { bucket, path }
  }

  return {
    bucket: defaultAudioBucket,
    path: normalized,
  }
}

export function getPlayableAudioUrl(title: string, artist: string, audioUrl?: string | null) {
  if (audioUrl && audioUrl.trim()) {
    if (isDirectPlayableUrl(audioUrl)) {
      return audioUrl
    }

    const storageReference = resolveStorageReference(audioUrl)

    if (storageReference && supabase && isSupabaseConfigured) {
      const { data } = supabase.storage.from(storageReference.bucket).getPublicUrl(storageReference.path)
      if (data.publicUrl) {
        return data.publicUrl
      }
    }
  }

  return getDemoAudioUrl(`${title}::${artist}`)
}
