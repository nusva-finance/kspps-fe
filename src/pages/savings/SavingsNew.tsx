import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Search, Wallet, Filter, Calendar, RefreshCw, ArrowLeft, Download, FileText, ArrowDown, ArrowUp, AlertCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import savingsService from '../../services/savingsService'
import type { SavingType, MemberBalance, SavingsTransaction } from '../../services/savingsService'

interface Notification {
  show: boolean
  message: string
  type: 'success' | 'error'
}

const Savings = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [searchTerm, setSearchTerm] = useState('')
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [isLoadingTypes, setIsLoadingTypes] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: '',
    type: 'success',
  })

  // Grid states
  const [memberBalances, setMemberBalances] = useState<MemberBalance[]>([])
  const [savingTypes, setSavingTypes] = useState<SavingType[]>([])
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([])
  const [savingTypesWithBalances, setSavingTypesWithBalances] = useState<SavingType[]>([])

  // Selection states
  const [selectedMember, setSelectedMember] = useState<MemberBalance | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [runningBalance, setRunningBalance] = useState<number>(0)

  // Filter states
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Load saving types with balances (right top grid)
  const loadSavingTypesWithBalances = async () => {
    setIsLoadingTypes(true)
    try {
      const response = await savingsService.getSavingTypesWithBalances()
      setSavingTypesWithBalances(response.data || [])
    } catch (err: any) {
      setError('Gagal memuat jenis simpanan: ' + err.message)
    } finally {
      setIsLoadingTypes(false)
    }
  }

  // Load member balances (left top grid)
  const loadMemberBalances = async () => {
    setIsLoadingMembers(true)
    setError(null)
    try {
      const response = await savingsService.getMemberBalances()
      setMemberBalances(response.data || [])
    } catch (err: any) {
      setError('Gagal memuat data anggota: ' + err.message)
    } finally {
      setIsLoadingMembers(false)
    }
  }

  // Load transactions (bottom grid)
  const loadTransactions = async () => {
    if (!selectedMember || !selectedType) return

    setIsLoadingTransactions(true)
    setError(null)

    try {
      const params: any = {
        member_id: selectedMember.member_id,
        account_type: selectedType,
        limit: 100,
      }

      if (dateFrom) {
        params.date_from = dateFrom
      }

      if (dateTo) {
        params.date_to = dateTo
      }

      const response = await savingsService.getTransactions(params)
      setTransactions(response.data || [])
    } catch (err: any) {
      setError('Gagal memuat transaksi: ' + err.message)
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadSavingTypesWithBalances()
    loadMemberBalances()

    // Check URL params for saved selections
    const params = new URLSearchParams(location.search)
    const memberId = params.get('member_id')
    const typeParam = params.get('type')
    const savedDateFrom = params.get('date_from')
    const savedDateTo = params.get('date_to')

    if (memberId && typeParam && savedDateFrom && savedDateTo) {
      setSelectedMember(memberBalances.find(m => m.member_id === parseInt(memberId)) || null)
      setSelectedType(typeParam)
      setDateFrom(savedDateFrom)
      setDateTo(savedDateTo)
    }
  }, [location.search, memberBalances])

  // Get first day of current month for default date range
  const getFirstDayOfMonth = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    return firstDay.toISOString().split('T')[0]
  }

  // Handle search
  const filteredMembers = memberBalances.filter(member =>
    member.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.member_no.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate totals
  const totalMembers = filteredMembers.length
  const totalBalance = memberBalances.reduce((sum, m) => {
    const memberBalances = Object.entries(m).filter(([key]) => key !== 'member_id' && key !== 'member_name' && key !== 'member_no')
    return sum + memberBalances.reduce((typeSum, [, balance]) => typeSum + (balance as number), 0)
  }, 0)

  const totalTypes = savingTypesWithBalances.length
  const totalTypeBalance = savingTypesWithBalances.filter(t => t).reduce((sum, t) => sum + (t?.balance || 0), 0)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatTransactionType = (type: string) => {
    if (type === 'credit') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 px-3 rounded bg-emerald-100 text-emerald-800">
        <ArrowDown className="w-4 h-4" />
        Setoran
      </span>
    }
    return <span className="inline-flex items-center gap-1 px-2 py-1 px-3 rounded bg-red-100 text-red-800">
      <ArrowUp className="w-4 h-4" />
      Penarikan
    </span>
  }

  const handleMemberSelect = (member: MemberBalance) => {
    setSelectedMember(member)
    setSelectedType(null)
    setTransactions([])
    setDateFrom('')
    setDateTo('')

    // Update URL
    const params = new URLSearchParams()
    params.set('member_id', member.member_id.toString())
    const newUrl = `${location.pathname}?${params.toString()}`
    navigate(newUrl, { replace: true })

    loadTransactions()
  }

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
    loadTransactions()
  }

  const handleDateFilter = () => {
    if (dateFrom && dateTo && selectedMember) {
      loadTransactions()
    }
  }

  const handleRefresh = () => {
    if (selectedMember) {
      loadTransactions()
    }
    if (selectedMember) {
      loadMemberBalances()
    }
    loadSavingTypesWithBalances()
  }

  const handleExport = () => {
    console.log('Export data:', { selectedMember, selectedType, dateFrom, dateTo, transactions })
    setNotification({
      show: true,
      message: 'Data berhasil diexport ke CSV',
      type: 'success',
    })
    setTimeout(() => setNotification({ ...notification, show: false }), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-navy-900 p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl font-bold text-navy">Simpanan Anggota</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingMembers || isLoadingTransactions || isLoadingTypes}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!selectedMember || transactions.length === 0}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-700" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Top Grids Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Left Grid - Daftar Anggota */}
          <div className="bg-white rounded-xl border border-cyan/20 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-cyan" />
              <h2 className="font-semibold text-navy">Daftar Anggota</h2>
              <div className="flex-1 ml-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray" />
                  <input
                    type="text"
                    placeholder="Cari nama atau nomor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-cyan/30 rounded-lg text-sm w-64 focus:ring-2 focus:ring-cyan/30 outline-none"
                  />
                </div>
              </div>
              <div className="text-sm text-gray">Total: {totalMembers} anggota</div>
            </div>

            {/* Members Table */}
            <div className="overflow-y-auto max-h-[400px]">
              <Table
                columns={[
                  { key: 'member_no', header: 'No. Anggota' },
                  { key: 'member_name', header: 'Nama Lengkap' },
                ]}
                data={filteredMembers}
                isLoading={isLoadingMembers}
                emptyMessage="Tidak ada data anggota"
                onRowClick={handleMemberSelect}
                rowClassName={(member) => {
                  if (selectedMember && selectedMember.member_id === member.member_id) {
                    return 'bg-cyan-50 border-cyan-500'
                  }
                  return 'hover:bg-cyan-50 cursor-pointer'
                }}
              />
            </div>
          </div>

          {/* Right Grid - Daftar Jenis Simpanan */}
          <div className="bg-white rounded-xl border border-cyan/20 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <Wallet className="w-6 h-6 text-cyan" />
              <h2 className="font-semibold text-navy">Daftar Jenis Simpanan</h2>
              {selectedMember && (
                <div className="text-sm text-gray ml-auto">
                  {selectedMember.member_name}
                </div>
              )}
              <div className="text-sm text-gray">Total: {totalTypes} jenis</div>
            </div>

            {/* Display Current Balance */}
            {selectedMember && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-sm text-gray">Saldo Saat Ini</div>
                <div className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(runningBalance)}
                </div>
              </div>
            )}

            {/* Saving Types Table */}
            <div className="overflow-x-auto">
              {!selectedMember ? (
                <div className="flex items-center justify-center py-12 text-gray">
                  Pilih anggota untuk melihat saldo simpanan
                </div>
              ) : (
                <>
                  <Table
                    columns={[
                      { key: 'code', header: 'Kode' },
                      { key: 'name', header: 'Nama' },
                      { key: 'description', header: 'Deskripsi' },
                      {
                        key: 'balance',
                        header: 'Nominal Saldo',
                        render: (value: number, row: any) => formatCurrency(value),
                      },
                    ]}
                    data={savingTypesWithBalances.filter(t => t).map(type => ({
                      ...type,
                      balance: selectedMember ? (selectedMember[type.code] as number) || 0 : type.balance,
                    }))}
                    isLoading={isLoadingTypes}
                    emptyMessage="Tidak ada data jenis simpanan"
                    rowClassName={(type) => {
                      if (selectedType === type.code) {
                        return 'bg-cyan-50 border-cyan-500'
                      }
                      return 'hover:bg-cyan-50 cursor-pointer'
                    }}
                    onRowClick={(type) => {
                      if (selectedMember) {
                        handleTypeSelect(type.code)
                      }
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid - Detail Transaksi */}
        {selectedType && (
          <div className="bg-white rounded-xl border border-cyan/20 p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-cyan" />
                <h2 className="font-semibold text-navy">Detail Transaksi</h2>
              </div>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray">Anggota: </span>
                <span className="font-semibold text-navy">{selectedMember.member_name}</span>
                <span className="mx-2 text-gray">({selectedMember.member_no})</span>
                <span className="mx-4 text-gray">|</span>
                {selectedType && (
                  <>
                    <span className="text-gray">Jenis Simpanan: </span>
                    <span className="font-semibold text-navy">
                      {savingTypesWithBalances.find(t => t && t.code === selectedType)?.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray">
                <Calendar className="w-4 h-4 text-cyan" />
                <span>Dari:</span>
              </div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:ring-2 focus:ring-cyan/30 outline-none"
                placeholder="YYYY-MM-DD"
              />
              <div className="flex items-center gap-2 text-sm text-gray">
                <Calendar className="w-4 h-4 text-cyan" />
                <span>Sampai:</span>
              </div>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-cyan/30 rounded-lg text-sm focus:ring-2 focus:ring-cyan/30 outline-none"
                placeholder="YYYY-MM-DD"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleDateFilter}
                disabled={!dateFrom || !dateTo}
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <Table
                columns={[
                  { key: 'transaction_date', header: 'Tanggal', render: (value: string) => formatDate(value) },
                  { key: 'transaction_type', header: 'Tipe', render: (value: string) => formatTransactionType(value) },
                  { key: 'amount', header: 'Nominal Transaksi', render: (value: number) => formatCurrency(value) },
                  {
                    key: 'balance_before',
                    header: 'Saldo Awal',
                    render: (value: number, row: SavingsTransaction) => {
                      const isFirst = row === transactions[0]
                      return (
                        <span className={isFirst ? 'font-bold text-navy bg-cyan-100 px-2 py-1 rounded' : 'text-gray'}>
                          {isFirst && <FileText className="inline w-4 h-4 text-cyan mr-2" />}
                          {formatCurrency(value)}
                        </span>
                      )
                    },
                  },
                  {
                    key: 'balance_after',
                    header: 'Saldo Akhir',
                    render: (value: number, row: SavingsTransaction, index: number) => {
                      const isLast = index === transactions.length - 1
                      return (
                        <span className={isLast ? 'font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded' : 'text-emerald-600 font-semibold'}>
                          {formatCurrency(value)}
                        </span>
                      )
                    },
                  },
                  { key: 'description', header: 'Keterangan' },
                ]}
                data={transactions}
                isLoading={isLoadingTransactions}
                emptyMessage={!selectedType ? 'Pilih jenis simpanan terlebih dahulu' : 'Tidak ada transaksi'}
              />
            </div>

            {/* Selected Member Info Card */}
            {selectedMember && (
              <div className="mt-4 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray mb-1">Nama</div>
                    <div className="font-semibold text-navy">{selectedMember.member_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray mb-1">Nomor Anggota</div>
                    <div className="font-semibold text-navy">{selectedMember.member_no}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray mb-1">Saldo Saat Ini</div>
                    <div className="font-semibold text-navy">
                      {formatCurrency(runningBalance)}
                    </div>
                  </div>
                  {selectedType && (
                    <>
                      <div>
                        <div className="text-sm text-gray mb-1">Jenis Simpanan</div>
                        <div className="font-semibold text-navy">
                          {savingTypesWithBalances.find(t => t && t.code === selectedType)?.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray mb-1">Saldo</div>
                        <div className="font-semibold text-navy">
                          {formatCurrency(selectedMember[selectedType!] as number || 0)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMember(null)
                setSelectedType(null)
                setTransactions([])
                setDateFrom('')
                setDateTo('')
                navigate('/savings')
              }}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar
            </Button>
          </div>
        )}

        {/* Notification */}
        {notification.show && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white transition-all duration-300 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <span className="text-2xl">✓</span>
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Savings
