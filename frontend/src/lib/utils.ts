import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility untuk menggabungkan Tailwind CSS classes dengan aman.
 * Menggunakan clsx untuk conditional classes dan tailwind-merge
 * untuk resolve konflik class (misal: "p-4 p-2" → "p-2").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format angka ke format mata uang Rupiah.
 * Contoh: 50000 → "Rp 50.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format tanggal ke format lokal Indonesia.
 * Contoh: "2026-07-17" → "17 Juli 2026"
 */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

/**
 * Ambil nama bulan dalam Bahasa Indonesia.
 * Contoh: 7 → "Juli"
 */
export function getMonthName(month: number): string {
  return new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(
    new Date(2000, month - 1, 1)
  )
}
