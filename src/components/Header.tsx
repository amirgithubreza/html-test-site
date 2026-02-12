import type { User, Page } from '../types';

interface HeaderProps {
  user: User;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function Header({ user, currentPage, onNavigate, onLogout }: HeaderProps) {
  const navItems: { page: Page; label: string; icon: string }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { page: 'history', label: 'History', icon: '📊' },
    ...(user.isAdmin ? [{ page: 'admin' as Page, label: 'Admin Panel', icon: '⚙️' }] : []),
  ];

  return (
    <header className="glass fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-lg">🧠</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
              CodeQuiz
            </span>
          </button>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                  currentPage === item.page
                    ? 'bg-violet-500/20 text-violet-300 shadow-inner'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                user.isGuest
                  ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                  : 'bg-gradient-to-br from-violet-400 to-cyan-400'
              }`}>
                {user.isGuest ? '👤' : user.username[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-300 font-medium">{user.username}</span>
              {user.isAdmin && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                  ADMIN
                </span>
              )}
              {user.isGuest && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400">
                  GUEST
                </span>
              )}
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all duration-200"
            >
              {user.isGuest ? 'Exit' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
