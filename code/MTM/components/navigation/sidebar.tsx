'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from 'next-themes';

// Ícones
import { 
  RiDashboardLine, 
  RiServerLine,
  RiGlobalLine,
  RiAppsLine, 
  RiDatabase2Line,
  RiShieldLine,
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
  { name: 'Servidor', href: '/servidor', icon: RiServerLine },
  { name: 'Domínios', href: '/dominios', icon: RiGlobalLine },
  { name: 'Aplicativos', href: '/aplicativos', icon: RiAppsLine },
  { name: 'Backups', href: '/backups', icon: RiDatabase2Line },
  { name: 'Segurança', href: '/seguranca', icon: RiShieldLine },
  { name: 'Meu Perfil', href: '/perfil', icon: RiUserSettingsLine },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  // Controle responsivo
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 800) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Checa o tamanho inicial
    setMounted(true);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Não renderiza nada até o componente estar montado
  if (!mounted) {
    return null;
  }

  return (
    <div className="relative">
      {/* Botão de Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          fixed z-50 p-1 rounded-full bg-gray-800 dark:bg-zinc-950 text-gray-400 
          hover:text-white transition-all duration-300 border border-gray-700 dark:border-zinc-800
          ${collapsed 
            ? 'left-16' 
            : 'left-64'
          }
          top-16
          -translate-x-1/2 -translate-y-1/2
        `}
        aria-label={collapsed ? 'Expandir menu' : 'Retrair menu'}
      >
        {collapsed ? (
          <RiArrowRightSLine className="w-3.5 h-3.5" />
        ) : (
          <RiArrowLeftSLine className="w-3.5 h-3.5" />
        )}
      </button>

      <aside 
        className={`
          fixed left-0 top-0 h-full bg-gray-800 dark:bg-zinc-950 text-white transition-all duration-300
          ${collapsed ? 'w-16' : 'w-64'}
          flex flex-col justify-between
        `}
      >
        {/* Perfil */}
        <div className="flex flex-col items-center">
          <div className="w-full flex flex-col items-center p-4 border-b border-gray-700/30 dark:border-zinc-800/30">
            <div className="w-12 h-12 mb-2">
              <Image
                src={profile?.perfil || 'https://studio.rardevops.com/storage/v1/object/public/mtm/user_mtm.png'}
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full"
                priority
              />
            </div>
            {!collapsed && profile?.nome && (
              <span className="text-sm text-gray-300 truncate max-w-[180px]">
                {profile.nome.split(' ').filter((_, i, arr) => i === 0 || i === arr.length - 1).join(' ')}
              </span>
            )}
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center p-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-gray-400 hover:bg-gray-700 dark:hover:bg-zinc-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {!collapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer com Theme Toggle e Logout */}
        <div className="p-4 border-t border-gray-700 dark:border-zinc-900">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center p-2 text-gray-400 hover:bg-gray-700 dark:hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
              >
                {theme === 'dark' ? (
                  <RiSunLine className="w-5 h-5" />
                ) : (
                  <RiMoonLine className="w-5 h-5" />
                )}
                {!collapsed && (
                  <span className="ml-3">
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={signOut}
                className="w-full flex items-center p-2 text-gray-400 hover:bg-gray-700 dark:hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
              >
                <RiLogoutBoxLine className="w-5 h-5" />
                {!collapsed && <span className="ml-3">Sair</span>}
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
