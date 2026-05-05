"use client";

import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, ShoppingBag, 
  Calendar, Settings, LogOut,
  PlusCircle, User, Package, Bell
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/marketplace/notifications/');
            const unread = response.data.results?.filter((n: any) => !n.is_read).length || 0;
            setUnreadCount(unread);
        } catch (err) {
            console.error("Failed to fetch unread count", err);
        }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Determine role from URL or localStorage
    if (pathname.includes('/provider')) setRole('provider');
    else if (pathname.includes('/customer')) setRole('customer');
    else {
        const storedRole = localStorage.getItem('user_role');
        setRole(storedRole);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  return (
    <div className="w-72 border-r border-white/5 bg-black h-screen sticky top-0 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-12 px-2">
        <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">Smart<span className="text-blue-500">Dash</span></span>
        </Link>
      </div>

      <div className="space-y-2 flex-grow">
        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-4 px-4">Management</p>
        
        {role === 'provider' ? (
          <>
            <SidebarItem 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="Overview" 
              href="/dashboard/provider" 
              active={pathname === '/dashboard/provider'}
            />
            <SidebarItem 
              icon={<PlusCircle className="w-5 h-5" />} 
              label="New Service" 
              href="/dashboard/provider/services/new" 
              active={pathname === '/dashboard/provider/services/new'}
            />
            <SidebarItem 
              icon={<ShoppingBag className="w-5 h-5" />} 
              label="My Services" 
              href="/dashboard/provider/services" 
              active={pathname === '/dashboard/provider/services'}
            />
            <SidebarItem 
              icon={<Calendar className="w-5 h-5" />} 
              label="Incoming Bookings" 
              href="/dashboard/provider/bookings" 
              active={pathname === '/dashboard/provider/bookings'}
            />
          </>
        ) : (
          <>
            <SidebarItem 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="My Dashboard" 
              href="/dashboard/customer" 
              active={pathname === '/dashboard/customer'}
            />
            <SidebarItem 
              icon={<Package className="w-5 h-5" />} 
              label="My Bookings" 
              href="/dashboard/customer/bookings" 
              active={pathname.includes('/bookings')}
            />
             <SidebarItem 
              icon={<ShoppingBag className="w-5 h-5" />} 
              label="Explore Services" 
              href="/" 
            />
          </>
        )}

        <div className="pt-4 mt-4 border-t border-white/5">
            <Link 
                href="/dashboard/notifications"
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                    pathname === '/dashboard/notifications'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
            >
                <div className="flex items-center gap-3">
                    <Bell className={`w-5 h-5 ${pathname === '/dashboard/notifications' ? 'text-white' : 'text-neutral-500 group-hover:text-blue-400'}`} />
                    <span className="font-bold text-sm tracking-tight">Notifications</span>
                </div>
                {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {unreadCount}
                    </span>
                )}
            </Link>
        </div>
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
        <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-red-500/10 hover:text-red-500 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-bold text-sm tracking-tight">Logout</span>
        </button>
      </div>
    </div>
  );
}
