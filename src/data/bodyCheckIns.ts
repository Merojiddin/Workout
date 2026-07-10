export const BODY_CHECK_INS_KEY = 'bodyCheckIns'

export interface BodyCheckIn {
  id: string
  date: string
  bodyWeightKg: number | null
  waistCm: number | null
  bellyCm: number | null
  chestCm: number | null
  shouldersCm: number | null
  leftArmCm: number | null
  rightArmCm: number | null
  hipsCm: number | null
  postureRating: number | null
  absVisibilityRating: number | null
  energyLevel: number | null
  sleepQuality: number | null
  notes: string
  // Local mode: base64 data URLs. Kept for backward compatibility and offline.
  frontPhoto: string | null
  sidePhoto: string | null
  backPhoto: string | null
  // Cloud mode (Step 13): Supabase Storage object paths.
  frontPhotoPath?: string | null
  sidePhotoPath?: string | null
  backPhotoPath?: string | null
  // Resolved, displayable URLs (signed URLs for the private bucket). Ephemeral.
  frontPhotoUrl?: string | null
  sidePhotoUrl?: string | null
  backPhotoUrl?: string | null
  createdAt: string
  syncStatus?: 'local-only' | 'synced' | 'pending-sync'
  updatedAt?: string
}

export type PhotoSlot = 'front' | 'side' | 'back'
