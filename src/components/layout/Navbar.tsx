import { Search, Bell, Upload, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 bg-white border-b border-[#e2e8f0] sticky top-0 z-30">
      {/* Search Area di Tengah (Sesuai Mockup 63) */}
      <div className="flex-1 flex justify-center max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96b0bc]" />
          <input 
            type="text" 
            placeholder="Cari anggota, transaksi..." 
            className="w-full bg-[#F0F4F8] border border-[#e2e8f0] rounded-lg py-2 pl-10 pr-4 text-sm text-[#0A3D62] outline-none focus:border-cyan/30 transition-all"
          />
        </div>
      </div>

      {/* Action Area Kanan */}
      <div className="flex items-center gap-3 ml-4">
        <button className="p-2 text-[#96b0bc] hover:bg-gray-100 rounded-lg transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button className="p-2 text-[#96b0bc] hover:bg-gray-100 rounded-lg transition-all">
          <Upload size={20} />
        </button>
        
        {/* User Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1ECAD3]/10 border border-[#1ECAD3]/20 rounded-lg cursor-pointer ml-2">
          <div className="w-6 h-6 rounded-full bg-cyan flex items-center justify-center text-[10px] font-bold text-white uppercase">
            SA
          </div>
          <span className="text-xs font-bold text-[#0A3D62]">Super Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;