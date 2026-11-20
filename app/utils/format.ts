export function formatMoney(value: unknown): string {
  const number = Number(value) || 0
  return `$${number.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

export function formatDate(value: string): string {
  if (!value) return ''
  return new Date(value).toLocaleString('az-AZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const MAX_IMAGE_SIZE = 1600

function readRaw(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  const raw = await readRaw(file)
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return raw

  const image = new Image()
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
    image.src = raw
  })

  const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height)

  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const result = canvas.toDataURL(type, 0.85)
  return result.length < raw.length ? result : raw
}

export function apiError(error: unknown): string {
  const data = (error as { data?: { message?: string } }).data
  return data?.message || 'Xəta baş verdi, yenidən cəhd edin'
}

export function imageUrl(path: unknown, siteUrl: string): string {
  const value = String(path || '')
  if (!value || /^(https?:|data:)/.test(value)) return value
  return `${siteUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`
}
