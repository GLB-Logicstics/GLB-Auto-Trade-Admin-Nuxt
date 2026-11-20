export interface SheetColumn {
  key: string
  label: string
  names: string[]
  type: 'text' | 'number'
  required?: boolean
}

export interface SheetResult {
  rows: Record<string, string | number>[]
  errors: string[]
}

function normalize(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9əöüğışç]/g, '')
}

export async function readSheet(file: File, columns: SheetColumn[]): Promise<SheetResult> {
  const XLSX = await import('xlsx')
  const book = XLSX.read(await file.arrayBuffer())
  const sheet = book.Sheets[book.SheetNames[0]!]
  if (!sheet) return { rows: [], errors: ['Faylda vərəq tapılmadı'] }

  const table = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })
  const header = (table[0] || []).map(normalize)
  const index: Record<string, number> = {}
  const errors: string[] = []

  for (const column of columns) {
    const position = header.findIndex((name) => column.names.map(normalize).includes(name))
    if (position === -1) errors.push(`"${column.label}" sütunu tapılmadı`)
    index[column.key] = position
  }
  if (errors.length) return { rows: [], errors }

  const rows: Record<string, string | number>[] = []
  table.slice(1).forEach((line, lineIndex) => {
    if (line.every((cell) => String(cell).trim() === '')) return

    const row: Record<string, string | number> = {}
    for (const column of columns) {
      const raw = String(line[index[column.key]!] ?? '').trim()
      if (column.type === 'number') {
        const value = Number(raw.replace(/[\s$,]/g, ''))
        if (!raw || !Number.isFinite(value)) {
          errors.push(`${lineIndex + 2}-ci sətir: "${column.label}" rəqəm deyil (${raw || 'boş'})`)
          return
        }
        row[column.key] = value
      } else {
        if (column.required && !raw) {
          errors.push(`${lineIndex + 2}-ci sətir: "${column.label}" boşdur`)
          return
        }
        row[column.key] = raw
      }
    }
    rows.push(row)
  })

  return { rows, errors }
}
