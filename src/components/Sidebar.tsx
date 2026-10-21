import { LayoutDashboard, Users, CalendarRange, Wallet, Music, HelpCircle, ClipboardList, LogOut } from 'lucide-react';
import type { MemberRole } from '@/types';
import { canEditFinances } from '@/lib/permissions';
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { ThemeToggle } from '@/components/ThemeToggle';

export type ViewName = 'dashboard' | 'members' | 'periods' | 'dues' | 'songs' | 'quiz' | 'activity';

interface SidebarProps {
  current: ViewName;
  onNavigate: (view: ViewName) => void;
  memberCount: number;
  songCount?: number;
  activityCount?: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  userEmail: string | null;
  userRole: MemberRole;
}

const navItems: { id: ViewName; label: string; emoji: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', emoji: '📊', icon: LayoutDashboard },
  { id: 'songs', label: 'Music Library', emoji: '🎵', icon: Music },
  { id: 'members', label: 'Members', emoji: '👥', icon: Users },
  { id: 'periods', label: 'Dues Periods', emoji: '📅', icon: CalendarRange, adminOnly: true },
  { id: 'dues', label: 'Dues Tracking', emoji: '💳', icon: Wallet },
  { id: 'quiz', label: 'Music Quiz', emoji: '🎯', icon: HelpCircle },
  { id: 'activity', label: 'Activity Log', emoji: '📜', icon: ClipboardList, adminOnly: true },
];

export function Sidebar({ current, onNavigate, memberCount, songCount = 0, mobileOpen, onCloseMobile, onLogout, userEmail, userRole }: SidebarProps) {
  const visibleItems = navItems.filter((item) => !item.adminOnly || canEditFinances(userRole, userEmail));

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
        <img src="/logo.png" alt="Choir Logo" className="h-10 w-10 rounded-lg object-cover" />
        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white">Choir Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Member & Dues Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-sky-50 text-sky-700 shadow-sm dark:bg-sky-950/60 dark:text-sky-300'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="text-base select-none" aria-hidden="true">{item.emoji}</span>
              <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
              {item.id === 'members' && memberCount > 0 && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
                    active
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {memberCount}
                </span>
              )}
              {item.id === 'songs' && songCount > 0 && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
                    active
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {songCount}
                </span>
              )}
              {item.id === 'activity' && (
                <span
                  className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                    active
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle in Menu Bar */}
      <div className="border-t border-slate-200 px-3 py-2 dark:border-slate-800">
        <ThemeToggle variant="sidebar" />
      </div>

      {/* PWA Install Button */}
      <div className="px-3 pb-2">
        <PWAInstallButton variant="sidebar" />
      </div>

      {/* User & Logout */}
      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        {userEmail && (
          <p className="truncate px-2 pb-2 text-xs text-slate-400 dark:text-slate-500" title={userEmail}>{userEmail}</p>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        >
          <span className="text-base select-none" aria-hidden="true">🚪</span>
          <LogOut className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
    </>
  );
}
