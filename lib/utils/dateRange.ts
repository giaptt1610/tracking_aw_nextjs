export type FilterType = 'day' | 'month' | 'year'

function padTwo(n: number): string {
  return String(n).padStart(2, '0')
}

function toLocalISOString(date: Date): string {
  return (
    `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}` +
    `T${padTwo(date.getHours())}:${padTwo(date.getMinutes())}:${padTwo(date.getSeconds())}`
  )
}

export function getDateRange(
  filterType: FilterType,
  dateStr: string,
): { from: string; to: string } {
  if (filterType === 'day') {
    const [year, month, day] = dateStr.split('-').map(Number)
    return {
      from: toLocalISOString(new Date(year, month - 1, day, 0, 0, 0)),
      to: toLocalISOString(new Date(year, month - 1, day, 23, 59, 59)),
    }
  }

  if (filterType === 'month') {
    const [year, month] = dateStr.split('-').map(Number)
    return {
      from: toLocalISOString(new Date(year, month - 1, 1, 0, 0, 0)),
      to: toLocalISOString(new Date(year, month, 0, 23, 59, 59)),
    }
  }

  // year
  const year = Number(dateStr)
  return {
    from: toLocalISOString(new Date(year, 0, 1, 0, 0, 0)),
    to: toLocalISOString(new Date(year, 11, 31, 23, 59, 59)),
  }
}

export function todayDateStr(): string {
  const now = new Date()
  return `${now.getFullYear()}-${padTwo(now.getMonth() + 1)}-${padTwo(now.getDate())}`
}
