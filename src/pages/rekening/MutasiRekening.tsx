import { useState, useEffect } from 'react'
import { Calendar, CreditCard, FileText, Search } from 'lucide-react'
import Input from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import rekeningService, { type Rekening, type MutasiTransaction } from '../../services/rekeningService'

const MutasiRekening = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoadingRekening, setIsLoadingRekening] = useState(false)
  const [isLoadingMutasi, setIsLoadingMutasi] = useState(false)
  const [rekeningList, setRekeningList] = useState<Rekening[]>([])
  const [selectedRekening, setSelectedRekening] = useState<Rekening | null>(null)
  const [mutasiData, setMutasiData] = useState<MutasiTransaction[]>([])
  const [openingBalance, setOpeningBalance] = useState(0)

  const today = new Date().toISOString().split('T')[0]
  const firstDayPrevMonth = () => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    d.setDate(1)
    return d.toISOString().split('T')[0]
  }
  const [startDate, setStartDate] = useState(firstDayPrevMonth())
  const [endDate, setEndDate] = useState(today)

  const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  })

  useEffect(() => {
    const loadRekening = async () => {
      setIsLoadingRekening(true)
      try {
        const response = await rekeningService.getRekenings()
        const data = response.data || []
        setRekeningList(data.filter((r: Rekening) => r.aktif))
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoadingRekening(false)
      }
    }
    loadRekening()
  }, [])

  useEffect(() => {
    const loadMutasi = async () => {
      if (!selectedRekening) return
      setIsLoadingMutasi(true)
      try {
        const response = await rekeningService.getMutasiRekening(
          selectedRekening.id,
          startDate,
          endDate
        )
        const responseData = response.data || response
        setMutasiData(responseData.transactions || [])
        setOpeningBalance(responseData.opening_balance || 0)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoadingMutasi(false)
      }
    }
    loadMutasi()
  }, [selectedRekening, startDate, endDate])

  const filteredRekening = rekeningList
    .filter((r) =>
      r.namarekening.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.norekening.includes(searchTerm)
    )
    .map((r) => ({
      ...r,
      id: r.id
    }))

  // Format tanggal dari string ISO ke format Indonesia
  const formatTanggal = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  const getProcessedMutasi = () => {
    if (!selectedRekening) return []

    // Baris Saldo Awal
    const processed: any[] = [{
      id: 'opening-row',
      idrekeningtransaction: '-',
      tanggaltransaksi: formatTanggal(startDate),
      debit: '-',
      kredit: '-',
      transactiontype: 'SALDO AWAL',
      idtabletransaction: '-',
      saldo: currencyFormatter.format(openingBalance)
    }]

    let currentBalance = openingBalance

    mutasiData.forEach((t) => {
      // 🔍 PASTIKAN field ini sesuai dengan JSON dari MutasiRekeningRow di Go
      const nominal = t.nominaltransaction || 0 
      
      // Logika Koperasi: Biasanya pengeluaran (kredit) dicatat negatif di DB
      // Jika nominal negatif, berarti uang keluar (Kredit). Jika positif, uang masuk (Debit).
      const isDebit = nominal > 0
      const absNominal = Math.abs(nominal)

      currentBalance += nominal // Langsung tambah karena nominal sudah membawa tanda +/-

      processed.push({
        id: t.idrekeningtransaction, // Gunakan idrekeningtransaction sesuai struct Go
        idrekeningtransaction: t.idrekeningtransaction,
        tanggaltransaksi: formatTanggal(t.tanggaltransaksi),
        // Tampilkan nilai positif di kolom Debit/Kredit
        debit: isDebit ? currencyFormatter.format(absNominal) : '-',
        kredit: !isDebit ? currencyFormatter.format(absNominal) : '-',
        transactiontype: t.transactiontype || '-',
        idtabletransaction: t.idtabletransaction || '-',
        saldo: currencyFormatter.format(currentBalance),
      })
    })

    return processed
  }

  return (
    <div className="space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-[#0A3D62] font-fraunces leading-none">Mutasi Rekening</h1>
          <p className="text-[#96b0bc] text-sm mt-1.5 font-medium">Lihat transaksi rekening dengan filter periode</p>
        </div>

        {/* SEARCH BOX */}
        <div className="w-64">
          <Input
            placeholder="Cari Rekening..."
            className="h-10 text-xs"
            icon={<Search size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* DAFTAR REKENING - ATAS */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden">
        <div className="px-5 py-3.5 bg-[#0A1628] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest">Daftar Rekening</h3>
          </div>
          <span className="text-[9px] text-white/30 font-bold">{filteredRekening.length} DATA</span>
        </div>
        <div className="max-h-[200px] overflow-y-auto custom-scrollbar bg-white">
          <Table
            columns={[
              { key: 'norekening', header: 'NO REKENING', className: 'w-40' },
              { key: 'namarekening', header: 'NAMA REKENING' },
              { key: 'deskripsi', header: 'DESKRIPSI', className: 'w-48' },
            ]}
            data={filteredRekening}
            isLoading={isLoadingRekening}
            onRowClick={(row) => setSelectedRekening(row as Rekening)}
            rowClassName={(row) =>
              selectedRekening?.id === row.id
                ? 'bg-[#1ECAD3]/5 border-l-[4px] border-cyan'
                : ''
            }
          />
        </div>
      </div>

      {/* MUTASI TRANSAKSI - BAWAH */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden">
        <div className="px-6 py-4 bg-[#0A1628] text-white flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-cyan" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest leading-none">
                {selectedRekening ? `MUTASI: ${selectedRekening.namarekening}` : 'PILIH REKENING'}
              </h3>
              <p className="text-[9px] text-cyan/60 font-medium mt-1">
                {selectedRekening ? `No. ${selectedRekening.norekening}` : 'Pilih rekening di atas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1.5 px-3 rounded-lg border border-white/10 shadow-inner">
            <Calendar size={12} className="text-cyan" />
            <input
              type="date"
              className="bg-transparent text-[10px] outline-none text-white cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-white/20 text-[10px]">s/d</span>
            <input
              type="date"
              className="bg-transparent text-[10px] outline-none text-white cursor-pointer"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="min-h-[400px] bg-white">
          {!selectedRekening ? (
            <div className="py-24 text-center text-[#96b0bc] flex flex-col items-center">
              <FileText size={48} strokeWidth={0.5} className="mb-4 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-[2px] opacity-40">
                Pilih Rekening di Atas
              </p>
            </div>
          ) : (
            <Table
              columns={[
                {
                  key: 'tanggaltransaksi',
                  header: 'TANGGAL',
                  className: 'w-28'
                },
                {
                  key: 'idrekeningtransaction',
                  header: 'NO BUKTI',
                  className: 'w-24',
                  render: (v) => <span className="text-xs">{v}</span>
                },
                {
                  key: 'debit',
                  header: 'DEBIT',
                  className: 'text-right font-semibold w-36',
                  render: (v, row) => (
                    <span className={row.id === 'opening-row' ? '' : v !== '-' ? 'text-green-600 font-bold' : ''}>
                      {v}
                    </span>
                  )
                },
                {
                  key: 'kredit',
                  header: 'KREDIT',
                  className: 'text-right font-semibold w-36',
                  render: (v, row) => (
                    <span className={row.id === 'opening-row' ? '' : v !== '-' ? 'text-red-500 font-bold' : ''}>
                      {v}
                    </span>
                  )
                },
                {
                  key: 'transactiontype',
                  header: 'TIPE TRANSAKSI',
                  className: 'w-32',
                  render: (v) => (
                    <span className="text-[10px] font-medium text-[#0A3D62] uppercase">
                      {v || '-'}
                    </span>
                  )
                },
                {
                  key: 'idtabletransaction',
                  header: 'NO BUKTI SUMBER',
                  className: 'w-28',
                  render: (v) => <span className="text-xs">{v}</span>
                },
                {
                  key: 'saldo',
                  header: 'SALDO',
                  className: 'text-right text-[#0FA3B1] font-bold bg-cyan/5 w-40'
                },
              ]}
              data={getProcessedMutasi()}
              isLoading={isLoadingMutasi}
              rowClassName={(row) =>
                row.id === 'opening-row' ? 'bg-[#F0F4F8] italic font-medium' : ''
              }
              emptyMessage="Tidak ada mutasi pada periode ini"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default MutasiRekening
