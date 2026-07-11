/**
 * Format tanggal ke WIB (Asia/Jakarta) untuk ditampilkan di UI.
 * Vercel server menggunakan UTC, jadi kita harus konversi manual.
 */
export function formatWIB(date: Date | string, fmt: 'time' | 'datetime' | 'date' = 'time'): string {
  const d = new Date(date)
  const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Jakarta' }

  if (fmt === 'time') {
    options.hour = '2-digit'
    options.minute = '2-digit'
    options.second = '2-digit'
    options.hour12 = false
  } else if (fmt === 'date') {
    options.day = '2-digit'
    options.month = 'long'
    options.year = 'numeric'
  } else {
    options.day = '2-digit'
    options.month = 'long'
    options.year = 'numeric'
    options.hour = '2-digit'
    options.minute = '2-digit'
    options.second = '2-digit'
    options.hour12 = false
  }

  return d.toLocaleString('id-ID', options)
}
