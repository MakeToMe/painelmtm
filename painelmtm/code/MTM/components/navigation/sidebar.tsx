'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from 'next-themes';
import { Link2 } from 'lucide-react';

// Ícones
import { 
  RiDashboardLine, 
  RiGlobalLine,
  RiAppsLine, 
  RiDatabase2Line,
  RiUserSettingsLine,
  RiSunLine,
  RiMoonLine,
  RiLogoutBoxLine,
  RiArrowLeftSLine,
  RiArrowRightSLine
} from 'react-icons/ri';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: RiDashboardLine },
  { name: 'Integrações', href: '/integracoes', icon: Link2 },
  { name: 'Domínios', href: '/dominios', icon: RiGlobalLine },
  { name: 'Aplicativos', href: '/aplicativos', icon: RiAppsLine },
  { name: 'Backups', href: '/backups', icon: RiDatabase2Line },
  { name: 'Meu Perfil', href: '/perfil', icon: RiUserSettingsLine },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme()
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  // Adiciona detecção de largura da tela e controle de montagem
  useEffect(() => {
    setMounted(true)
    
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      } else {
        setCollapsed(false)
      }
    }

    // Configura o estado inicial
    handleResize()

    // Adiciona listener para mudanças de tamanho
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Renderiza um placeholder durante a hidratação
  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 h-full w-64 bg-card z-50" />
    )
  }

  return (
    <>
      {/* Botão de Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          fixed z-[60] p-1.5 rounded-full bg-card text-muted-foreground
          hover:text-card-foreground transition-all duration-300 border border-border
          ${collapsed 
            ? 'left-16' 
            : 'left-64'
          }
          top-6
          lg:hidden
        `}
        aria-label={collapsed ? 'Expandir menu' : 'Retrair menu'}
      >
        {collapsed ? (
          <RiArrowRightSLine className="w-4 h-4" />
        ) : (
          <RiArrowLeftSLine className="w-4 h-4" />
        )}
      </button>

      <aside 
        className={`
          fixed left-0 top-0 h-full bg-[#0A0F1B] text-card-foreground 
          transition-all duration-300 z-50
          ${collapsed ? 'w-16' : 'w-64'}
          flex flex-col justify-between border-r border-border/30
        `}
      >
        {/* Perfil */}
        <div className="flex flex-col items-center">
          <div className="w-full flex flex-col items-center p-4 border-b border-border/30">
            <div className="relative w-12 h-12 mb-2">
              <Image
                src={profile?.perfil || 'https://studio.rardevops.com/storage/v1/object/public/mtm/user_mtm.png'}
                alt="Avatar"
                fill
                className="rounded-full object-cover"
                priority
              />
            </div>
            {!collapsed && profile?.nome && (
              <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                {profile.nome.split(' ').filter((_, i, arr) => i === 0 || i === arr.length - 1).join(' ')}
              </span>
            )}
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className={`flex-1 ${collapsed ? 'px-3' : 'p-4'}`}>
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`sidebar-item ${collapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : ''}`}
                    data-active={isActive}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="ml-3 truncate">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer com Theme Toggle e Logout */}
        <div className={`border-t border-border/30 ${collapsed ? 'px-3 py-4' : 'p-4'}`}>
          <ul className="space-y-2">
            {/* Botão Contratar servidor */}
            <li>
              <Link
                href="/contratar-servidor"
                className={`sidebar-item w-full bg-emerald-500/10 hover:bg-emerald-500/15 btn-neomorphic ${collapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : ''}`}
                data-active={pathname === '/contratar-servidor'}
              >
                <RiArrowRightSLine className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                {!collapsed && (
                  <span className="ml-3 truncate">Contratar servidor</span>
                )}
              </Link>
            </li>
            
            <li>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`sidebar-item w-full ${collapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : ''}`}
                data-active={false}
              >
                {theme === 'dark' ? (
                  <RiSunLine className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <RiMoonLine className="w-5 h-5 flex-shrink-0" />
                )}
                {!collapsed && (
                  <span className="ml-3 truncate">
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={signOut}
                className={`sidebar-item w-full ${collapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : ''}`}
                data-active={false}
              >
                <RiLogoutBoxLine className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="ml-3 truncate">Sair</span>}
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}
