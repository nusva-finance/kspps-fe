import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, ArrowUp, ArrowDown, RefreshCw, Calendar } from 'lucide-react'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import savingsService from '../../services/savingsService'

interface SavingsTransaction {
  id: number
  member_id: number
  member_no: string
  member_name: string
  account_type: string
  transaction_type: 'credit' | 'debit'
  amount: number
  transaction_date: string
  description: string
  rekening_id: number | null
  rekening_name?: string
  rekening_no?: string
  created_at: string
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  pokok: 'Simpanan Pokok',
  wajib: 'Simpanan Wajib',
  modal: 'Simpanan Modal',
  manasuka: 'Simpanan Manasuka',
}

// Helper function to get 1st day of previous month
const getFirstDayOfPrevMonth = () => {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  // Format as YYYY-MM-DD using local timezone
  const year = firstDay.getFullYear()
  const month = String(firstDay.getMonth() + 1).padStart(2, '0')
  const day = String(firstDay.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper function to get today's date
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const Simpanan = () => {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState<SavingsTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Date filter state
  const [dateFrom, setDateFrom] = useState(getFirstDayOfPrevMonth())
  const [dateTo, setDateTo] = useState(getTodayDate())

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await savingsService.getAllTransactions({ limit: 500 })
      // Sort by date descending (newest first)
      const sortedData = (response.data || []).sort((a: SavingsTransaction, b: SavingsTransaction) =>
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      )
      setTransactions(sortedData)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  // Filter transactions by search term and date range
  const filteredTransactions = transactions.filter(t => {
    // Search filter
    const matchesSearch = t.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.member_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())

    // Date range filter
    const transactionDate = t.transaction_date?.split('T')[0]
    const matchesDateFrom = !dateFrom || transactionDate >= dateFrom
    const matchesDateTo = !dateTo || transactionDate <= dateTo

    return matchesSearch && matchesDateFrom && matchesDateTo
  })

  const formatCurrency = (value: number, type: 'credit' | 'debit') => {
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Math.abs(value))

    return type === 'credit' ? `+${formatted}` : `-${formatted}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await savingsService.deleteTransaction(deleteId)
      setTransactions(transactions.filter(t => t.id !== deleteId))
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Gagal menghapus transaksi')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-serif">Simpanan</h1>
          <p className="text-sm text-gray">Daftar transaksi simpanan anggota</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTransactions}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/simpanan/add')}
            className="inline-flex items-center whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Transaksi
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-cyan/20 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
            <input
              type="text"
              placeholder="Cari nama, nomor anggota, atau keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-cyan/30 rounded-lg text-sm focus:ring-2 focus:ring-cyan/30 outline-none"
            />
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:ring-2 focus:ring-cyan/30 outline-none"
            />
            <span className="text-gray text-sm">s/d</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:ring-2 focus:ring-cyan/30 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-cyan/20 overflow-hidden">
        <Table
          columns={[
            {
              key: 'member_no',
              header: 'ID Anggota',
              render: (value) => <span className="font-mono text-xs">{value}</span>
            },
            {
              key: 'member_name',
              header: 'Nama Anggota',
              render: (value) => <span className="font-medium text-navy">{value}</span>
            },
            {
              key: 'account_type',
              header: 'Jenis Simpanan',
              render: (value) => (
                <span className="px-2 py-1 bg-cyan/10 text-cyan text-xs rounded-full">
                  {ACCOUNT_TYPE_LABELS[value] || value}
                </span>
              )
            },
            {
              key: 'transaction_date',
              header: 'Tanggal',
              render: (value) => formatDate(value)
            },
            {
              key: 'amount',
              header: 'Nominal',
              className: 'text-right',
              render: (value, row) => (
                <span className={`font-semibold ${row.transaction_type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {row.transaction_type === 'credit' ? (
                    <ArrowDown className="inline w-4 h-4 mr-1" />
                  ) : (
                    <ArrowUp className="inline w-4 h-4 mr-1" />
                  )}
                  {formatCurrency(value, row.transaction_type)}
                </span>
              )
            },
            {
              key: 'description',
              header: 'Keterangan',
              className: 'max-w-[200px] truncate'
            },
            {
              key: 'actions',
              header: 'Aksi',
              render: (_, row) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/simpanan/${row.id}/edit`)}
                    className="p-1.5 rounded-lg hover:bg-cyan/10 text-cyan transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(row.id)}
                    className="p-1.5 rounded-lg hover:bg-red/10 text-red-500 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            },
          ]}
          data={filteredTransactions}
          isLoading={isLoading}
          emptyMessage="Tidak ada data transaksi"
        />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-navy mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray mb-4">
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Simpanan
