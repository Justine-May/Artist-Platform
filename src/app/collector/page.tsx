'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import styles from './Collector.module.css'
import { Gavel, Heart, ShoppingBag, Clock, ArrowUpRight } from 'lucide-react'

export default function CollectorDashboard() {
  const [activeBids, setActiveBids] = useState<any[]>([])
  const [purchased, setPurchased] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCollectorData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Fetch auctions where the user is the highest bidder
      const { data: bids } = await supabase
        .from('artworks')
        .select('*')
        .eq('is_auction', true)
        .eq('highest_bidder_id', user.id) // You'll need this column in your DB

      // 2. Fetch completed purchases
      const { data: bought } = await supabase
        .from('artworks')
        .select('*')
        .eq('buyer_id', user.id)

      setActiveBids(bids || [])
      setPurchased(bought || [])
      setLoading(false)
    }
    fetchCollectorData()
  }, [])

  if (loading) return <div className={styles.loading}>Entering the Atelier...</div>

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Collector's Portfolio</h1>
        <p>Manage your acquisitions and active bids.</p>
      </header>

      <div className={styles.grid}>
        {/* --- SECTION: ACTIVE BIDS --- */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Gavel size={20} /> <h2>Your Active Bids</h2>
          </div>
          <div className={styles.list}>
            {activeBids.map(bid => (
              <div key={bid.id} className={styles.collectorCard}>
                <img src={bid.image_url} alt="" />
                <div className={styles.cardContent}>
                  <h3>{bid.title}</h3>
                  <div className={styles.statusLine}>
                    <span className={styles.highBid}>Highest Bid: ${bid.current_bid}</span>
                    <span className={styles.timer}><Clock size={12}/> 4h 20m</span>
                  </div>
                </div>
                <ArrowUpRight size={18} className={styles.linkIcon} />
              </div>
            ))}
            {activeBids.length === 0 && <p className={styles.empty}>No active bids at the moment.</p>}
          </div>
        </section>

        {/* --- SECTION: OWNED ARTWORKS --- */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <ShoppingBag size={20} /> <h2>Your Collection</h2>
          </div>
          <div className={styles.collectionGrid}>
            {purchased.map(art => (
              <div key={art.id} className={styles.ownedArt}>
                <img src={art.image_url} alt={art.title} />
                <div className={styles.ownedOverlay}>
                  <span>Collected</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}