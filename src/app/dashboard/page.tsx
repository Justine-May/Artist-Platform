'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import styles from './Dashboard.module.css'
import { Gavel, Image as ImageIcon, PlusCircle, Activity } from 'lucide-react'
import Link from 'next/link'

export default function ArtistDashboard() {
  const [stats, setStats] = useState({ totalArt: 0, activeAuctions: 0 })

  useEffect(() => {
    async function fetchStats() {
      const { count: artCount } = await supabase.from('artworks').select('*', { count: 'exact', head: true })
      const { count: auctionCount } = await supabase.from('artworks').select('*', { count: 'exact', head: true }).eq('is_auction', true)
      setStats({ totalArt: artCount || 0, activeAuctions: auctionCount || 0 })
    }
    fetchStats()
  }, [])

  return (
    <div className={styles.dashboardGrid}>
      <header className={styles.dashHeader}>
        <h1>STUDIO OVERVIEW</h1>
        <p>Manage your figurations and collections.</p>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <ImageIcon size={20} />
          <span>{stats.totalArt} Works in Portfolio</span>
        </div>
        <div className={styles.statCard}>
          <Gavel size={20} />
          <span>{stats.activeAuctions} Active Auctions</span>
        </div>
      </div>

      <div className={styles.quickActions}>
        <Link href="/dashboard/upload" className={styles.actionBtn}>
          <PlusCircle size={20} /> NEW UPLOAD
        </Link>
        <Link href="/dashboard/bidding" className={styles.actionBtn}>
          <Activity size={20} /> MANAGE BIDS
        </Link>
      </div>
    </div>
  )
}