'use client'

import { useState } from 'react'
import { LayoutDashboard, Upload, Palette, Gavel, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Dashboard.module.css'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={22}/>, path: '/dashboard' },
    { name: 'Upload Artwork', icon: <Upload size={22}/>, path: '/dashboard/upload' },
    { name: 'Portfolio', icon: <Palette size={22}/>, path: '/dashboard/portfolio' },
    { name: 'Bidding', icon: <Gavel size={22}/>, path: '/dashboard/bidding' },
  ]

  return (
    <div className={styles.container}>
      {/* THE ONLY SIDEBAR */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          {!isCollapsed && <span className={styles.logo}>muro</span>}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className={styles.toggleBtn}
          >
            {isCollapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.path} 
              className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT FEED - This will now fill the screen correctly */}
      <main className={styles.mainFeed}>
        {children}
      </main>
    </div>
  )
}