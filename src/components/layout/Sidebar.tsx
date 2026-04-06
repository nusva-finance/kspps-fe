import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wallet, ClipboardList,
  Handshake, Moon, BarChart3, Settings, LogOut,
  ChevronLeft, Menu, UserCog, Percent, SlidersHorizontal, Package, CreditCard, FileSpreadsheet
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { label: 'UTAMA', type: 'header' },
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { label: 'ANGGOTA & KYC', type: 'header' },
    { icon: <Users size={20} />, label: 'Anggota', path: '/members', badge: '12' },
    { label: 'KEUANGAN', type: 'header' },
    { icon: <Wallet size={20} />, label: 'Simpanan', path: '/simpanan' },
    { icon: <Wallet size={20} />, label: 'Mutasi Simpanan', path: '/savings' },
    { icon: <Handshake size={20} />, label: 'Pembiayaan', path: '/pembiayaan' },
    { label: 'SOSIAL', type: 'header' },
    { icon: <Moon size={20} />, label: 'ZISWAF', path: '/ziswaf' },
    { label: 'AKUNTANSI', type: 'header' },
    { icon: <FileSpreadsheet size={20} />, label: 'Mutasi Rekening', path: '/mutasi-rekening' },
    { icon: <BarChart3 size={20} />, label: 'SHU & Laporan', path: '/shu' },
    { label: 'SETUP', type: 'header' },
    { icon: <Percent size={20} />, label: 'Margin', path: '/margins' },
    { icon: <Package size={20} />, label: 'Kategori Barang', path: '/kategori-barang' },
    { icon: <CreditCard size={20} />, label: 'Rekening', path: '/rekening' },
    { label: 'SISTEM', type: 'header' },
    { icon: <UserCog size={20} />, label: 'User Admin', path: '/users' }, // MENU USER DIMUNCULKAN LAGI
    { icon: <Settings size={20} />, label: 'Pengaturan', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={cn(
      "flex-shrink-0 h-screen flex flex-col bg-[#0A1628] border-r border-white/5 transition-all duration-300 ease-in-out relative z-50",
      isCollapsed ? "w-[80px]" : "w-[260px]"
    )}>
      
      {/* Tombol Toggle Bulat Cyan */}
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
        className="absolute -right-3 top-20 w-6 h-6 bg-cyan rounded-full flex items-center justify-center text-navy shadow-lg border-2 border-[#F0F4F8] hover:scale-110 transition-transform z-[60]"
      >
        {isCollapsed ? <Menu size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Brand Section */}
      <div className={cn(
        "p-6 flex items-center gap-3 border-b border-white/5 overflow-hidden whitespace-nowrap",
        isCollapsed && "justify-center px-0"
      )}>
        <div className="w-10 h-10 bg-gradient-to-br from-[#0FA3B1] to-[#1ECAD3] rounded-xl flex-shrink-0 flex items-center justify-center text-xl shadow-lg shadow-cyan/20">
          🕌
        </div>
        {!isCollapsed && (
          <div className="flex flex-col animate-in fade-in duration-500">
            <strong className="font-fraunces text-white text-[15px] font-semibold leading-none text-nowrap">Nusva Admin</strong>
            <span className="text-[10px] text-cyan uppercase tracking-wider font-medium mt-1">KSPPS Panel</span>
          </div>
        )}
      </div>

      {/* Admin Profile Card */}
      {!isCollapsed && (
        <div className="m-4 p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C8A96E] to-[#f0d9a8] flex-shrink-0 flex items-center justify-center text-navy font-bold text-xs">
            SA
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-white text-xs font-bold truncate">Super Admin</span>
            <span className="text-[10px] text-white/40 truncate">admin@nusvafinansial.id</span>
          </div>
        </div>
      )}

      {/* Navigation Area */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar overflow-x-hidden">
        {menuItems.map((item, idx) => {
          if (item.type === 'header') {
            return !isCollapsed ? (
              <div key={idx} className="px-3 pt-5 pb-2 text-[10px] font-bold text-white/20 tracking-[1.5px] uppercase">
                {item.label}
              </div>
            ) : <div key={idx} className="h-4" />;
          }

          const isActive = location.pathname === item.path;

          return (
            <div
              key={idx}
              onClick={() => navigate(item.path || '/')}
              title={isCollapsed ? item.label : ''}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 relative",
                isActive 
                  ? "bg-cyan/10 text-cyan border border-cyan/10 shadow-[0_0_15px_rgba(30,202,211,0.05)]" 
                  : "text-white/40 hover:bg-white/5 hover:text-white/70",
                isCollapsed && "justify-center px-0 mx-2"
              )}
            >
              <span className={cn(
                "transition-colors",
                isActive ? "text-cyan" : "text-white/30 group-hover:text-white/60"
              )}>
                {item.icon}
              </span>
              
              {!isCollapsed && (
                <span className="text-[13px] font-medium whitespace-nowrap flex-1">
                  {item.label}
                </span>
              )}

              {!isCollapsed && item.badge && (
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                  item.label === 'Anggota' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                )}>
                  {item.badge}
                </span>
              )}

              {isCollapsed && isActive && (
                <div className="absolute left-0 w-1 h-6 bg-cyan rounded-r-full shadow-[0_0_8px_rgba(30,202,211,0.8)]" />
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-white/5">
        <div 
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:bg-red-500/10 hover:text-red-400 cursor-pointer transition-all",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-[13px] font-medium">Keluar</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;