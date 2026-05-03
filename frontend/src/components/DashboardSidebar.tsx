"use client";

import React from 'react';
import { 
  LayoutDashboard, ShoppingBag, 
  Calendar, Settings, LogOut,
  PlusCircle, User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-neutral-500 group-hover:text-blue-400'} transition-colors`}>
      {icon}
    </span>
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </Link>
);

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 border-r border-white/5 bg-black h-screen sticky top-0 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <ShoppingBag className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-black text-white tracking-tighter">Smart<span className="text-blue-500">Dash</span></span>
      </div>

      <div className="space-y-2 flex-grow">
        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-4 px-4">Management</p>
        <SidebarItem 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          label="Overview" 
          href="/dashboard/provider" 
          active={pathname === '/dashboard/provider'}
        />
        <SidebarItem 
          icon={<ShoppingBag className="w-5 h-5" />} 
          label="My Services" 
          href="/dashboard/provider/services" 
          active={pathname.includes('/services')}
        />
        <SidebarItem 
          icon={<Calendar className="w-5 h-5" />} 
          label="Bookings" 
          href="/dashboard/provider/bookings" 
          active={pathname.includes('/bookings')}
        />
      </div>

      <div className="space-y-2 pt-8 border-t border-white/5">
         <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-4 px-4">Account</p>
         <SidebarItem 
          icon={<User className="w-5 h-5" />} 
          label="Profile" 
          href="/profile" 
        />
        <SidebarItem 
          icon={<Settings className="w-5 h-5" />} 
          label="Settings" 
          href="/settings" 
        />
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-red-500/10 hover:text-red-500 transition-all group">
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-bold text-sm tracking-tight">Logout</span>
        </button>
      </div>
    </div>
  );
}
