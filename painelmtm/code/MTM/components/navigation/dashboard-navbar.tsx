'use client';

import { useAuth } from '@/contexts/auth-context';
import { RiSettings4Line } from 'react-icons/ri';

export function DashboardNavbar() {
  const { profile } = useAuth();

  return (
    <div className="dashboard-navbar">
      <div className="w-full h-full flex items-center justify-end p-4 pl-16 lg:pl-64">
        <div className="flex items-center gap-4">
          <button 
            className="p-2 rounded-full bg-card hover:bg-muted/10 transition-colors"
            aria-label="Configurações"
          >
            <RiSettings4Line className="w-5 h-5 text-primary" />
          </button>
          <div className="flex items-center gap-2 bg-muted/10 backdrop-blur-sm rounded-md px-3 py-1.5 border border-white/5">
            <img
              src={profile?.perfil || 'https://studio.rardevops.com/storage/v1/object/public/mtm/user_mtm.png'}
              alt="Foto de perfil"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-white font-medium">
              {profile?.nome?.split(' ')[0] || 'Usuário'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
