'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userInitial, setUserInitial] = useState('U');
  const [userName, setUserName] = useState('User');
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUserInitial(user.email.charAt(0).toUpperCase());
        setUserName(user.email.split('@')[0]);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-tag">THE VELVETEEN PROJECT</div>
          <div className="brand-name">Eco<span>Agent</span></div>
          <div className="brand-sub">RISK MONITORING SYSTEM v2.0</div>
        </div>

        <nav className="sidebar-nav">
          <Link 
            href="/dashboard" 
            className={`nav-item-link ${pathname === '/dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon text-center w-5">◈</span> DASHBOARD
          </Link>
          <Link 
            href="/dashboard/history" 
            className={`nav-item-link ${pathname === '/dashboard/history' ? 'active' : ''}`}
          >
            <span className="nav-icon text-center w-5">≡</span> {t('dashboard.history').toUpperCase()}
          </Link>
          <Link 
            href="/dashboard/settings" 
            className={`nav-item-link ${pathname === '/dashboard/settings' ? 'active' : ''}`}
          >
            <span className="nav-icon text-center w-5">⚙</span> {t('dashboard.settings').toUpperCase()}
          </Link>
          
          <button 
            onClick={handleSignOut}
            className="nav-item-link mt-auto hover:text-risk-critical hover:bg-risk-critical/10"
          >
            <span className="nav-icon text-center w-5">←</span> LOGOUT
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sys-status">
            <div className="status-dot"></div>
            SUPABASE · ONLINE
          </div>
          <div className="sys-status mt-2">
            <div className="status-dot" style={{ background: 'var(--primary)' }}></div>
            SDE_ENGINE · STANDBY
          </div>
        </div>
      </aside>

      {/* Main & Topbar */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-title">RISK MONITORING SYSTEM</div>
          <div className="topbar-sep"></div>
          <div className="topbar-path">
            {t('topbar.region_prefix')} · {t('topbar.region_name')}
          </div>
          
          <div className="topbar-right">
            <div className="topbar-badge">MVP · v2.0.0</div>
            <div className="user-chip" title="Active User">
              <div className="user-avatar">{userInitial}</div>
              <div className="user-name">{userName}</div>
            </div>
          </div>
        </header>

        {/* Content Render */}
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
}
