'use client'

import { supabase } from '@/src/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './Collector.module.css'
import { LogOut, User } from 'lucide-react'

export default function CollectorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  const navLinks = [
    { label: 'EXHIBITION', path: '/collector' },
    { label: 'MY ACQUISITIONS', path: '/collector/bids' },
    { label: 'ARTIST PROFILE', path: '/collector/artist' },
  ]

  return (
    <div className={styles.collectorWrapper}>
      <nav className={styles.topNav}>
        <div className={styles.navLeft}>
          <div className={styles.brandDot}>●</div>
          <span className={styles.brandName}>ATELIER GALLERY</span>
        </div>

        <div className={styles.navCenter}>
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`${styles.navLink} ${pathname === link.path ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.navRight}>
          <button onClick={handleSignOut} className={styles.logoutIconButton} title="Sign Out">
            <LogOut size={16} strokeWidth={1.5} />
            <span className={styles.logoutText}>SIGN OUT</span>
          </button>
        </div>
      </nav>

      <main className={styles.galleryContent}>{children}</main>
    </div>
  )
}