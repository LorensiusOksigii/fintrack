import { formatCurrency } from '@/lib/utils'
import type { MonthlySummary } from '@/types'
import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react'

interface Props {
  data: MonthlySummary | undefined
  isLoading: boolean
}

interface CardProps {
  label: string
  value: string
  icon: React.ReactNode
  valueClass: string
}

function Card({ label, value, icon, valueClass }: CardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-5 w-5 bg-muted rounded" />
      </div>
      <div className="h-8 w-36 bg-muted rounded" />
    </div>
  )
}

export default function SummaryCards({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  const income  = parseFloat(data?.total_income  ?? '0')
  const expense = parseFloat(data?.total_expense ?? '0')
  const balance = parseFloat(data?.balance       ?? '0')

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card
        label="Total Pemasukan"
        value={formatCurrency(income)}
        valueClass="text-green-600"
        icon={<ArrowUpCircle className="h-5 w-5 text-green-500" />}
      />
      <Card
        label="Total Pengeluaran"
        value={formatCurrency(expense)}
        valueClass="text-red-500"
        icon={<ArrowDownCircle className="h-5 w-5 text-red-500" />}
      />
      <Card
        label="Saldo"
        value={formatCurrency(balance)}
        valueClass={balance >= 0 ? 'text-foreground' : 'text-red-500'}
        icon={<Wallet className="h-5 w-5 text-muted-foreground" />}
      />
    </div>
  )
}
