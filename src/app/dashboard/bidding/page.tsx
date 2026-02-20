'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import styles from './BiddingPage.module.css' 
import { Gavel, Clock, TrendingUp, ChevronRight, Loader2 } from 'lucide-react'

export default function ArtistBiddingDashboard() {
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('is_auction', true)
        .order('created_at', { ascending: false })

      if (!error) setAuctions(data || [])
      setLoading(false)
    }

    fetchAuctions()

    // Realtime listener to update the dashboard when someone bids
    const channel = supabase
      .channel('auction-updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'artworks' }, 
        (payload) => {
          setAuctions((prev) => 
            prev.map(art => art.id === payload.new.id ? payload.new : art)
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  if (loading) return (
    <div className={styles.loader}>
      <Loader2 className="animate-spin" size={24} />
      <span>Accessing Auction Records...</span>
    </div>
  )

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <TrendingUp className={styles.iconRed} />
          <h1>Live Bidding Monitor</h1>
        </div>
        <p>Real-time oversight of your active atelier auctions.</p>
      </header>

      <div className={styles.statsOverview}>
        <div className={styles.statCard}>
          <span className={styles.label}>Active Auctions</span>
          <h2>{auctions.length}</h2>
        </div>
        <div className={styles.statCard}>
          <span className={styles.label}>Potential Revenue</span>
          <h2>${auctions.reduce((sum, art) => sum + (art.current_bid || art.price || 0), 0).toLocaleString()}</h2>
        </div>
      </div>

      <section className={styles.auctionList}>
        {auctions.length > 0 ? (
          auctions.map((art) => (
            <div key={art.id} className={styles.biddingRow}>
              <div className={styles.artInfo}>
                <img src={art.image_url} alt={art.title} className={styles.thumbnail} />
                <div>
                  <h3>{art.title}</h3>
                  <span className={styles.label}>{art.medium}</span>
                </div>
              </div>

              <div className={styles.bidDetails}>
                <div className={styles.dataPoint}>
                  <span className={styles.label}>Current High Bid</span>
                  <span className={styles.value}>${(art.current_bid || art.price || 0).toLocaleString()}</span>
                </div>
                <div className={styles.dataPoint}>
                  <span className={styles.label}>Status</span>
                  <span className={styles.value} style={{color: '#ff3b30'}}>● LIVE</span>
                </div>
              </div>

              <button className={styles.manageBtn}>
                VIEW HISTORY <ChevronRight size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className={styles.statCard} style={{textAlign: 'center', padding: '60px'}}>
            <Gavel size={40} style={{margin: '0 auto 20px'}} />
            <p>No active auctions detected.</p>
            <span className={styles.label}>Toggle an artwork to "Bidding" in your portfolio to see it here.</span>
          </div>
        )}
      </section>
    </div>
  )
}