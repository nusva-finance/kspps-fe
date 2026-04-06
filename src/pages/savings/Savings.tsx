import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Wallet, FileText, Calendar, WalletCards, Search } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import savingsService from '../../services/savingsService'
import type { SavingType } from '../../services/savingsService'

const Savings = () => {
  const navigate = useNavigate()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [isLoadingTypes, setIsLoadingTypes] = useState(false)
  const [isLoadingMutasi, setIsLoadingMutasi] = useState(false)
  const [memberBalances, setMemberBalances] = useState([])
  const [savingTypes, setSavingTypes] = useState<SavingType[]>([])
  const [mutasiData, setMutasiData] = useState([])
  const [openingBalance, setOpeningBalance] = useState(0)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<any>(null)

  const today = new Date().toISOString().split('T')[0]
  const firstDayPrevMonth = () => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); d.setDate(1)
    return d.toISOString().split('T')[0]
  }
  const [startDate, setStartDate] = useState(firstDayPrevMonth())
  const [endDate, setEndDate] = useState(today)

  const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  })

  useEffect(() => {
    const loadInitial = async () => {
      setIsLoadingTypes(true); setIsLoadingMembers(true)
      try {
        const [typesRes, membersRes] = await Promise.all([
          savingsService.getSavingTypes(),
          savingsService.getMemberBalances()
        ])
        setSavingTypes(typesRes.data || typesRes)
        setMemberBalances(membersRes.data || membersRes)
      } catch (err) { console.error(err) } finally {
        setIsLoadingTypes(false); setIsLoadingMembers(false)
      }
    }
    loadInitial()
  }, [])

  useEffect(() => {
    const loadMutasi = async () => {
      if (!selectedMember || !selectedType) return
      setIsLoadingMutasi(true)
      try {
        const response = await savingsService.getTransactions({
          member_id: selectedMember.member_id,
          account_type: selectedType.code,
          date_from: startDate, // Ganti dari start_date
          date_to: endDate      // Ganti dari end_date
        })
        const responseData = response.data || response          // { data: { transactions, opening_balance }, total }
        const innerData = responseData.data || responseData     // { transactions, opening_balance }

        console.log('raw response:', response)  // cek dulu strukturnya
        
        setMutasiData(innerData.transactions || (Array.isArray(innerData) ? innerData : []))
        setOpeningBalance(innerData.opening_balance || 0)
      } catch (err) { console.error(err) } finally {
        setIsLoadingMutasi(false)
      }
    }
    loadMutasi()
  }, [selectedMember, selectedType, startDate, endDate])

  const filteredMembers = (Array.isArray(memberBalances) ? memberBalances : [])
    .filter((m: any) => m.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.member_no?.includes(searchTerm))
    .map((m: any) => ({ ...m, id: m.member_id }))

  const selectedMemberDetails = selectedMember ? savingTypes.map(type => ({
    ...type,
    type_name: type.name,
    balance_formatted: currencyFormatter.format(selectedMember[type.code] || 0)
  })) : []

  const getProcessedMutasi = () => {
    if (!selectedType) return []
    
    // 1. Inisialisasi baris Saldo Awal (Nilai openingBalance harusnya sudah dikirim Backend)
    const processed: any[] = [{
      id: 'opening-row', 
      reference_no: '-',
      tanggal: new Date(startDate).toLocaleDateString('id-ID'),
      transaksi: 'SALDO AWAL', 
      nominal: '-',
      saldo: currencyFormatter.format(openingBalance)
    }]

    let currentBalance = openingBalance

    // 2. FILTER: Hanya ambil transaksi yang berada di dalam range tanggal filter
    const filteredMutasi = mutasiData.filter((t: any) => {
      const tDate = t.transaction_date.split('T')[0]; // Ambil YYYY-MM-DD
      return tDate >= startDate && tDate <= endDate;
    }).sort((a: any, b: any) =>
      // Sort ascending by date (oldest first)
      new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    )

    // 3. Masukkan hasil filter ke list tabel
    filteredMutasi.forEach((t: any) => {
      t.transaction_type === 'credit' ? currentBalance += t.amount : currentBalance -= t.amount
      processed.push({
        ...t,
        tanggal: new Date(t.transaction_date).toLocaleDateString('id-ID'),
        transaksi: t.transaction_type === 'credit' ? 'Setoran' : 'Penarikan',
        nominal: currencyFormatter.format(t.amount),
        saldo: currencyFormatter.format(currentBalance),
      })
    })
    
    return processed
  }

  return (
    <div className="space-y-8 font-sans">
      {/* PAGE HEADER: FIX 1 BARIS & TIDAK GANJEL */}
      <div className="flex items-center justify-between">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-[#0A3D62] font-fraunces leading-none">Manajemen Simpanan</h1>
          <p className="text-[#96b0bc] text-sm mt-1.5 font-medium">Kelola rincian saldo anggota secara dinamis</p>
        </div>
        
        {/* Kontainer Action di Kanan */}
        <div className="flex items-center gap-3">
          {/* SEARCH BOX: Ukuran dikecilkan sedikit agar muat */}
          <div className="w-64">
            <Input 
              placeholder="Cari ID/Nama..." 
              className="h-10 text-xs"
              icon={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* BUTTON TRANSAKSI: Dibuat whitespace-nowrap agar tidak 2 baris */}
          <Button 
            variant="primary" 
            className="h-10 bg-[#1ECAD3] hover:bg-[#19b2ba] text-white font-bold px-4 text-xs whitespace-nowrap flex items-center shadow-sm"
            onClick={() => navigate('/savings/transaction/new')}
          >
            <Plus className="w-4 h-4 mr-1.5 flex-shrink-0" /> Transaksi
          </Button>
        </div>
      </div>

      {/* GRID AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DAFTAR ANGGOTA */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-[#0A1628] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest">Daftar Anggota</h3>
            </div>
            <span className="text-[9px] text-white/30 font-bold">{filteredMembers.length} DATA</span>
          </div>
          <div className="h-[280px] overflow-y-auto custom-scrollbar bg-white">
            <Table 
              columns={[{ key: 'member_no', header: 'ID ANGGOTA' }, { key: 'member_name', header: 'NAMA LENGKAP' }]} 
              data={filteredMembers} 
              isLoading={isLoadingMembers}
              onRowClick={(row) => { setSelectedMember(row); setSelectedType(null); }}
              rowClassName={(row) => selectedMember?.member_id === row.member_id ? 'bg-[#1ECAD3]/5 border-l-[4px] border-cyan' : ''}
            />
          </div>
        </div>

        {/* RINCIAN SALDO */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-[#0A1628] text-white flex items-center h-[47px]">
            <Wallet className="w-4 h-4 text-cyan mr-2" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest truncate">
              {selectedMember ? `RINCIAN: ${selectedMember.member_name}` : 'PILIH ANGGOTA'}
            </h3>
          </div>
          <div className="h-[280px] overflow-y-auto custom-scrollbar bg-white">
            {!selectedMember ? (
              <div className="h-full flex flex-col items-center justify-center text-[#96b0bc]/30">
                <WalletCards size={40} strokeWidth={1} />
                <p className="text-[10px] font-bold mt-2 tracking-tighter">SILAKAN PILIH MEMBER</p>
              </div>
            ) : (
              <Table 
                columns={[
                  { key: 'type_name', header: 'JENIS SIMPANAN' },
                  { key: 'balance_formatted', header: 'TOTAL SALDO', className: 'text-right font-bold text-[#0FA3B1]' }
                ]} 
                data={selectedMemberDetails} 
                isLoading={isLoadingTypes}
                onRowClick={(row) => setSelectedType(row)}
                rowClassName={(row) => selectedType?.id === row.id ? 'bg-[#1ECAD3]/5 border-l-[4px] border-cyan' : ''}
              />
            )}
          </div>
        </div>
      </div>

      {/* REKENING KORAN */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-[#0A1628] text-white flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-cyan" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest leading-none">Rekening Koran</h3>
              <p className="text-[9px] text-cyan/60 font-medium mt-1">Mutasi transaksi simpanan anggota</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 p-1.5 px-3 rounded-lg border border-white/10 shadow-inner">
            <Calendar size={12} className="text-cyan" />
            <input type="date" className="bg-transparent text-[10px] outline-none text-white cursor-pointer" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span className="text-white/20 text-[10px]">/</span>
            <input type="date" className="bg-transparent text-[10px] outline-none text-white cursor-pointer" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="min-h-[400px] bg-white">
          {!selectedType ? (
            <div className="py-24 text-center text-[#96b0bc] flex flex-col items-center">
              <FileText size={48} strokeWidth={0.5} className="mb-4 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-[2px] opacity-40">Pilih Tipe Simpanan di Atas</p>
            </div>
          ) : (
            <Table 
              columns={[
                { key: 'reference_no', header: 'NO. BUKTI' },
                { key: 'tanggal', header: 'TANGGAL' },
                { key: 'transaksi', header: 'JENIS' },
                { 
                  key: 'nominal', header: 'NOMINAL', className: 'text-right font-semibold',
                  render: (v, row) => <span className={row.transaction_type === 'debit' ? 'text-red-500 font-bold' : 'text-[#0A3D62]'}>{v}</span>
                },
                { key: 'saldo', header: 'SALDO', className: 'text-right text-[#0FA3B1] font-bold bg-cyan/5' },
                { key: 'description', header: 'KETERANGAN', className: 'text-[11px] text-[#96b0bc]' },
              ]} 
              data={getProcessedMutasi()} 
              isLoading={isLoadingMutasi}
              rowClassName={(row) => row.id === 'opening-row' ? 'bg-[#F0F4F8] italic font-medium' : ''}
              emptyMessage="Tidak ada mutasi pada periode ini"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Savings