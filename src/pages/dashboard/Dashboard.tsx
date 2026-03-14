import { 
  Users, Banknote, ClipboardCheck, Moon, 
  ArrowUpRight, Wallet, FileText, UserPlus, Handshake, TrendingUp 
} from 'lucide-react';
import { cn } from '../../utils/cn';

const Dashboard = () => {
  // Data Hardcoded sesuai Mockup Premium
  const stats = [
    { label: 'Total Anggota', value: '247', sub: '▲ 12 baru', trend: 'up', icon: <Users size={20} />, color: 'teal' },
    { label: 'AUM Simpanan', value: 'Rp 4,7M', sub: '▲ 8,2%', trend: 'up', icon: <Banknote size={20} />, color: 'gold' },
    { label: 'Pembiayaan Aktif', value: 'Rp 2,1M', sub: '▼ 2 macet', trend: 'down', icon: <ClipboardCheck size={20} />, color: 'green' },
    { label: 'ZISWAF YTD', value: 'Rp 84Jt', sub: '▲ 15%', trend: 'up', icon: <Moon size={20} />, color: 'blue' },
  ];

  // Data untuk Grafik Batang (9 Bulan Terakhir)
  const chartsData = [
    { month: 'Jul', val: 38 }, { month: 'Agt', val: 41 }, { month: 'Sep', val: 44 },
    { month: 'Okt', val: 43 }, { month: 'Nov', val: 47 }, { month: 'Des', val: 48 },
    { month: 'Jan', val: 51 }, { month: 'Feb', val: 53 }, { month: 'Mar', val: 56 }
  ];

  const recentActivities = [
    { icon: <Wallet className="text-emerald-500" />, title: 'Setor Simpanan', sub: 'KSP-001 · Rangga Permana', amount: '+Rp 500.000', type: 'pos', bg: 'bg-emerald-500/10' },
    { icon: <FileText className="text-cyan" />, title: 'Pembayaran Angsuran', sub: 'PMB-2024-001 · Murabahah', amount: '-Rp 1.041.667', type: 'neg', bg: 'bg-cyan/10' },
    { icon: <Moon className="text-amber-500" />, title: 'Zakat Profesi', sub: 'KSP-002 · Siti Rahayu', amount: '+Rp 850.000', type: 'pos', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-[#e8f0f4] shadow-sm relative overflow-hidden group">
            <div className={cn(
              "absolute top-0 left-0 right-0 h-1",
              stat.color === 'teal' ? "bg-cyan" : 
              stat.color === 'gold' ? "bg-amber-400" : 
              stat.color === 'green' ? "bg-emerald-500" : "bg-blue-500"
            )} />
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-[#96b0bc] uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-[#0A3D62] font-fraunces leading-tight">{stat.value}</h3>
              </div>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                stat.color === 'teal' ? "bg-cyan/10 text-cyan" : 
                stat.color === 'gold' ? "bg-amber-100 text-amber-600" : 
                stat.color === 'green' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
              )}>
                {stat.icon}
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <span className={cn(
                "text-[11px] font-bold",
                stat.trend === 'up' ? "text-emerald-500" : "text-red-500"
              )}>
                {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. CHARTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grafik Batang Simpanan (DIREVISI) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-[#e8f0f4] shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-lg font-bold text-[#0A3D62] font-fraunces">Pertumbuhan AUM Simpanan</h3>
              <p className="text-xs text-[#96b0bc] font-medium mt-1">9 bulan terakhir · dalam juta rupiah</p>
            </div>
            <button className="text-[11px] font-bold text-cyan bg-cyan/5 px-4 py-2 rounded-xl border border-cyan/10 hover:bg-cyan/10 transition-colors">
              Lihat Laporan
            </button>
          </div>
          
          {/* Area Render Batang Grafik */}
          <div className="flex items-end justify-between h-48 gap-3 mt-auto">
            {chartsData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                {/* Batang Grafik dengan Animasi */}
                <div 
                  className="w-full bg-gradient-to-t from-[#0FA3B1] to-[#1ECAD3] rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-110 relative"
                  style={{ height: `${(d.val / 60) * 100}%` }}
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0A1628] text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20">
                    Rp {d.val}M
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#96b0bc] uppercase tracking-tighter">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Komposisi Akad (Dark Card) */}
        <div className="bg-[#0A1628] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl flex flex-col">
           <div className="relative z-10 h-full">
             <h3 className="text-lg font-bold font-fraunces mb-1">Komposisi Akad</h3>
             <p className="text-xs text-white/40 mb-8 font-medium">Berdasarkan nilai outstanding</p>
             
             <div className="space-y-6 mt-4">
                {[
                  { name: 'Murabahah', val: '38%', color: 'bg-cyan' },
                  { name: 'Ijarah', val: '29%', color: 'bg-emerald-400' },
                  { name: 'Mudharabah', val: '19%', color: 'bg-amber-400' },
                  { name: 'Musyarakah', val: '14%', color: 'bg-blue-400' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[1.5px]">
                      <span className="text-white/70">{item.name}</span>
                      <span className="text-cyan">{item.val}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: item.val }} />
                    </div>
                  </div>
                ))}
             </div>
           </div>
           {/* Glow Decoration */}
           <div className="absolute top-[-20%] right-[-20%] w-64 h-64 rounded-full bg-cyan/10 blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* 3. ACTIVITY & PENDING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-[#e8f0f4] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#f0f4f8] flex justify-between items-center">
            <h3 className="font-bold text-[#0A3D62] font-fraunces">Aktivitas Terbaru</h3>
            <ArrowUpRight className="w-4 h-4 text-[#96b0bc]" />
          </div>
          <div className="p-3 space-y-1">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-[#F0F4F8]/50 rounded-2xl transition-all group">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", act.bg)}>
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-[#0A3D62] truncate">{act.title}</h4>
                  <p className="text-[11px] text-[#96b0bc] font-medium">{act.sub}</p>
                </div>
                <span className={cn("text-[13px] font-bold", act.type === 'pos' ? "text-emerald-500" : "text-red-500")}>
                  {act.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#e8f0f4] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#f0f4f8] flex justify-between items-center">
            <h3 className="font-bold text-[#0A3D62] font-fraunces">Pengajuan Menunggu</h3>
            <span className="text-[9px] font-bold bg-amber-100 text-amber-600 px-2 py-1 rounded-lg uppercase tracking-wider">4 Action</span>
          </div>
          <div className="p-3 space-y-1">
            {[
              { title: 'Qard Hassan Pending', sub: 'KSP-004 · Dewi Lestari · Rp 2jt', label: 'Tinjau' },
              { title: 'KYC Terverifikasi', sub: '3 anggota menunggu verifikasi', label: 'Proses' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-[#F0F4F8]/50 rounded-2xl transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-500">
                  <TrendingUp size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-[#0A3D62]">{item.title}</h4>
                  <p className="text-[11px] text-[#96b0bc] font-medium">{item.sub}</p>
                </div>
                <button className="text-[11px] font-bold text-white bg-[#0A3D62] px-4 py-2 rounded-xl hover:bg-navy transition-colors">
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;