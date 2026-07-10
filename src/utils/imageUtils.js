/**
 * Step 13 - image helpers for progress photos.
 *
 * Pure browser helpers used by both LOCAL mode (base64 in localStorage) and
 * CLOUD mode (resized File uploaded to Supabase Storage). Everything degrades
 * gracefully: if the canvas / DOM is unavailable we fall back to the original
 * file instead of throwing.
 */

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Validate a picked file before we do anything with it.
 * Returns { valid, error } - error is a user-facing string when invalid.
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' }
  }

  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()
  const extension = name.includes('.') ? name.split('.').pop() : ''

  const typeOk = type ? ALLOWED_TYPES.includes(type) : false
  const extOk = extension ? ALLOWED_EXTENSIONS.includes(extension) : false

  if (!typeOk && !extOk) {
    return {
      valid: false,
      error: 'Unsupported image type. Use JPG, PNG, or WEBP.',
    }
  }

  if (typeof file.size === 'number' && file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `Image is ${mb} MB. Max allowed is 5 MB.`,
    }
  }

  return { valid: true, error: null }
}

/**
 * Downscale + re-encode an image file to keep uploads small and fast.
 * Keeps aspect ratio, caps the width at maxWidth, and encodes as JPEG.
 * Returns a File (falls back to the original file if resizing is not possible).
 */
export function resizeImageFile(file, maxWidth = 1400, quality = 0.85) {
  return new Promise((resolve) => {
    if (
      typeof document === 'undefined' ||
      typeof FileReader === 'undefined' ||
      !file
    ) {
      resolve(file)
      return
    }

    const reader = new FileReader()

    reader.onerror = () => resolve(file)
    reader.onload = () => {
      const image = new Image()

      image.onerror = () => resolve(file)
      image.onload = () => {
        try {
          const srcWidth = image.naturalWidth || image.width
          const srcHeight = image.naturalHeight || image.height
          const { width, height } = fitWithin(srcWidth, srcHeight, maxWidth)

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const context = canvas.getContext('2d')
          if (!context) {
            resolve(file)
            return
          }

          context.drawImage(image, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file)
                return
              }
              resolve(
                new File([blob], toJpegName(file.name), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                }),
              )
            },
            'image/jpeg',
            quality,
          )
        } catch {
          resolve(file)
        }
      }

      image.src = String(reader.result)
    }

    reader.readAsDataURL(file)
  })
}

/** Read a file as a base64 data URL (used to store photos in LOCAL mode). */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (typeof FileReader === 'undefined' || !file) {
      reject(new Error('FileReader unavailable'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('read-failed'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}

/**
 * Create an object-URL preview for a file. The caller is responsible for
 * revoking it when done (URL.revokeObjectURL) to avoid leaks.
 */
export function createImagePreview(file) {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return null
  }
  try {
    return URL.createObjectURL(file)
  } catch {
    return null
  }
}

/** Convert a base64 data URL back into a Blob (used by photo migration). */
export function dataUrlToBlob(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return null
  }
  try {
    const [header, base64] = dataUrl.split(',')
    const mimeMatch = header.match(/data:([^;]+)/)
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new Blob([bytes], { type: mime })
  } catch {
    return null
  }
}

// --- internal ----------------------------------------------------------------

function fitWithin(width, height, maxWidth) {
  if (!width || !height) {
    return { width: maxWidth, height: maxWidth }
  }
  if (width <= maxWidth) {
    return { width, height }
  }
  const scale = maxWidth / width
  return {
    width: maxWidth,
    height: Math.max(1, Math.round(height * scale)),
  }
}

function toJpegName(name) {
  const base =
    typeof name === 'string' && name.includes('.')
      ? name.slice(0, name.lastIndexOf('.'))
      : name || 'photo'
  return `${base || 'photo'}.jpg`
}
