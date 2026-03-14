import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // State ini yang mengontrol lebar sidebar di seluruh aplikasi
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen w-full bg-[#F0F4F8] overflow-hidden relative font-sans">
      
      {/* SIDEBAR: Kirim state isCollapsed dan fungsi onToggle ke komponen Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={toggleSidebar} 
      />

      {/* MAIN CONTENT AREA: bg-[#F0F4F8] memastikan area ini tetap terang */}
      <div className="flex flex-col flex-1 min-w-0 bg-[#F0F4F8] relative">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          {/* Aksen pendaran cahaya tipis di pojok kanan atas agar tetap modern */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan/5 blur-[100px] pointer-events-none z-0" />
          
          <div className="relative z-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;