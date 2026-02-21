'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './Dashboard.module.css'
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Gavel, 
  UploadCloud, 
  LogOut, 
  ChevronLeft, 
  Menu 
} from 'lucide-react'

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  const navItems = [
    { label: 'OVERVIEW', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'PORTFOLIO', path: '/dashboard/portfolio', icon: <ImageIcon size={18} /> },
    { label: 'BIDDING', path: '/dashboard/bidding', icon: <Gavel size={18} /> },
    { label: 'UPLOAD', path: '/dashboard/upload', icon: <UploadCloud size={18} /> },
  ]

  return (
    <div className={styles.layoutWrapper}>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        <button className={styles.toggleBtn} onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={styles.sidebarHeader}>
          <div className={styles.brandDot}>●</div>
          {!isCollapsed && <span className={styles.brandName}>ATELIER.</span>}
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`${styles.navLink} ${pathname === item.path ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              {!isCollapsed && <span className={styles.label}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <footer className={styles.sidebarFooter}>
          <button onClick={handleSignOut} className={styles.signOutBtn}>
            <LogOut size={18} />
            {!isCollapsed && <span>EXIT STUDIO</span>}
          </button>
        </footer>
      </aside>

      <main className={styles.mainContent}>{children}</main>
    </div>
  )
}