import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Download, RefreshCw, Users, Edit3 } from 'lucide-react'
import * as XLSX from 'xlsx' // Import library Excel
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import memberService from '../../services/memberService'

// Helper format tanggal dd/MM/yy
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

interface Member {
  id: number
  member_no: string
  full_name: string
  gender: string
  join_date: string
  phone_number: string
  company_name?: string
  job_title?: string
  is_active: boolean
}

const Members = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [memberData, setMemberData] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalMembers, setTotalMembers] = useState(0)

  const loadMembers = async () => {
    setIsLoading(true)
    try {
      const response = await memberService.getMembers(1, 1000, '')
      const data = response.data || response || []
      setMemberData(Array.isArray(data) ? data : [])
      setTotalMembers(response.total || data.length || 0)
    } catch (error) {
      console.error('Gagal memuat data anggota:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  // --- FUNGSI EXCEL EXPORT ---
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    // 1. Mapping data agar header Excel sesuai dengan Nama Kolom di Grid
    const dataToExport = filteredData.map(m => ({
      'ID ANGGOTA': m.member_no,
      'NAMA LENGKAP': m.full_name,
      'PERUSAHAAN': m.company_name || '-',
      'JABATAN': m.job_title || '-',
      'TGL GABUNG': formatDate(m.join_date),
      'STATUS': m.is_active ? 'Aktif' : 'Non-aktif',
      'NO HP': m.phone_number || '-'
    }));

    // 2. Buat Worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // 3. Buat Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Anggota");

    // 4. Generate file & Download
    XLSX.writeFile(workbook, `Data_Anggota_KSPPS_${new Date().getTime()}.xlsx`);
  };

  const columns = [
    { 
      key: 'member_no', 
      header: 'ID ANGGOTA',
      render: (v: string) => <span className="font-mono font-bold text-cyan text-xs">{v || '-'}</span>
    },
    { 
      key: 'full_name', 
      header: 'NAMA LENGKAP',
      render: (v: string) => <span className="font-bold text-[#0A3D62]">{v}</span>
    },
    { 
      key: 'company_name', 
      header: 'PERUSAHAAN',
      render: (v: string) => <span className="text-[#5a7a8a]">{v || '-'}</span>
    },
    { 
      key: 'job_title', 
      header: 'JABATAN',
      render: (v: string) => <span className="text-[#5a7a8a]">{v || '-'}</span>
    },
    { 
      key: 'join_date', 
      header: 'TGL GABUNG',
      render: (v: string) => <span className="text-gray-500">{formatDate(v)}</span>
    },
    { 
      key: 'is_active', 
      header: 'STATUS',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Aktif' : 'Non-aktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'AKSI',
      render: (_: any, row: Member) => (
        <div className="flex gap-1">
          <button 
            onClick={() => navigate(`/members/${row.id}/edit`)}
            className="p-1.5 hover:bg-cyan/10 text-[#96b0bc] hover:text-cyan rounded-lg transition-colors"
          >
            <Edit3 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const filteredData = memberData.filter((m) =>
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.member_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0f4] overflow-hidden">
        
        {/* TOOLBAR PANEL 1 BARIS */}
        <div className="p-4 md:p-6 border-b border-[#f0f4f8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-cyan/10 rounded-xl flex items-center justify-center text-cyan shrink-0">
              <Users size={20} />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-[#0A3D62] font-fraunces leading-none">Data Anggota</h2>
              <p className="text-[10px] text-[#96b0bc] font-bold uppercase tracking-widest mt-1">Database Koperasi</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            {/* Search Input */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#96b0bc]" />
              <input
                type="text"
                placeholder="Cari nama/perusahaan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#F0F4F8] border border-[#e2e8f0] rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-cyan/40 transition-all"
              />
            </div>

            {/* Refresh */}
            <button 
              onClick={loadMembers}
              disabled={isLoading}
              className="flex items-center justify-center h-10 w-10 md:w-auto md:px-4 border border-[#e2e8f0] rounded-xl text-[#5a7a8a] hover:bg-gray-50 transition-all shrink-0"
            >
              <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : ''} md:mr-2`} />
              <span className="hidden md:inline text-[11px] font-bold uppercase">Refresh</span>
            </button>

            {/* TOMBOL EXCEL (AKTIF) */}
            <button 
              onClick={handleExportExcel}
              className="flex items-center justify-center h-10 w-10 md:w-auto md:px-4 border border-[#e2e8f0] rounded-xl text-[#5a7a8a] hover:bg-gray-50 transition-all shrink-0"
            >
              <Download size={14} className="md:mr-2" />
              <span className="hidden md:inline text-[11px] font-bold uppercase">Export</span>
            </button>

            {/* Tambah */}
            <button 
              onClick={() => navigate('/members/add')}
              className="flex items-center h-10 px-4 md:px-6 bg-gradient-to-r from-[#0FA3B1] to-[#1ECAD3] text-white rounded-xl shadow-lg shadow-cyan/20 hover:brightness-105 transition-all shrink-0 whitespace-nowrap"
            >
              <Plus size={18} className="mr-1.5" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Tambah Anggota</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table 
            columns={columns} 
            data={filteredData} 
            isLoading={isLoading} 
            emptyMessage="Tidak ada data anggota yang ditemukan."
          />
        </div>
        
        {/* Footer info */}
        <div className="px-6 py-4 bg-[#fafcfe] border-t border-[#f0f4f8]">
           <span className="text-[11px] text-[#96b0bc] font-bold uppercase tracking-widest">
            Total {filteredData.length} Anggota Terdaftar
          </span>
        </div>
      </div>
    </div>
  )
}

export default Members