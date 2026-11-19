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

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
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
